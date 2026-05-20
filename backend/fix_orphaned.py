import pandas as pd
from database import SessionLocal
from models import Degree, Module, LearningOutcome

def fix():
    db = SessionLocal()
    
    # Correct degrees
    deg_gm = db.query(Degree).filter(Degree.name == 'Técnico en Instalaciones de Telecomunicaciones').first()
    deg_gs = db.query(Degree).filter(Degree.name == 'Técnico Superior en Sistemas de Telecomunicaciones e Informáticos').first()

    xls_path = r'C:\GD-rsp\APP\RF Datos pdf xlsx\RA-CE-GM-GS.xlsx'
    
    # Fix GM (ELE203)
    try:
        df_gm = pd.read_excel(xls_path, sheet_name='GM')
        df_ele203 = df_gm[df_gm['Ciclo'].str.contains('ELE203', na=False)]
        mod_codes_gm = set(str(c).strip() for c in df_ele203['Modulo'] if str(c).strip() and str(c).lower() != 'nan')
        
        for m_code in mod_codes_gm:
            m = db.query(Module).filter(Module.code == m_code).first()
            if m:
                m.degree_id = deg_gm.id
    except:
        pass

    # Fix GS (ELE304)
    try:
        df_gs = pd.read_excel(xls_path, sheet_name='GS')
        df_ele304 = df_gs[df_gs['Ciclo'].str.contains('ELE304', na=False)]
        mod_codes_gs = set(str(c).strip() for c in df_ele304['Modulo'] if str(c).strip() and str(c).lower() != 'nan')
        
        for m_code in mod_codes_gs:
            m = db.query(Module).filter(Module.code == m_code).first()
            if m:
                m.degree_id = deg_gs.id
    except:
        pass

    db.commit()
    print("Orphaned modules fixed.")
    db.close()

if __name__ == "__main__":
    fix()
