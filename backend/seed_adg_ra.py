import pandas as pd
from database import SessionLocal
from models import Degree, Module, LearningOutcome

def seed_adg():
    db = SessionLocal()

    # 1. Update Degree names
    deg_201 = db.query(Degree).filter(Degree.id == 123).first()
    if deg_201 and not deg_201.name.startswith('ADG201'):
        deg_201.name = 'ADG201 - ' + deg_201.name

    deg_301 = db.query(Degree).filter(Degree.id == 5).first() # Assuming Administracion y Finanzas is 301
    if deg_301 and not deg_301.name.startswith('ADG301'):
        deg_301.name = 'ADG301 - ' + deg_301.name
    
    db.commit()

    # 2. Process ADG201
    path_201 = r'C:\GD-rsp\APP\RF DatosModulosSTI-IT\CodigoFamiliaADGDTituloADG201GMedio-ModuloTODOS-NdeRA.csv'
    try:
        df_201 = pd.read_csv(path_201, sep=';', encoding='latin1')
        
        modules_201 = set(str(m).strip() for m in df_201['Modulo'])
        for m_code in modules_201:
            if m_code.lower() == 'nan': continue
            mod = db.query(Module).filter(Module.code == m_code).first()
            if not mod:
                mod = Module(degree_id=deg_201.id, code=m_code, name=f"Módulo {m_code}", hours=0)
                db.add(mod)
                db.commit()
                db.refresh(mod)
            else:
                mod.degree_id = deg_201.id
            
            # Insert RAs
            ras = df_201[df_201['Modulo'] == m_code]
            for _, row in ras.iterrows():
                ra_code = str(row['Codigo resultado'])
                desc = str(row['Resultado aprendizaje']).strip()
                try:
                    ra_num = int(ra_code.split('-')[-1])
                except:
                    ra_num = 0
                    
                existing_ra = db.query(LearningOutcome).filter(
                    LearningOutcome.module_id == mod.id,
                    LearningOutcome.ra_number == ra_num
                ).first()
                if not existing_ra:
                    db.add(LearningOutcome(module_id=mod.id, ra_number=ra_num, description=desc))
        db.commit()
    except Exception as e:
        print("Error ADG201:", e)

    # 3. Process ADG301
    path_301 = r'C:\GD-rsp\APP\RF DatosModulosSTI-IT\CodigoFamiliaADGTituloADG301GSuperior-ModuloTODOS-NdeRA.csv'
    try:
        df_301 = pd.read_csv(path_301, sep=';', encoding='latin1')
        
        modules_301 = set(str(m).strip() for m in df_301['Modulo'])
        for m_code in modules_301:
            if m_code.lower() == 'nan': continue
            mod = db.query(Module).filter(Module.code == m_code).first()
            if not mod:
                mod = Module(degree_id=deg_301.id, code=m_code, name=f"Módulo {m_code}", hours=0)
                db.add(mod)
                db.commit()
                db.refresh(mod)
            else:
                mod.degree_id = deg_301.id
            
            # Insert RAs
            ras = df_301[df_301['Modulo'] == m_code]
            for _, row in ras.iterrows():
                ra_code = str(row['Codigo resultado'])
                desc = str(row['Resultado aprendizaje']).strip()
                try:
                    ra_num = int(ra_code.split('-')[-1])
                except:
                    ra_num = 0
                    
                existing_ra = db.query(LearningOutcome).filter(
                    LearningOutcome.module_id == mod.id,
                    LearningOutcome.ra_number == ra_num
                ).first()
                if not existing_ra:
                    db.add(LearningOutcome(module_id=mod.id, ra_number=ra_num, description=desc))
        db.commit()
        print("ADG successfully seeded!")
    except Exception as e:
        print("Error ADG301:", e)

    db.close()

if __name__ == '__main__':
    seed_adg()
