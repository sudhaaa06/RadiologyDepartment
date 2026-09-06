import sys
from pathlib import Path
from typing import Dict, Any

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Explainable Prior-Study Matching Assistant for Radiology — Phase 1 Backend Service"
)

# Enable CORS for local workstation frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root() -> Dict[str, Any]:
    return {
        "app": settings.app_name,
        "version": settings.version,
        "docs_url": "/docs",
        "api_health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

