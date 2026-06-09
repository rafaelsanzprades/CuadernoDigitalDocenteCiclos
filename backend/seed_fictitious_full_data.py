pd_id = "demo-ictve-pd"
curso_id = "demo-ictve-curso-2025-26"

demo_pd_data_mock = {
    "info_modulo": {
        "modulo": "Desarrollo Web en Entorno Cliente",
        "siglas": "DWEC",
        "familia": "Informtica y Comunicaciones",
        "ciclo": "Desarrollo de Aplicaciones Web",
        "curso": "2",
        "horas_semanales": "6",
        "horas_totales": "120"
    },
    "info_fechas": {
        "ini_curso": "2025-09-01",
        "fin_curso": "2026-06-30",
        "ini_1t": "2025-09-15",
        "fin_1t": "2025-12-18",
        "ini_2t": "2025-12-19",
        "fin_2t": "2026-03-25",
        "ini_3t": "2026-03-26",
        "fin_3t": "2026-06-18",
        "ini_feoe": "2026-02-01",
        "fin_feoe": "2026-03-05"
    },
    "horario": {
        "Lun": "2", "Mar": "2", "Mié": "2", "Jue": "0", "Vie": "0"
    },
    "df_ud": [
        {"id_ud": "UD1", "titulo_ud": "Seleccin de arquitecturas y herramientas", "duracion": "20", "trimestre": "1T"},
        {"id_ud": "UD2", "titulo_ud": "Manejo de la sintaxis del lenguaje", "duracion": "40", "trimestre": "1T"},
        {"id_ud": "UD3", "titulo_ud": "Utilizacin de objetos predefinidos", "duracion": "60", "trimestre": "2T"}
    ],
    "df_sesiones": [
        {"ID": "1", "id_ud": "UD1", "Num_Orden": 1, "Horas": 2, "Tipo_Actividad": "Teora", "Contenidos": "Introduccin a la web", "Aspectos_Clave": "Historia, W3C", "Recursos": "Presentacin"},
        {"ID": "2", "id_ud": "UD1", "Num_Orden": 2, "Horas": 2, "Tipo_Actividad": "Prctica", "Contenidos": "Navegadores", "Aspectos_Clave": "Chrome DevTools", "Recursos": "PC"}
    ],
    "df_ra": [
        {"id_ra": "RA1", "desc_ra": "Selecciona arquitecturas web", "peso_ra": "30", "is_dual": False}
    ],
    "df_ce": [
        {"id_ce": "CE1.a", "id_ra": "RA1", "id_ud": "UD1", "desc_ce": "Identifica arquitecturas", "peso_ce": "100"}
    ],
    "df_act": [
        {"id_act": "ACT1", "desc_act": "Examen Parcial", "Tipo": "Examen", "tri_act": "1T", "peso_act": "100", "is_active": True}
    ],
    "df_pr": []
}

demo_curso_data_mock = {
    "df_al": [
        {"ID": "AL1", "Nombre": "Juan", "Apellidos": "Prez", "Estado": "Activo", "Edad": "20", "Email": "juan@test.com"}
    ],
    "df_eval": [
        {"ID": "AL1", "ACT1": "8.5", "Eval_1T": "8.5", "Nota_Final": "8"}
    ],
    "df_sgmt": [],
    "df_feoe": [],
    "daily_ledger": {}
}
