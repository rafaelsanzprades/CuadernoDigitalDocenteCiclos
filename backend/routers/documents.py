from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import os
import mimetypes
import tempfile
import sys

if sys.platform == "win32":
    try:
        import pythoncom
        from docx2pdf import convert
        DOCX_CONVERSION_AVAILABLE = True
    except ImportError:
        DOCX_CONVERSION_AVAILABLE = False
else:
    DOCX_CONVERSION_AVAILABLE = False

router = APIRouter(prefix="/api/documents", tags=["documents"])

BASE_DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "documentos"))

def get_safe_path(requested_path: str) -> str:
    # Prevenir directory traversal garantizando que el path final está dentro de BASE_DOCS_DIR
    clean_path = requested_path.strip("/")
    target_path = os.path.abspath(os.path.join(BASE_DOCS_DIR, clean_path))
    
    if not target_path.startswith(BASE_DOCS_DIR):
        raise HTTPException(status_code=403, detail="Acceso denegado: Path traversal detectado.")
    return target_path

def convert_to_pdf_sync(docx_path: str, pdf_path: str):
    if not DOCX_CONVERSION_AVAILABLE:
        raise HTTPException(status_code=501, detail="La conversión de DOCX a PDF no está soportada en este entorno.")
    # Initialize COM for the current thread (FastAPI runs this in a threadpool)
    pythoncom.CoInitialize()
    try:
        convert(docx_path, pdf_path)
    finally:
        pythoncom.CoUninitialize()

@router.get("/list")
def list_documents(path: str = ""):
    target_path = get_safe_path(path)
    
    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail="Directorio no encontrado")
        
    if not os.path.isdir(target_path):
        raise HTTPException(status_code=400, detail="La ruta proporcionada no es un directorio")
        
    items = []
    try:
        with os.scandir(target_path) as entries:
            for entry in entries:
                items.append({
                    "name": entry.name,
                    "is_dir": entry.is_dir(),
                    "size": entry.stat().st_size if entry.is_file() else None,
                    "path": os.path.relpath(entry.path, BASE_DOCS_DIR).replace("\\", "/")
                })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    # Ordenar: primero carpetas, luego archivos (y alfabéticamente)
    items.sort(key=lambda x: (not x["is_dir"], x["name"].lower()))
    
    return {"status": "success", "data": items, "current_path": path}

@router.get("/download")
def download_document(file_path: str):
    target_path = get_safe_path(file_path)
    
    if not os.path.exists(target_path) or not os.path.isfile(target_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
        
    filename = os.path.basename(target_path)
    media_type, _ = mimetypes.guess_type(target_path)
    
    if not media_type:
        media_type = "application/octet-stream"
        
    return FileResponse(
        path=target_path,
        filename=filename,
        media_type=media_type
    )

@router.get("/preview")
def preview_document(file_path: str, background_tasks: BackgroundTasks):
    target_path = get_safe_path(file_path)
    
    if not os.path.exists(target_path) or not os.path.isfile(target_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
        
    ext = os.path.splitext(target_path)[1].lower()
    
    if ext == '.docx':
        try:
            temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            temp_pdf.close()
            
            convert_to_pdf_sync(target_path, temp_pdf.name)
            
            if not os.path.exists(temp_pdf.name) or os.path.getsize(temp_pdf.name) == 0:
                raise HTTPException(status_code=500, detail="Error en la conversión a PDF: el archivo está vacío")
            
            def cleanup_temp_file(path: str):
                try:
                    os.unlink(path)
                except Exception:
                    pass
                    
            background_tasks.add_task(cleanup_temp_file, temp_pdf.name)
            
            return FileResponse(
                path=temp_pdf.name,
                filename=os.path.basename(target_path).replace(".docx", ".pdf"),
                media_type="application/pdf",
                content_disposition_type="inline"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error durante la conversión: {str(e)}")
    else:
        media_type, _ = mimetypes.guess_type(target_path)
        if not media_type:
            media_type = "application/octet-stream"
            
        return FileResponse(
            path=target_path,
            filename=os.path.basename(target_path),
            media_type=media_type,
            content_disposition_type="inline"
        )
