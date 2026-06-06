import os
import shutil
import asyncio
import logging
from datetime import datetime
from database import DATABASE_URL

logger = logging.getLogger("cdd-pro.backup")

BACKUP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backups")
MAX_BACKUPS = 7
BACKUP_INTERVAL_SECONDS = 24 * 60 * 60  # 24 hours

def perform_backup():
    if not DATABASE_URL.startswith("sqlite"):
        logger.info("Backup service: Not using SQLite, skipping file backup.")
        return False
    
    # Parse DB file path from sqlite:///./cdd_pro.db or similar
    db_path = DATABASE_URL.replace("sqlite:///", "")
    if db_path.startswith("./"):
        # Resolve relative to backend directory
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(backend_dir, db_path[2:])
        
    if not os.path.exists(db_path):
        logger.warning(f"Backup service: DB file {db_path} does not exist.")
        return False
        
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
        
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    db_filename = os.path.basename(db_path)
    backup_filename = f"{os.path.splitext(db_filename)[0]}_{timestamp}.bak"
    backup_path = os.path.join(BACKUP_DIR, backup_filename)
    
    try:
        shutil.copy2(db_path, backup_path)
        logger.info(f"Backup service: Created backup at {backup_path}")
        
        # Cleanup old backups
        cleanup_old_backups(os.path.splitext(db_filename)[0])
        return True
    except Exception as e:
        logger.error(f"Backup service: Error creating backup: {e}")
        return False

def cleanup_old_backups(db_prefix):
    try:
        # Find all files matching db_prefix_*.bak
        backups = []
        for f in os.listdir(BACKUP_DIR):
            if f.startswith(f"{db_prefix}_") and f.endswith(".bak"):
                backups.append(os.path.join(BACKUP_DIR, f))
                
        # Sort by modification time (oldest first)
        backups.sort(key=os.path.getmtime)
        
        # Remove oldest if we exceed MAX_BACKUPS
        while len(backups) > MAX_BACKUPS:
            oldest = backups.pop(0)
            os.remove(oldest)
            logger.info(f"Backup service: Removed old backup {oldest}")
    except Exception as e:
        logger.error(f"Backup service: Error cleaning up backups: {e}")

async def backup_task():
    logger.info("Backup service: Starting rotative backup task.")
    
    # Initial wait (e.g., 5 minutes) before the first backup after startup
    await asyncio.sleep(5 * 60)
    perform_backup()
    
    while True:
        await asyncio.sleep(BACKUP_INTERVAL_SECONDS)
        perform_backup()
