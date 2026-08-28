import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.services.minio_service import minio_service
from app.routers import files, folders, permissions, compliance, audit, users

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vdr-backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Virtual Data Room services...")
    try:
        init_db()
        logger.info("Database schema and RBAC personas ready.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")

    try:
        minio_service.ensure_bucket_exists()
    except Exception as e:
        logger.warning(f"MinIO bucket initialization deferred: {e}")

    yield
    logger.info("Shutting down Virtual Data Room services...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Institutional-grade Virtual Data Room (VDR) Backend API with MinIO S3 Object Storage, RBAC Permission Matrix, Zero-Download Previews, and Immutable Audit Logging.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All API Routers under /api/v1
app.include_router(files.router, prefix=settings.API_V1_STR)
app.include_router(folders.router, prefix=settings.API_V1_STR)
app.include_router(permissions.router, prefix=settings.API_V1_STR)
app.include_router(compliance.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "minio_bucket": settings.MINIO_BUCKET_NAME,
        "api_docs": "/docs"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to the Virtual Data Room (VDR) Backend API",
        "docs": "/docs",
        "health": "/health",
        "api_v1": settings.API_V1_STR
    }
