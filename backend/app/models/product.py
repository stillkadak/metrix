from sqlalchemy import Column, DateTime, String, Uuid
from sqlalchemy.sql import func
import uuid
from ..core.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(500))
    brand = Column(String(255))
    category = Column(String(100))
    barcode = Column(String(100))
    manufacturer_name = Column(String(500))
    manufacturer_address = Column(String(1000))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
