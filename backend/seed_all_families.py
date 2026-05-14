import sys
sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import ProfessionalFamily

familias_completas = [
    {"code": "AFD", "name": "Actividades Físicas y Deportivas", "color_hex": "#27ae60", "icon_url": "fas fa-running"},
    {"code": "ADG", "name": "Administración y Gestión", "color_hex": "#3498db", "icon_url": "fas fa-chart-line"},
    {"code": "AGA", "name": "Agraria", "color_hex": "#2ecc71", "icon_url": "fas fa-tree"},
    {"code": "ARG", "name": "Artes Gráficas", "color_hex": "#9b59b6", "icon_url": "fas fa-palette"},
    {"code": "COM", "name": "Comercio y Marketing", "color_hex": "#f1c40f", "icon_url": "fas fa-handshake"},
    {"code": "EOC", "name": "Edificación y Obra Civil", "color_hex": "#e67e22", "icon_url": "fas fa-building"},
    {"code": "ELE", "name": "Electricidad y Electrónica", "color_hex": "#f39c12", "icon_url": "fas fa-bolt"},
    {"code": "ENA", "name": "Energía y Agua", "color_hex": "#34495e", "icon_url": "fas fa-tint"},
    {"code": "FME", "name": "Fabricación Mecánica", "color_hex": "#95a5a6", "icon_url": "fas fa-cog"},
    {"code": "HOT", "name": "Hostelería y Turismo", "color_hex": "#e74c3c", "icon_url": "fas fa-coffee"},
    {"code": "IMP", "name": "Imagen Personal", "color_hex": "#ff9ff3", "icon_url": "fas fa-cut"},
    {"code": "IMS", "name": "Imagen y Sonido", "color_hex": "#feca57", "icon_url": "fas fa-video"},
    {"code": "INA", "name": "Industrias Alimentarias", "color_hex": "#ff6b6b", "icon_url": "fas fa-shopping-cart"},
    {"code": "IEX", "name": "Industrias Extractivas", "color_hex": "#576574", "icon_url": "fas fa-gem"},
    {"code": "IFC", "name": "Informática y Comunicaciones", "color_hex": "#1abc9c", "icon_url": "fas fa-desktop"},
    {"code": "IMA", "name": "Instalación y Mantenimiento", "color_hex": "#8395a7", "icon_url": "fas fa-tools"},
    {"code": "MAM", "name": "Madera, Mueble y Corcho", "color_hex": "#c8d6e5", "icon_url": "fas fa-chair"},
    {"code": "QUI", "name": "Química", "color_hex": "#1dd1a1", "icon_url": "fas fa-flask"},
    {"code": "SAN", "name": "Sanidad", "color_hex": "#ff9f43", "icon_url": "fas fa-heartbeat"},
    {"code": "SEA", "name": "Seguridad y Medio Ambiente", "color_hex": "#10ac84", "icon_url": "fas fa-shield-alt"},
    {"code": "SSC", "name": "Servicios Socioculturales y a la Comunidad", "color_hex": "#5f27cd", "icon_url": "fas fa-users"},
    {"code": "TCP", "name": "Textil, Confección y Piel", "color_hex": "#ff6b81", "icon_url": "fas fa-shopping-bag"},
    {"code": "TMV", "name": "Transporte y Mantenimiento de Vehículos", "color_hex": "#a4b0be", "icon_url": "fas fa-car"}
]

def seed():
    db = SessionLocal()
    print("Iniciando inyección de TODAS las familias profesionales...")

    for f in familias_completas:
        existing = db.query(ProfessionalFamily).filter_by(code=f["code"]).first()
        if existing:
            existing.name = f["name"]
            existing.color_hex = f["color_hex"]
            existing.icon_url = f["icon_url"]
        else:
            db.add(ProfessionalFamily(**f))
            print(f"✔️ Añadida: {f['name']}")
    
    db.commit()
    print("✅ Todas las familias de Aragón (23) importadas correctamente.")
    db.close()

if __name__ == "__main__":
    seed()
