from datetime import datetime, timedelta
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...models.scan import Scan
from ...models.user import User
from ...models.violation import Violation
from ...services.pdf_service import PDFReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/summary")
def report_summary(
    days: int = 30,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Return a compact compliance report for the requested period."""
    days = max(1, min(days, 365))
    start = datetime.now() - timedelta(days=days)
    scans = db.query(Scan).filter(Scan.created_at >= start)
    total_scans = scans.count()
    compliant_scans = scans.filter(Scan.is_compliant.is_(True)).count()
    severity_rows = (
        db.query(Violation.severity, func.count(Violation.id))
        .filter(Violation.created_at >= start)
        .group_by(Violation.severity)
        .all()
    )
    return {
        "period_days": days,
        "total_scans": total_scans,
        "compliant_scans": compliant_scans,
        "compliance_rate": round(compliant_scans * 100 / total_scans, 1) if total_scans else 0,
        "violations_by_severity": [
            {"severity": str(severity), "count": count}
            for severity, count in severity_rows
        ],
    }


@router.get("/{scan_id}/pdf")
def get_report_pdf(
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

