from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ...core.database import get_db
from ...core.dependencies import get_current_user
from ...models.user import User
from ...models.violation import Violation
from ...schemas.violation import ViolationResponse

router = APIRouter(prefix="/violations", tags=["Violations"])

@router.get("/", response_model=List[ViolationResponse])
def list_violations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List violations with filters"""
    query = db.query(Violation)
    
    if severity:
        query = query.filter(Violation.severity == severity)
    
    violations = query.order_by(Violation.created_at.desc()).offset(skip).limit(limit).all()
    return violations