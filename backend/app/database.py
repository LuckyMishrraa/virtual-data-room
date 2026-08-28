from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.models.db_models import Base, UserModel

# Database engine configuration
engine_kwargs = {}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency providing a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes database schema and ensures standard RBAC personas are seeded."""
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Seed 4 Core Role Personas if not already existing
        if db.query(UserModel).count() == 0:
            users = [
                UserModel(
                    id="usr-admin-01",
                    name="Alexander Vance",
                    role="Admin",
                    email="alexander.vance@vdr-capital.com",
                    avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                ),
                UserModel(
                    id="usr-comp-02",
                    name="Elena Rostova",
                    role="Compliance Officer",
                    email="elena.rostova@vdr-capital.com",
                    avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                ),
                UserModel(
                    id="usr-adv-03",
                    name="Marcus Sterling",
                    role="Advisor",
                    email="marcus.sterling@sterling-wealth.com",
                    avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                ),
                UserModel(
                    id="usr-aud-04",
                    name="Sarah Chen, CPA",
                    role="Auditor",
                    email="sarah.chen@deloitte-audit.com",
                    avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
                )
            ]
            db.add_all(users)
            db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
