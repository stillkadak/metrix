from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from .violation import ViolationResponse

class ScanBase(BaseModel):
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    device_info: Optional[str] = None

class ScanCreate(ScanBase):
    product_id: Optional[UUID] = None

class ScanUpload(BaseModel):
    file_name: str
    content_type: str

class ScanResponse(ScanBase):
    id: UUID
    user_id: UUID
    product_id: Optional[UUID]
    image_path: str
    thumbnail_path: Optional[str]
    ocr_text: Optional[str]
    ocr_confidence: Optional[float]
    compliance_score: Optional[float]
    is_compliant: Optional[bool]
    scan_date: datetime
    processing_time_ms: Optional[int]
    violations: List[ViolationResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
