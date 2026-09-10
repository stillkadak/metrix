from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Response
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from uuid import UUID

from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...models.user import User
from ...models.scan import Scan
from ...models.violation import Violation
from ...schemas.scan import ScanResponse
from ...services.scan_service import ScanService
from ...services.pdf_service import PDFReportService
from ...core.config import settings

router = APIRouter(prefix="/scans", tags=["Scans"])

@router.post("/upload", response_model=ScanResponse)
async def upload_scan(
    file: UploadFile = File(...),
    product_id: Optional[UUID] = Form(None),
    location_lat: Optional[float] = Form(None),
    location_lng: Optional[float] = Form(None),
    device_info: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    upload_dir = settings.upload_dir
    os.makedirs(upload_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename or "")[1].lower()
    if file_extension not in {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}:
        raise HTTPException(status_code=400, detail="Unsupported image format")
    file_name = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, file_name)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    scan_service = ScanService()
    result = scan_service.process_scan(
        image_path=file_path,
        user_id=current_user.id,
        product_id=product_id,
        location_lat=location_lat,
        location_lng=location_lng,
        device_info=device_info,
        db=db
    )
    
    if not result.get('success'):
        raise HTTPException(status_code=500, detail=result.get('error', 'Processing failed'))
    
    scan = db.query(Scan).filter(Scan.id == UUID(result['scan_id'])).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    return scan

@router.get("/", response_model=List[ScanResponse])
def list_scans(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_compliant: Optional[bool] = Query(None),
    severity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Scan)
    if current_user.role == 'inspector':
        query = query.filter(Scan.user_id == current_user.id)
    if is_compliant is not None:
        query = query.filter(Scan.is_compliant == is_compliant)
    if severity:
        query = query.join(Scan.violations).filter(Violation.severity == severity).distinct()
    if search:
        query = query.filter(Scan.ocr_text.ilike(f"%{search}%"))
    scans = query.order_by(Scan.created_at.desc()).offset(skip).limit(limit).all()
    return scans

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan(
    scan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if current_user.role == 'inspector' and scan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return scan

@router.get("/{scan_id}/violations")
def get_scan_violations(
    scan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if current_user.role == 'inspector' and scan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return scan.violations

@router.get("/{scan_id}/pdf")
def download_scan_pdf(
    scan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if current_user.role == 'inspector' and scan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    pdf_service = PDFReportService()
    pdf_bytes = pdf_service.generate_pdf(scan, db)
    
    filename = f"LegalMetrix_Report_{str(scan.id)[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'}
    )