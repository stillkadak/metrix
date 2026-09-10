import re
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class FieldExtractor:
    """Extract compliance fields from OCR text"""
    
    def __init__(self):
        self.patterns = {
            'mrp': [
                r'(?:MRP|mrp|M\.R\.P\.)\s*[:.]?\s*Rs\.?\s*([\d,]+\.?[\d]*)',
                r'(?:MRP|mrp|M\.R\.P\.)\s*[:.]?\s*₹\s*([\d,]+\.?[\d]*)',
                r'Rs\.?\s*([\d,]+\.?[\d]*)\s*(?:MRP|mrp)',
                r'₹\s*([\d,]+\.?[\d]*)\s*(?:MRP|mrp)',
                r'Price\s*[:.]?\s*Rs\.?\s*([\d,]+\.?[\d]*)',
                r'Max\s*Retail\s*Price\s*[:.]?\s*Rs\.?\s*([\d,]+\.?[\d]*)',
            ],
            'net_quantity': [
                r'Net\s*(?:Wt|Qty|Quantity)\s*[:.]?\s*([\d.]+)\s*(g|kg|ml|l|gm)',
                r'(?:Weight|Wt)\s*[:.]?\s*([\d.]+)\s*(g|kg|ml|l|gm)',
                r'Qty\s*[:.]?\s*([\d.]+)\s*(g|kg|ml|l|gm)',
                r'Net\s*Contents?\s*[:.]?\s*([\d.]+)\s*(g|kg|ml|l|gm)',
            ],
            'manufacturing_date': [
                r'(?:Mfg|MFG|Manufactured|Mfr)\s*[:.]?\s*(\d{2}[/-]\d{2}[/-]\d{4})',
                r'(?:Mfg|MFG|Manufactured|Mfr)\s*[:.]?\s*(\d{2}[/-]\d{2}[/-]\d{2})',
                r'(?:Date of Manufacture|DOM)\s*[:.]?\s*(\d{2}[/-]\d{2}[/-]\d{4})',
            ],
            'expiry_date': [
                r'(?:Exp|EXP|Expiry|Best Before|Use Before)\s*[:.]?\s*(\d{2}[/-]\d{2}[/-]\d{4})',
                r'(?:Exp|EXP|Expiry|Best Before|Use Before)\s*[:.]?\s*(\d{2}[/-]\d{2}[/-]\d{2})',
            ],
            'manufacturer': [
                r'(?:Mfg\.?|Manufactured|Manufacturer)\s*[:.]?\s*By\s*[:.]?\s*(.+?)(?:\n|$)',
                r'(?:Mfg\.?|Manufactured|Manufacturer)\s*[:.]?\s*(.+?)(?:\n|$)',
                r'(?:Made by|Produced by)\s*[:.]?\s*(.+?)(?:\n|$)',
            ],
            'country_of_origin': [
                r'(?:Made in|Country of Origin|Origin)\s*[:.]?\s*([A-Za-z\s]+)',
                r'Product of\s*[:.]?\s*([A-Za-z\s]+)',
            ],
            'consumer_care': [
                r'(?:Consumer Care|Customer Care|Helpline|Contact)\s*[:.]?\s*(.+?)(?:\n|$)',
                r'Ph\.?\s*[:.]?\s*([\d\s\-\(\)]+)',
                r'Email\s*[:.]?\s*([\w\.-]+@[\w\.-]+\.\w+)',
            ]
        }
    
    def extract_all_fields(self, text: str, blocks: List[Dict]) -> Dict[str, Any]:
        """Extract all fields from OCR text"""
        extracted = {
            'mrp': None,
            'net_quantity': None,
            'net_quantity_unit': None,
            'manufacturing_date': None,
            'expiry_date': None,
            'manufacturer': None,
            'manufacturer_address': None,
            'country_of_origin': None,
            'consumer_care': None,
            'brand': None,
            'product_name': None,
        }
        
        # Extract MRP
        mrp_result = self._extract_field(text, 'mrp')
        if mrp_result:
            extracted['mrp'] = mrp_result
        
        # Extract Net Quantity
        net_qty = self._extract_net_quantity(text)
        if net_qty:
            extracted['net_quantity'] = net_qty['value']
            extracted['net_quantity_unit'] = net_qty['unit']
        
        # Extract Manufacturing Date
        mfg_date = self._extract_field(text, 'manufacturing_date')
        if mfg_date:
            extracted['manufacturing_date'] = mfg_date
        
        # Extract Expiry Date
        exp_date = self._extract_field(text, 'expiry_date')
        if exp_date:
            extracted['expiry_date'] = exp_date
        
        # Extract Manufacturer
        manufacturer = self._extract_field(text, 'manufacturer')
        if manufacturer:
            extracted['manufacturer'] = manufacturer
        
        # Extract Country of Origin
        country = self._extract_field(text, 'country_of_origin')
        if country:
            extracted['country_of_origin'] = country
        
        # Extract Consumer Care
        consumer_care = self._extract_field(text, 'consumer_care')
        if consumer_care:
            extracted['consumer_care'] = consumer_care
        
        # Extract product name and brand (using heuristics)
        extracted['product_name'] = self._extract_product_name(text)
        extracted['brand'] = self._extract_brand(text)
        
        return extracted
    
    def _extract_field(self, text: str, field_type: str) -> Optional[str]:
        """Extract a specific field using regex patterns"""
        patterns = self.patterns.get(field_type, [])
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                # Return the captured group
                if match.groups():
                    # Clean up the result
                    result = match.group(1).strip()
                    # Remove extra spaces and special characters
                    result = re.sub(r'\s+', ' ', result)
                    return result
        
        return None
    
    def _extract_net_quantity(self, text: str) -> Optional[Dict]:
        """Extract net quantity with unit"""
        patterns = self.patterns['net_quantity']
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                return {
                    'value': match.group(1).strip(),
                    'unit': match.group(2).strip().lower()
                }
        return None
    
    def _extract_product_name(self, text: str) -> Optional[str]:
        """Extract product name using heuristics"""
        # Look for common patterns
        patterns = [
            r'Product\s*[:.]?\s*(.+?)(?:\n|$)',
            r'Name\s*[:.]?\s*(.+?)(?:\n|$)',
            r'Description\s*[:.]?\s*(.+?)(?:\n|$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                return match.group(1).strip()
        
        # Try to find the first line that's not a label
        lines = text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if line and len(line) > 3 and not re.match(r'^(MRP|Rs|Net|Mfg|Exp|Price)', line, re.IGNORECASE):
                return line
        
        return None
    
    def _extract_brand(self, text: str) -> Optional[str]:
        """Extract brand name"""
        patterns = [
            r'Brand\s*[:.]?\s*(.+?)(?:\n|$)',
            r'Brand Name\s*[:.]?\s*(.+?)(?:\n|$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                return match.group(1).strip()
        
        return None