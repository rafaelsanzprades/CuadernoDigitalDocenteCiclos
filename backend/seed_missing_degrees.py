import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Degree, ProfessionalFamily, NivelFP

urls = {
    NivelFP.BASICA: "https://www.todofp.es/que-estudiar/grados-d/fp-grado-basico.html",
    NivelFP.MEDIO: "https://www.todofp.es/que-estudiar/grados-d/grado-medio.html"
}

def seed_missing_degrees():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    total_inserted = 0
    missing_families = set()

    for nivel, url in urls.items():
        print(f"Scraping {nivel.name} desde {url}...")
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"Error al acceder a la URL: {response.status_code}")
            continue
            
        soup = BeautifulSoup(response.content, 'html.parser')
        table = soup.find('table')
        if not table:
            print("No se encontró tabla")
            continue
            
        current_family = "Desconocida"
        rows = table.find('tbody').find_all('tr')
        
        for row in rows:
            th = row.find('th')
            if th:
                img = th.find('img')
                if img and img.has_attr('alt'):
                    current_family = img['alt'].replace("Logotipo ", "").strip()
            
            td_title = row.find('td', headers=lambda x: x and 'titulacion' in x)
            if not td_title:
                continue
                
            a_tag = td_title.find('a')
            if not a_tag:
                continue
                
            title = a_tag.text.strip()
            
            # Buscar familia en BBDD
            family = db.query(ProfessionalFamily).filter(ProfessionalFamily.name.ilike(f"%{current_family}%")).first()
            if not family:
                missing_families.add(current_family)
                continue
                
            # Insertar en BBDD
            existing = db.query(Degree).filter_by(name=title, family_id=family.id).first()
            if not existing:
                new_degree = Degree(
                    family_id=family.id,
                    level=nivel,
                    name=title,
                    hours=2000
                )
                db.add(new_degree)
                total_inserted += 1

    db.commit()
    db.close()
    
    print(f"✅ Se han guardado {total_inserted} Ciclos Formativos (Medio/Básico) en la BBDD.")
    if missing_families:
        print(f"⚠️ Familias no encontradas: {missing_families}")

if __name__ == "__main__":
    seed_missing_degrees()
