from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .core.database import engine, Base
from . import models  # noqa: F401 - registers all model metadata before create_all

# Import routers from v1 directly
from .api.v1.auth import router as auth_router
from .api.v1.scans import router as scans_router
from .api.v1.products import router as products_router
from .api.v1.analytics import router as analytics_router
from .api.v1.violations import router as violations_router
from .api.v1.reports import router as reports_router

from .core.config import settings


@asynccontextmanager
async def lifespan(_: FastAPI):
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    yield


ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*",
]

app = FastAPI(
    title="Nirikshan Scanner API",
    description="AI-Powered Legal Metrology Compliance Checking System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(scans_router, prefix="/api/v1")
app.include_router(products_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(violations_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "Nirikshan Scanner API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
