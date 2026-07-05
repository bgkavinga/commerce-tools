"""Health check endpoint."""

from fastapi import APIRouter
from .schemas import HealthResponse

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(status="ok")
