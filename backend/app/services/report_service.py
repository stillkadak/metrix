from datetime import datetime, timedelta
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models.scan import Scan
from ..models.violation import Violation


class ReportService:
    """Build reusable database-backed compliance report data."""

    def summary(self, db: Session, days: int = 30) -> dict[str, Any]:
        start = datetime.now() - timedelta(days=days)
        total_scans = db.query(Scan).filter(Scan.created_at >= start).count()
        compliant_scans = (
            db.query(Scan)
            .filter(Scan.created_at >= start, Scan.is_compliant.is_(True))
            .count()
        )
        violations = db.query(func.count(Violation.id)).filter(Violation.created_at >= start).scalar() or 0
        return {
            "period_days": days,
            "total_scans": total_scans,
            "compliant_scans": compliant_scans,
            "total_violations": violations,
            "compliance_rate": round(compliant_scans * 100 / total_scans, 1) if total_scans else 0,
        }
