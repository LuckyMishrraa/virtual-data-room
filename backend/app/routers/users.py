
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db_models import UserModel
from app.models.schemas import UserResponse, UserRole

router = APIRouter(prefix="/users", tags=["Users & Personas"])

@router.get("", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    """Returns the list of seeded personas representing the 4 core VDR roles."""
    return db.query(UserModel).all()

@router.get("/current", response_model=UserResponse)
def get_current_user(
    role: UserRole = Query("Compliance Officer", description="Role to assume"),
    db: Session = Depends(get_db)
):
    """Returns user record for the designated role."""
    user = db.query(UserModel).filter(UserModel.role == role).first()
    if not user:
        user = db.query(UserModel).first()
    if not user:
        raise HTTPException(status_code=404, detail="User persona not found")
    return user
