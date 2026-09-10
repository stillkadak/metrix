from sqlalchemy import JSON, Column, DateTime, Enum, Float, ForeignKey, String, Text, Uuid
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..core.database import Base

class Violation(Base):
    __tablename__ = "violations"
    
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scan_id = Column(Uuid(as_uuid=True), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    rule_code = Column(String(50), nullable=False)
    rule_description = Column(Text, nullable=False)
    field_name = Column(String(100))
    extracted_value = Column(Text)
    expected_value = Column(Text)
    bounding_box = Column(JSON)
    confidence = Column(Float)
    severity = Column(Enum('critical', 'major', 'minor', name='severity_level'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    scan = relationship("Scan", back_populates="violations")
