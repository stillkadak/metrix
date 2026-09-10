from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List, Dict, Any

from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...models.user import User
from ...models.scan import Scan
from ...models.violation import Violation

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard summary statistics"""
    
    # Total scans
    total_scans = db.query(Scan).count()
    
    # Scans today
    today = datetime.now().date()
    scans_today = db.query(Scan).filter(
        func.date(Scan.created_at) == today
    ).count()
    
    # Compliance rate
    compliant_scans = db.query(Scan).filter(Scan.is_compliant == True).count()
    compliance_rate = (compliant_scans / total_scans * 100) if total_scans > 0 else 0
    
    # Total violations
    total_violations = db.query(Violation).count()
    
    # Violations by severity
    severity_counts = db.query(
        Violation.severity,
        func.count(Violation.id)
    ).group_by(Violation.severity).all()
    
    violations_by_severity = [
        {"name": str(severity), "value": count}
        for severity, count in severity_counts
    ]
    
    # Trend data (last 30 days)
    trend_data = []
    for i in range(30, -1, -1):
        date = datetime.now().date() - timedelta(days=i)
        count = db.query(Scan).filter(
            func.date(Scan.created_at) == date
        ).count()
        trend_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "count": count
        })
    
    return {
        "total_scans": total_scans,
        "scans_today": scans_today,
        "compliance_rate": round(compliance_rate, 1),
        "total_violations": total_violations,
        "violations_by_severity": violations_by_severity,
        "trend": trend_data
    }

@router.get("/violations")
def get_violation_analytics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get violation analytics"""
    start_date = datetime.now() - timedelta(days=days)
    
    # Top violation types
    top_violations = db.query(
        Violation.rule_code,
        Violation.rule_description,
        func.count(Violation.id).label('count')
    ).filter(
        Violation.created_at >= start_date
    ).group_by(
        Violation.rule_code,
        Violation.rule_description
    ).order_by(
        func.count(Violation.id).desc()
    ).limit(10).all()
    
    # Daily violations
    daily_data = []
    for i in range(days, -1, -1):
        date = datetime.now().date() - timedelta(days=i)
        count = db.query(Violation).filter(
            func.date(Violation.created_at) == date
        ).count()
        daily_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "count": count
        })
    
    return {
        "top_violations": [
            {
                "code": v.rule_code,
                "description": v.rule_description,
                "count": v.count
            }
            for v in top_violations
        ],
        "daily_trend": daily_data
    }
