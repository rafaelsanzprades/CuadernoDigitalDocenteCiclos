import logging
import json
import os
from sqlalchemy.orm import Session
from services.module_service import update_module_data

logger = logging.getLogger("cdd-pro.seed_demo")

def generate_demo_module(db: Session):
    pd_id = "demo-ictve-pd"
    curso_id = "demo-ictve-curso-2025-26"

    # Verificar si ya existen
    from models import ModuleDocument
    existing_pd = db.query(ModuleDocument).filter_by(id=pd_id).first()
    existing_curso = db.query(ModuleDocument).filter_by(id=curso_id).first()
    
    if existing_pd and existing_curso:
        logger.info("El mdulo demo original ya existe, no se hace nada.")
        return

    # Leer el JSON extraido que contiene los datos originales
    json_path = os.path.join(os.path.dirname(__file__), 'demo_data.json')
    if not os.path.exists(json_path):
        logger.error(f"No se encontr {json_path}. No se puede cargar el demo original.")
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            demo_data = json.load(f)
            
        demo_pd_data = demo_data.get(pd_id)
        demo_curso_data = demo_data.get(curso_id)

        if demo_pd_data and not existing_pd:
            # Merge missing keys from a complete mock so PDFs work
            from seed_fictitious_full_data import demo_pd_data_mock
            for k, v in demo_pd_data_mock.items():
                if k not in demo_pd_data or not demo_pd_data[k]:
                    demo_pd_data[k] = v
                    
            update_module_data(pd_id, demo_pd_data, db)
            logger.info("Mdulo ficticio original PD restaurado/generado con datos adicionales.")
            
        if demo_curso_data and not existing_curso:
            # Merge missing keys
            from seed_fictitious_full_data import demo_curso_data_mock
            for k, v in demo_curso_data_mock.items():
                if k not in demo_curso_data or not demo_curso_data[k]:
                    demo_curso_data[k] = v
                    
            update_module_data(curso_id, demo_curso_data, db)
            logger.info("Mdulo ficticio original Curso restaurado/generado con datos adicionales.")

    except Exception as e:
        logger.error(f"Error restoring original demo module: {e}")
