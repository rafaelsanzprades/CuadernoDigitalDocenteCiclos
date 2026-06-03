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

from routers import modules, users, catalogs, pdf, documents, attendance

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("cdd-pro")

app = FastAPI(
    title="Cuaderno Digital Docente API",
    description="Backend for the Cuaderno Digital Docente Next.js app",
    version="1.0.0",
)

# CORS from env (comma-separated) or default for dev
cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
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


@app.get("/")
def read_root():
    return {"status": "ok", "message": "CDD Pro API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
