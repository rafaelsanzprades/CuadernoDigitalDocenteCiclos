import sys
import os
import logging

# MUST be first: add backend/ to path before ANY other imports.
_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
from contextlib import asynccontextmanager

from services.backup_service import backup_task, perform_backup

from routers import modules, users, catalogs, pdf, documents, attendance, ai_assistant

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("cdd-pro")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializacin automtica de BD si est vaca
    from init_db import check_and_seed_db
    try:
        check_and_seed_db()
    except Exception as e:
        logger.error(f"Error initializing DB: {e}")

    task = asyncio.create_task(backup_task())
    yield
    task.cancel()

app = FastAPI(
    title="Cuaderno FP API",
    description="Backend for the Cuaderno FP Next.js app",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS from env (comma-separated) or default for dev
cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"status": "error", "detail": "Internal server error"},
    )


app.include_router(catalogs.router)
app.include_router(modules.router)
app.include_router(users.router)
app.include_router(pdf.router)
app.include_router(documents.router)
app.include_router(attendance.router)
app.include_router(ai_assistant.router)


@app.get("/")
def read_root():
    return {"status": "ok", "message": "CDD Pro API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/admin/backup")
def trigger_backup():
    success = perform_backup()
    if success:
        return {"status": "ok", "message": "Backup created successfully"}
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Failed to create backup or not using SQLite"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
