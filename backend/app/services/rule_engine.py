from typing import Dict, List, Any, Optional
import re
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class RuleEngine:
    """Compliance rule engine for Legal Metrology (Packaged Commodities) Rules, 2011"""
    
    def __init__(self):
        self.rules = self._load_rules()
    
    def _load_rules(self) -> List[Dict]:
        """Load rules from configuration"""
        return [
            {
                'code': 'R001',
                'name': 'MRP Declaration',
                'description': 'Maximum Retail Price must be clearly declared on the package',
                'severity': 'critical',
                'check': self.check_mrp_presence
            },
            {
                'code': 'R002',
                'name': 'MRP Format',
                'description': 'MRP must be in proper format with Rs. or ₹ symbol',
                'severity': 'major',
                'check': self.check_mrp_format
            },
            {
                'code': 'R003',
                'name': 'Net Quantity Declaration',
                'description': 'Net quantity must be clearly declared on the package',
                'severity': 'critical',
                'check': self.check_net_quantity_presence
            },
            {
                'code': 'R004',
                'name': 'Net Quantity Format',
                'description': 'Net quantity must be in standard units (g, kg, ml, l)',
                'severity': 'major',
                'check': self.check_net_quantity_format
            },
            {
                'code': 'R005',
                'name': 'Manufacturing Date',
                'description': 'Manufacturing date must be declared on the package',
                'severity': 'critical',
                'check': self.check_mfg_date_presence
            },
            {
                'code': 'R006',
                'name': 'Manufacturing Date Format',
                'description': 'Manufacturing date must be in valid format (MM/YYYY or MM/YY)',
                'severity': 'major',
                'check': self.check_mfg_date_format
            },
            {
                'code': 'R007',
                'name': 'Manufacturer Name',
                'description': 'Manufacturer name must be declared on the package',
                'severity': 'critical',
                'check': self.check_manufacturer_presence
            },
            {
                'code': 'R008',
                'name': 'Manufacturer Address',
                'description': 'Manufacturer address must be declared on the package',
                'severity': 'critical',
                'check': self.check_manufacturer_address
            },
            {
                'code': 'R009',
                'name': 'Country of Origin',
                'description': 'Country of origin must be declared for imported products',
                'severity': 'major',
                'check': self.check_country_of_origin
            },
            {
                'code': 'R010',
                'name': 'Consumer Care Contact',
                'description': 'Consumer care contact details must be declared',
                'severity': 'minor',
                'check': self.check_consumer_care
            },
            {
                'code': 'R011',
                'name': 'Font Size Compliance',
                'description': 'Text must be legible and meet minimum size requirements',
                'severity': 'major',
                'check': self.check_font_size
            },
            {
                'code': 'R012',
                'name': 'Principal Display Panel',
                'description': 'Declarations must appear on the principal display panel',
                'severity': 'major',
                'check': self.check_principal_display_panel
            },
        ]
    
    def check_mrp_presence(self, extracted: Dict) -> Optional[Dict]:
        """Check if MRP is present"""
        if not extracted.get('mrp'):
            return {
                'rule_code': 'R001',
                'field_name': 'mrp',
                'extracted_value': None,
                'expected_value': 'MRP value required',
                'confidence': 0.9,
                'description': 'Maximum Retail Price not found on package'
            }
        return None
    
    def check_mrp_format(self, extracted: Dict) -> Optional[Dict]:
        """Check MRP format"""
        mrp = extracted.get('mrp')
        if mrp:
            # Check if it has proper currency symbol
            if not re.search(r'[₹Rs]', str(mrp)):
                return {
                    'rule_code': 'R002',
                    'field_name': 'mrp',
                    'extracted_value': mrp,
                    'expected_value': 'MRP should have ₹ or Rs. prefix',
                    'confidence': 0.8,
                    'description': 'MRP missing proper currency symbol'
                }
        return None
    
    def check_net_quantity_presence(self, extracted: Dict) -> Optional[Dict]:
        """Check if net quantity is present"""
        if not extracted.get('net_quantity'):
            return {
                'rule_code': 'R003',
                'field_name': 'net_quantity',
                'extracted_value': None,
                'expected_value': 'Net quantity value required',
                'confidence': 0.9,
                'description': 'Net quantity not found on package'
            }
        return None
    
    def check_net_quantity_format(self, extracted: Dict) -> Optional[Dict]:
        """Check net quantity format"""
        net_qty = extracted.get('net_quantity')
        unit = extracted.get('net_quantity_unit')
        
        if net_qty and unit:
            valid_units = ['g', 'kg', 'ml', 'l', 'gm', 'ml', 'litre']
            if unit.lower() not in valid_units:
                return {
                    'rule_code': 'R004',
                    'field_name': 'net_quantity',
                    'extracted_value': f"{net_qty} {unit}",
                    'expected_value': f"Valid unit from: {', '.join(valid_units)}",
                    'confidence': 0.8,
                    'description': f'Invalid unit "{unit}" for net quantity'
                }
        return None
    
    def check_mfg_date_presence(self, extracted: Dict) -> Optional[Dict]:
        """Check if manufacturing date is present"""
        if not extracted.get('manufacturing_date'):
            return {
                'rule_code': 'R005',
                'field_name': 'manufacturing_date',
                'extracted_value': None,
                'expected_value': 'Manufacturing date required',
                'confidence': 0.9,
                'description': 'Manufacturing date not found on package'
            }
        return None
    
    def check_mfg_date_format(self, extracted: Dict) -> Optional[Dict]:
        """Check manufacturing date format"""
        mfg_date = extracted.get('manufacturing_date')
        if mfg_date:
            # Check if it matches MM/YYYY or MM/YY format
            if not re.match(r'\d{2}[/-]\d{2,4}', mfg_date):
                return {
                    'rule_code': 'R006',
                    'field_name': 'manufacturing_date',
                    'extracted_value': mfg_date,
                    'expected_value': 'Format: MM/YYYY or MM/YY',
                    'confidence': 0.8,
                    'description': f'Invalid manufacturing date format: {mfg_date}'
                }
        return None
    
    def check_manufacturer_presence(self, extracted: Dict) -> Optional[Dict]:
        """Check if manufacturer name is present"""
        if not extracted.get('manufacturer'):
            return {
                'rule_code': 'R007',
                'field_name': 'manufacturer',
                'extracted_value': None,
                'expected_value': 'Manufacturer name required',
                'confidence': 0.9,
                'description': 'Manufacturer name not found on package'
            }
        return None
    
    def check_manufacturer_address(self, extracted: Dict) -> Optional[Dict]:
        """Check if manufacturer address is present"""
        address = extracted.get('manufacturer_address')
        if not address:
            return {
                'rule_code': 'R008',
                'field_name': 'manufacturer_address',
                'extracted_value': None,
                'expected_value': 'Manufacturer address required',
                'confidence': 0.8,
                'description': 'Manufacturer address not found on package'
            }
        return None
    
    def check_country_of_origin(self, extracted: Dict) -> Optional[Dict]:
        """Check country of origin (for imported products)"""
        # This would need to check if product is imported
        # For now, just check if declared
        country = extracted.get('country_of_origin')
        if country is None:
            return {
                'rule_code': 'R009',
                'field_name': 'country_of_origin',
                'extracted_value': None,
                'expected_value': 'Country of origin should be declared',
                'confidence': 0.7,
                'description': 'Country of origin not declared (required for imports)'
            }
        return None
    
    def check_consumer_care(self, extracted: Dict) -> Optional[Dict]:
        """Check if consumer care contact is present"""
        consumer_care = extracted.get('consumer_care')
        if not consumer_care:
            return {
                'rule_code': 'R010',
                'field_name': 'consumer_care',
                'extracted_value': None,
                'expected_value': 'Consumer care contact required',
                'confidence': 0.7,
                'description': 'Consumer care contact details not found'
            }
        return None
    
    def check_font_size(self, extracted: Dict) -> Optional[Dict]:
        """Check if font size is adequate (simplified)"""
        # This would require actual image analysis
        # For now, we'll do a basic check
        # TODO: Implement actual font size detection
        return None
    
    def check_principal_display_panel(self, extracted: Dict) -> Optional[Dict]:
        """Check if declarations are on principal display panel"""
        # This would require image analysis
        # TODO: Implement actual panel detection
        return None
    
    def evaluate_compliance(self, extracted: Dict) -> Dict[str, Any]:
        """Evaluate all compliance rules"""
        violations = []
        
        for rule in self.rules:
            try:
                result = rule['check'](extracted)
                if result:
                    result['severity'] = rule['severity']
                    result['rule_code'] = rule['code']
                    result['rule_description'] = rule['description']
                    violations.append(result)
            except Exception as e:
                logger.error(f"Error checking rule {rule['code']}: {e}")
        
        # Calculate compliance score
        total_rules = len(self.rules)
        passed_rules = total_rules - len(violations)
        compliance_score = (passed_rules / total_rules) * 100 if total_rules > 0 else 0
        
        is_compliant = len(violations) == 0
        
        # Count violations by severity
        severity_counts = {'critical': 0, 'major': 0, 'minor': 0}
        for v in violations:
            severity = v.get('severity', 'minor')
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        return {
            'is_compliant': is_compliant,
            'compliance_score': compliance_score,
            'violations': violations,
            'severity_counts': severity_counts,
            'rules_checked': total_rules,
            'rules_passed': passed_rules,
            'rules_failed': len(violations)
        }