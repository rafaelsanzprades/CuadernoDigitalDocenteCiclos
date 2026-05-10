from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import shutil

app = FastAPI(title="CDD Pro API", version="1.0.0")

# Allow CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@app.get("/")
def read_root():
    return {"status": "ok", "message": "CDD Pro API is running"}

@app.get("/api/module/{module_id}")
def get_module(module_id: str):
    """
    Loads data from the JSON file corresponding to the module.
    """
    file_path = os.path.join(DATA_DIR, f"{module_id}.json")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Module not found")
        
    try:
        with open(file_path, "r", encoding="utf-8-sig") as f:
            content = f.read()
            # Replace invalid JSON 'NaN' with 'null'
            content = content.replace("NaN", "null")
            data = json.loads(content)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/module/{module_id}")
async def update_module(module_id: str, request: Request):
    """
    Saves data to the JSON file corresponding to the module.
    """
    file_path = os.path.join(DATA_DIR, f"{module_id}.json")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Module not found")
        
    try:
        body = await request.json()
        
        # Backup the current file just in case
        backup_path = file_path + ".bak"
        shutil.copy2(file_path, backup_path)
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(body, f, indent=4, ensure_ascii=False)
            
        return {"status": "success", "message": "Module updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/modules")
def list_modules():
    """
    Lists all available PD and Curso modules in the data directory.
    """
    try:
        files = os.listdir(DATA_DIR)
        pd_files = [f.replace(".json", "") for f in files if f.endswith("-pd.json")]
        legacy_files = [f.replace(".json", "") for f in files if f.endswith(".json") and not f.endswith("-pd.json") and f != "ciclos-fp.json" and "curso" not in f]
        curso_files = [f.replace(".json", "") for f in files if f.endswith(".json") and "curso" in f]
        
        all_pd = sorted(list(set(pd_files + legacy_files)))
        all_curso = sorted(curso_files)
        
        return {
            "status": "success",
            "data": {
                "pd_modules": all_pd,
                "curso_modules": all_curso
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
