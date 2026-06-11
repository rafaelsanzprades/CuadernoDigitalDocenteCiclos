import logging
from database import SessionLocal, engine, Base
from models import ProfessionalFamily, Degree, User, ModuleDocument

logger = logging.getLogger("cdd-pro.init")

def check_and_seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        family_count = db.query(ProfessionalFamily).count()
        degree_count = db.query(Degree).count()

        if family_count > 0 and degree_count > 5:
            # BD ya poblada (incluida en la imagen Docker o seedeada previamente).
            # Saltamos los seeds lentos para no bloquear el arranque.
            logger.info(
                f"BD ya poblada ({family_count} familias, {degree_count} títulos). "
                "Saltando seeds de datos base."
            )
        else:
            logger.info(
                f"BD vacía o incompleta ({family_count} familias, {degree_count} títulos). "
                "Iniciando población de datos base..."
            )
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
                ("seed_tutoria", "seed"),
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

            # Seeds rápidos de profesores ficticios
            try:
                from seed_fictitious import seed_fake_teachers
                seed_fake_teachers()
                logger.info("seed_fictitious completado")
            except Exception as e:
                logger.error(f"Error en seed_fictitious: {e}")

    finally:
        pass

    # Módulo Demo SIEMPRE: tiene su propia validación interna de duplicados.
    try:
        from seed_fictitious_full import generate_demo_module
        generate_demo_module(db)
        logger.info("seed_fictitious_full completado. Módulo Demo creado con éxito.")
    except Exception as e:
        logger.error(f"Error en seed_fictitious_full: {e}")

    db.close()

if __name__ == "__main__":
    check_and_seed_db()
