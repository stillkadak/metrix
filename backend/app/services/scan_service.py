from typing import Dict, Any, Optional
import os
import time
from uuid import UUID
from sqlalchemy.orm import Session
from .ocr_service import OCRService
from .rule_engine import RuleEngine
from ..models.scan import Scan
from ..models.violation import Violation
from ..models.product import Product
import logging

logger = logging.getLogger(__name__)

class ScanService:
    """Service for processing scans"""
    
    def __init__(self):
        self.ocr_service = OCRService()
        self.rule_engine = RuleEngine()
    
    def process_scan(
        self,
        image_path: str,
        user_id: UUID,
        product_id: Optional[UUID] = None,
        location_lat: Optional[float] = None,
        location_lng: Optional[float] = None,
        device_info: Optional[str] = None,
        db: Session = None
    ) -> Dict[str, Any]:
        """Process a scan image"""
        start_time = time.time()
        
        try:
            # 1. Perform OCR
            ocr_result = self.ocr_service.process_package(image_path)
            
            if ocr_result.get('error'):
                return {
                    'success': False,
                    'error': ocr_result['error']
                }
            
            # 2. Extract fields
            extracted_fields = ocr_result.get('extracted_fields', {})
            
            # 3. Evaluate compliance
            compliance_result = self.rule_engine.evaluate_compliance(extracted_fields)
            
            # 4. Save to database
            if db:
                scan = Scan(
                    user_id=user_id,
                    product_id=product_id,
                    image_path=image_path,
                    ocr_text=ocr_result.get('ocr_text', ''),
                    ocr_confidence=ocr_result.get('ocr_confidence', 0.75),
                    compliance_score=compliance_result.get('compliance_score', 0),
                    is_compliant=compliance_result.get('is_compliant', False),
                    location_lat=location_lat,
                    location_lng=location_lng,
                    device_info=device_info,
                    processing_time_ms=int((time.time() - start_time) * 1000)
                )
                db.add(scan)
                db.flush()
                
                # Save violations
                for violation_data in compliance_result.get('violations', []):
                    violation = Violation(
                        scan_id=scan.id,
                        rule_code=violation_data.get('rule_code'),
                        rule_description=violation_data.get('description', ''),
                        field_name=violation_data.get('field_name'),
                        extracted_value=violation_data.get('extracted_value'),
                        expected_value=violation_data.get('expected_value'),
                        confidence=violation_data.get('confidence', 0.8),
                        severity=violation_data.get('severity', 'minor')
                    )
                    db.add(violation)
                
                db.commit()
                db.refresh(scan)
                
                return {
                    'success': True,
                    'scan_id': str(scan.id),
                    'ocr_text': ocr_result.get('ocr_text', ''),
                    'extracted_fields': extracted_fields,
                    'compliance': compliance_result,
                    'processing_time_ms': scan.processing_time_ms,
                    'ocr_engine': ocr_result.get('engine', 'unknown')
                }
            else:
                # Return without saving
                return {
                    'success': True,
                    'ocr_text': ocr_result.get('ocr_text', ''),
                    'extracted_fields': extracted_fields,
                    'compliance': compliance_result,
                    'processing_time_ms': int((time.time() - start_time) * 1000)
                }
                
        except Exception as e:
            logger.error(f"Scan processing failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }