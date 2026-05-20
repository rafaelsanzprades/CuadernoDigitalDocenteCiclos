from database import SessionLocal
from models import Module

def update():
    db = SessionLocal()

    adg201_mapping = {
        '0437': ('Comunicación empresarial y atención al cliente', 160),
        '0438': ('Operaciones administrativas de compra-venta', 160),
        '0439': ('Empresa y administración', 96),
        '0440': ('Tratamiento informático de la información', 224),
        '0441': ('Técnica contable', 96),
        '0442': ('Operaciones administrativas de recursos humanos', 105),
        '0443': ('Tratamiento de la documentación contable', 105),
        '0446': ('Empresa en el aula', 147),
        '0448': ('Operaciones auxiliares de gestión de tesorería', 147),
        '0156': ('Inglés Profesional (GM)', 64),
        '1664': ('Digitalización aplicada a los sectores productivos (GM)', 32),
        '1708': ('Sostenibilidad aplicada al sistema productivo', 32),
        '1709': ('Itinerario personal para la empleabilidad I', 96),
        '1710': ('Itinerario personal para la empleabilidad II', 96),
        'AOP1001': ('Módulo optativo I', 0)
    }

    adg301_mapping = {
        '0647': ('Gestión de la documentación jurídica y empresarial', 96),
        '0648': ('Recursos humanos y responsabilidad social corporativa', 64),
        '0649': ('Ofimática y proceso de la información', 192),
        '0650': ('Proceso integral de la actividad comercial', 192),
        '0651': ('Comunicación y atención al cliente', 160),
        '0179': ('Inglés Profesional (GS)', 64),
        '0652': ('Gestión de recursos humanos', 84),
        '0653': ('Gestión financiera', 126),
        '0654': ('Contabilidad y fiscalidad', 126),
        '0655': ('Gestión logística y comercial', 105),
        '0656': ('Simulación empresarial', 126),
        '0657': ('Proyecto de administración y finanzas', 30),
        '1665': ('Digitalización aplicada a los sectores productivos (GS)', 32),
        '1708': ('Sostenibilidad aplicada al sistema productivo', 32),
        '1709': ('Itinerario personal para la empleabilidad I', 96),
        '1710': ('Itinerario personal para la empleabilidad II', 96),
        'AOP1002': ('Módulo optativo I', 0),
        'AOP1003': ('Módulo optativo II', 0),
        'AOP1004': ('Módulo optativo III', 0)
    }

    modules = db.query(Module).all()
    for m in modules:
        if m.degree_id == 123 and m.code in adg201_mapping:
            m.name = adg201_mapping[m.code][0]
            m.hours = adg201_mapping[m.code][1]
        elif m.degree_id == 5 and m.code in adg301_mapping:
            m.name = adg301_mapping[m.code][0]
            m.hours = adg301_mapping[m.code][1]

    db.commit()
    db.close()
    print("Module names and hours updated.")

if __name__ == "__main__":
    update()
