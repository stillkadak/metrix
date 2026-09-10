from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Uuid
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..core.database import Base

class Scan(Base):
    __tablename__ = "scans"
    
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    product_id = Column(Uuid(as_uuid=True), ForeignKey("products.id"), nullable=True)
    image_path = Column(String(1000), nullable=False)
    thumbnail_path = Column(String(1000))
    ocr_text = Column(String(10000))
    ocr_confidence = Column(Float)
    compliance_score = Column(Float)
    is_compliant = Column(Boolean)
    scan_date = Column(DateTime(timezone=True), server_default=func.now())
    location_lat = Column(Float)
    location_lng = Column(Float)
    device_info = Column(String(500))
    processing_time_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    violations = relationship("Violation", back_populates="scan", cascade="all, delete-orphan")
