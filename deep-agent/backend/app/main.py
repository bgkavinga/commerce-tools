"""FastAPI application for Deep Agent."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.config import settings
from app.mcp.client import load_mcp_tools
from app.api import routes_health, routes_providers, routes_chat

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for app startup/shutdown."""
    # Startup: Load MCP tools
    try:
        client, tools = await load_mcp_tools()
        app.state.mcp_client = client
        app.state.tools = tools
        logger.info(f"Loaded {len(tools)} MCP tools")
    except Exception as e:
        logger.error(f"Failed to load MCP tools: {e}")
        app.state.tools = []

    yield

    # Shutdown: cleanup if needed
    # langchain-mcp-adapters may need explicit cleanup depending on version
    if hasattr(app.state, "mcp_client"):
        try:
            if hasattr(app.state.mcp_client, "aclose"):
                await app.state.mcp_client.aclose()
        except Exception as e:
            logger.error(f"Error closing MCP client: {e}")


app = FastAPI(
    title="Deep Agent API",
    description="Web-based Deep Agent for Adobe Commerce investigation",
    version="0.1.0",
    lifespan=lifespan,
)

# Include API routers
app.include_router(routes_health.router)
app.include_router(routes_providers.router)
app.include_router(routes_chat.router)

# Mount static files (SPA) if directory exists
if settings.static_dir.exists():
    app.mount("/static", StaticFiles(directory=settings.static_dir), name="static")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve SPA with fallback to index.html."""
        # If it looks like an API route, don't serve the SPA
        if full_path.startswith("api/"):
            return {"detail": "Not found"}

        # Try to serve the file if it exists
        file_path = settings.static_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)

        # Fallback to index.html for SPA routing
        index_path = settings.static_dir / "index.html"
        if index_path.exists():
            return FileResponse(index_path)

        return {"detail": "Not found"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        log_level="info",
    )
