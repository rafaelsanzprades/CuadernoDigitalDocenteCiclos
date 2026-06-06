import os
import shutil
import datetime
import glob
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "cdd.db"
BACKUP_DIR = BASE_DIR / "backups"

# Configuration
MAX_BACKUPS = 7  # Keep backups for the last 7 days

def perform_backup():
    print(f"[{datetime.datetime.now()}] Iniciando backup automático...")
    if not DB_PATH.exists():
        print("La base de datos cdd.db no existe aún. Omitiendo backup.")
        return

    # Create backups folder if not exists
    BACKUP_DIR.mkdir(exist_ok=True)

    # Generate backup filename with timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUP_DIR / f"cdd_backup_{timestamp}.db"

    try:
        shutil.copy2(DB_PATH, backup_file)
        print(f"Backup creado exitosamente: {backup_file.name}")
    except Exception as e:
        print(f"Error al crear el backup: {e}")
        return

    # Rotate old backups
    clean_old_backups()

def clean_old_backups():
    # Get all .db files in backups folder sorted by modification time (oldest first)
    backups = sorted(BACKUP_DIR.glob("cdd_backup_*.db"), key=os.path.getmtime)
    
    if len(backups) > MAX_BACKUPS:
        excess = len(backups) - MAX_BACKUPS
        for old_backup in backups[:excess]:
            try:
                old_backup.unlink()
                print(f"Backup antiguo eliminado: {old_backup.name}")
            except Exception as e:
                print(f"Error al eliminar backup antiguo {old_backup.name}: {e}")

if __name__ == "__main__":
    perform_backup()
