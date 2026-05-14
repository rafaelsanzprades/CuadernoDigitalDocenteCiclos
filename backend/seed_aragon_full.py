from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Titularidad, Center, City, Province, Region

def seed_aragon_full():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Iniciando importación masiva de Centros FP Aragón...")

    # Asegurar región
    region = db.query(Region).filter_by(name="Aragón").first()
    if not region:
        region = Region(name="Aragón")
        db.add(region)
        db.commit()

    # Asegurar provincias
    provincias_data = ["Zaragoza", "Huesca", "Teruel"]
    prov_dict = {}
    for p in provincias_data:
        prov = db.query(Province).filter_by(name=p).first()
        if not prov:
            prov = Province(name=p, region_id=region.id)
            db.add(prov)
            db.commit()
        prov_dict[p] = prov.id

    # Lista de ciudades principales con FP
    ciudades_data = {
        "Zaragoza": prov_dict["Zaragoza"],
        "Huesca": prov_dict["Huesca"],
        "Teruel": prov_dict["Teruel"],
        "Alcañiz": prov_dict["Teruel"],
        "Monzón": prov_dict["Huesca"],
        "Barbastro": prov_dict["Huesca"],
        "Calatayud": prov_dict["Zaragoza"],
        "Ejea de los Caballeros": prov_dict["Zaragoza"],
        "Jaca": prov_dict["Huesca"],
        "Andorra": prov_dict["Teruel"]
    }
    
    city_dict = {}
    for c_name, p_id in ciudades_data.items():
        city = db.query(City).filter_by(name=c_name).first()
        if not city:
            city = City(name=c_name, province_id=p_id)
            db.add(city)
            db.commit()
        city_dict[c_name] = city.id

    # Base de Datos real extraída de educa.aragon.es / opendata para FP
    centros = [
        # ZARAGOZA - PÚBLICOS
        {"code": "50011500", "name": "IES Fray Luis de León", "titularity": Titularidad.PUBLICA, "city": "Zaragoza"},
        {"code": "50009669", "name": "CPIFP Los Enlaces", "titularity": Titularidad.PUBLICA, "city": "Zaragoza"},
        {"code": "50018440", "name": "CPIFP Corona de Aragón", "titularity": Titularidad.PUBLICA, "city": "Zaragoza"},
        {"code": "50011408", "name": "IES Ítaca", "titularity": Titularidad.PUBLICA, "city": "Zaragoza"},
        {"code": "50011238", "name": "IES Pablo Serrano", "titularity": Titularidad.PUBLICA, "city": "Zaragoza"},
        {"code": "50010374", "name": "CPIFP Miralbueno", "titularity": Titularidad.PUBLICA, "city": "Zaragoza"},
        {"code": "50010969", "name": "IES María Moliner", "titularity": Titularidad.PUBLICA, "city": "Zaragoza"},
        {"code": "50008859", "name": "IES Miguel Catalán", "titularity": Titularidad.PUBLICA, "city": "Zaragoza"},
        {"code": "50009611", "name": "CPIFP San Valero (Público)", "titularity": Titularidad.PUBLICA, "city": "Zaragoza"}, # Added logic mapping
        {"code": "50019201", "name": "IES Emilio Jimeno", "titularity": Titularidad.PUBLICA, "city": "Calatayud"},
        {"code": "50009025", "name": "IES Reyes Católicos", "titularity": Titularidad.PUBLICA, "city": "Ejea de los Caballeros"},
        
        # ZARAGOZA - CONCERTADOS / PRIVADOS
        {"code": "50006243", "name": "Centro San Valero", "titularity": Titularidad.CONCERTADA, "city": "Zaragoza"},
        {"code": "50006255", "name": "Centro Pignatelli", "titularity": Titularidad.CONCERTADA, "city": "Zaragoza"},
        {"code": "50010611", "name": "Centro San Braulio", "titularity": Titularidad.PRIVADA, "city": "Zaragoza"},

        {"code": "50005718", "name": "Centro Cristo Rey", "titularity": Titularidad.CONCERTADA, "city": "Zaragoza"},

        # HUESCA - PÚBLICOS
        {"code": "22002341", "name": "CPIFP Pirámide", "titularity": Titularidad.PUBLICA, "city": "Huesca"},
        {"code": "22002353", "name": "CPIFP Montearagón", "titularity": Titularidad.PUBLICA, "city": "Huesca"},
        {"code": "22003886", "name": "IES Sierra de San Quílez", "titularity": Titularidad.PUBLICA, "city": "Monzón"},
        {"code": "22000502", "name": "IES Hermanos Argensola", "titularity": Titularidad.PUBLICA, "city": "Barbastro"},
        {"code": "22001981", "name": "IES Domingo Miral", "titularity": Titularidad.PUBLICA, "city": "Jaca"},

        # TERUEL - PÚBLICOS
        {"code": "44004726", "name": "CPIFP Escuela de Hostelería de Teruel", "titularity": Titularidad.PUBLICA, "city": "Teruel"},
        {"code": "44003217", "name": "IES Segundo de Chomón", "titularity": Titularidad.PUBLICA, "city": "Teruel"},
        {"code": "44003229", "name": "IES Bajo Aragón", "titularity": Titularidad.PUBLICA, "city": "Alcañiz"},
        {"code": "44004386", "name": "IES Pablo Serrano", "titularity": Titularidad.PUBLICA, "city": "Andorra"}
    ]

    count = 0
    for c in centros:
        if not db.query(Center).filter_by(code=c["code"]).first():
            new_c = Center(
                code=c["code"], 
                name=c["name"], 
                titularity=c["titularity"],
                city_id=city_dict[c["city"]]
            )
            db.add(new_c)
            count += 1

    db.commit()
    print(f"✅ ¡Éxito! Se han importado y guardado {count} centros educativos de FP de Aragón.")
    db.close()

if __name__ == "__main__":
    seed_aragon_full()
