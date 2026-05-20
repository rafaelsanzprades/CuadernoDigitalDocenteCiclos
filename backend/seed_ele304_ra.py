import sys
import pandas as pd
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Degree, ProfessionalFamily, Module, LearningOutcome, NivelFP

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Iniciando carga de Resultados de Aprendizaje para ELE304 GS...")

    # 1. Asegurar que la Familia ELE existe
    family = db.query(ProfessionalFamily).filter_by(code="ELE").first()
    if not family:
        family = ProfessionalFamily(code="ELE", name="Electricidad y Electrónica")
        db.add(family)
        db.commit()

    # 2. Asegurar que el Ciclo ELE304 existe
    degree = db.query(Degree).filter_by(name="Sistemas de Telecomunicaciones e Informáticos").first()
    if not degree:
        degree = Degree(family_id=family.id, level=NivelFP.SUPERIOR, name="Sistemas de Telecomunicaciones e Informáticos", hours=2000)
        db.add(degree)
        db.commit()

    # 3. Leer Excel (Hoja GS para Grado Superior ELE304)
    xls_path = r'C:\GD-rsp\APP\RF Datos pdf xlsx\RA-CE-GM-GS.xlsx'
    try:
        df = pd.read_excel(xls_path, sheet_name='GS')
    except Exception as e:
        print(f"Error al leer el archivo Excel: {e}")
        db.close()
        return

    # Filtrar solo ELE304
    df_ele = df[df['Ciclo'].str.contains('ELE304', na=False)]
    
    modulos_creados = 0
    ras_creados = 0

    # 4. Insertar Módulos y RAs
    for index, row in df_ele.iterrows():
        # Limpiar datos
        mod_code = str(row['Modulo']).strip()
        if mod_code.lower() == 'nan' or not mod_code:
            continue
            
        cod_resultado = str(row['Codigo resultado']).strip()
        resultado = str(row['Resultado aprendizaje']).strip()
        
        # Extraer el número del RA (ej. ELE304-0156-1 -> 1)
        ra_num = 0
        if '-' in cod_resultado:
            try:
                ra_num = int(cod_resultado.split('-')[-1])
            except ValueError:
                pass
                
        # Asegurar que el Módulo existe
        module = db.query(Module).filter_by(degree_id=degree.id, code=mod_code).first()
        if not module:
            module = Module(degree_id=degree.id, code=mod_code, name=f"Módulo {mod_code}", hours=0)
            db.add(module)
            db.commit()
            modulos_creados += 1
            
        # Asegurar que el RA existe
        ra = db.query(LearningOutcome).filter_by(module_id=module.id, ra_number=ra_num).first()
        if not ra:
            ra = LearningOutcome(module_id=module.id, ra_number=ra_num, description=resultado)
            db.add(ra)
            ras_creados += 1
        else:
            ra.description = resultado
            
    db.commit()
    print(f"Completado. Se han verificado/creado {modulos_creados} modulos y {ras_creados} Resultados de Aprendizaje (RA) en la BBDD.")
    db.close()

if __name__ == "__main__":
    seed()
