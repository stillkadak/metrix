from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any

class ViolationBase(BaseModel):
    rule_code: str
    rule_description: str
    field_name: Optional[str] = None
    extracted_value: Optional[str] = None
    expected_value: Optional[str] = None
    bounding_box: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    severity: str

class ViolationCreate(ViolationBase):
    scan_id: UUID

class ViolationResponse(ViolationBase):
    id: UUID
    scan_id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
