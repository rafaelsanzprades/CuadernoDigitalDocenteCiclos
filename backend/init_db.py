import logging
from database import SessionLocal, engine, Base
from models import ProfessionalFamily, User, ModuleDocument

logger = logging.getLogger("cdd-pro.init")

def check_and_seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Ya no hacemos return temprano para asegurar que el demo full se genere.
        if not db.query(ProfessionalFamily).first():
            logger.info("Base de datos vaca detectada. Iniciando poblacin de datos base y ficticios...")

        import runpy

        scripts = [
            ("seed_fp", "seed"),
            ("seed_all_families", "seed"),
            ("seed_missing_degrees", None),
            ("seed_degree_codes", None),
            ("seed_adg_ra", "seed"),
            ("seed_ele203_ra", "seed"),
            ("seed_ele304_ra", "seed"),
            ("seed_users", None),
            ("seed_tutoria", "seed")
        ]

        for mod_name, func_name in scripts:
            try:
                if func_name:
                    mod = __import__(mod_name)
                    getattr(mod, func_name)()
                else:
                    runpy.run_module(mod_name, run_name="__main__")
                logger.info(f"{mod_name} completado")
            except Exception as e:
                logger.error(f"Error en {mod_name}: {e}")

        # Ejecutamos el seeder ficticio original (profesores falsos)
        try:
            from seed_fictitious import seed_fake_teachers
            seed_fake_teachers()
            logger.info("seed_fictitious completado")
        except Exception as e:
            logger.error(f"Error en seed_fictitious: {e}")

    finally:
        pass
        
    # Y finalmente ejecutamos nuestro nuevo seeder de Demo Full SIEMPRE, 
    # l tiene su propia validacin de si ya existe.
    try:
        from seed_fictitious_full import generate_demo_module
        generate_demo_module(db)
        logger.info("seed_fictitious_full completado. Mdulo Demo creado con xito.")
    except Exception as e:
        logger.error(f"Error en seed_fictitious_full: {e}")

    db.close()

if __name__ == "__main__":
    check_and_seed_db()
