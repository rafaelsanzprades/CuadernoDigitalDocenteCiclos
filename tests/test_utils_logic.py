# -*- coding: utf-8 -*-
"""
Tests unitarios para la lógica de cálculo del Cuaderno Digital Docente.
Ejecutar con: pytest tests/ -v
"""
import sys
import os
import pytest
import pandas as pd
from datetime import date

# Añadir el directorio raíz al path para importar los módulos
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils_logic import (
    generar_siguiente_id,
    calcular_horas_reales,
    procesar_lista_alumnado,
    calcular_notas_alumno,
    get_sigad_info,
)


# ─────────────────────────────────────────────────────────────
# FIXTURES: Datos de prueba reutilizables
# ─────────────────────────────────────────────────────────────

@pytest.fixture
def df_ra_basico():
    """2 RAs con ponderación 60% y 40%."""
    return pd.DataFrame([
        {"id_ra": "RA1", "peso_ra": 60.0, "is_dual": False, "desc_ra": "Resultado 1"},
        {"id_ra": "RA2", "peso_ra": 40.0, "is_dual": False, "desc_ra": "Resultado 2"},
    ])


@pytest.fixture
def df_ce_basico():
    """4 CEs: 2 por cada RA, ponderados al 50% cada uno dentro de su RA."""
    return pd.DataFrame([
        {"id_ra": "RA1", "id_ce": "CE1a", "peso_ce": 50.0, "id_ud": "UD01", "desc_ce": "", "og_vinc": "", "cpe_vinc": "", "feoe": False},
        {"id_ra": "RA1", "id_ce": "CE1b", "peso_ce": 50.0, "id_ud": "UD01", "desc_ce": "", "og_vinc": "", "cpe_vinc": "", "feoe": False},
        {"id_ra": "RA2", "id_ce": "CE2a", "peso_ce": 50.0, "id_ud": "UD02", "desc_ce": "", "og_vinc": "", "cpe_vinc": "", "feoe": False},
        {"id_ra": "RA2", "id_ce": "CE2b", "peso_ce": 50.0, "id_ud": "UD02", "desc_ce": "", "og_vinc": "", "cpe_vinc": "", "feoe": False},
    ])


@pytest.fixture
def df_act_basico():
    """4 actividades, una por cada CE (cada CE tiene 1 actividad vinculada)."""
    return pd.DataFrame([
        {"id_act": "ACT01", "tri_act": "1T", "desc_act": "Examen T1", "peso_act": 25.0, "is_active": True, "CE1a": True, "CE1b": False, "CE2a": False, "CE2b": False},
        {"id_act": "ACT02", "tri_act": "1T", "desc_act": "Práctica T1", "peso_act": 25.0, "is_active": True, "CE1a": False, "CE1b": True, "CE2a": False, "CE2b": False},
        {"id_act": "ACT03", "tri_act": "2T", "desc_act": "Examen T2", "peso_act": 25.0, "is_active": True, "CE1a": False, "CE1b": False, "CE2a": True, "CE2b": False},
        {"id_act": "ACT04", "tri_act": "2T", "desc_act": "Práctica T2", "peso_act": 25.0, "is_active": True, "CE1a": False, "CE1b": False, "CE2a": False, "CE2b": True},
    ])


@pytest.fixture
def df_eval_alumno_10():
    """Un alumno con nota 10 en todas las actividades."""
    return pd.DataFrame([
        {"ID": "AN01", "ACT01": 10.0, "ACT02": 10.0, "ACT03": 10.0, "ACT04": 10.0, "Nota_Final": 0.0},
    ])


@pytest.fixture
def df_eval_alumno_5():
    """Un alumno con nota 5 en todo."""
    return pd.DataFrame([
        {"ID": "AN01", "ACT01": 5.0, "ACT02": 5.0, "ACT03": 5.0, "ACT04": 5.0, "Nota_Final": 0.0},
    ])


@pytest.fixture
def df_eval_alumno_mixto():
    """Un alumno con notas variadas: 8, 6, 4, 2."""
    return pd.DataFrame([
        {"ID": "AN01", "ACT01": 8.0, "ACT02": 6.0, "ACT03": 4.0, "ACT04": 2.0, "Nota_Final": 0.0},
    ])


# ─────────────────────────────────────────────────────────────
# TESTS: generar_siguiente_id
# ─────────────────────────────────────────────────────────────

class TestGenerarSiguienteId:
    def test_df_vacio(self):
        """Con un DataFrame vacío, debe devolver el primer ID."""
        df = pd.DataFrame(columns=["ID"])
        assert generar_siguiente_id(df, "RA") == "RA01"

    def test_incremento_normal(self):
        """Debe incrementar el último ID encontrado."""
        df = pd.DataFrame({"ID": ["RA01", "RA02", "RA03"]})
        assert generar_siguiente_id(df, "RA") == "RA04"

    def test_prefijo_diferente(self):
        """Debe funcionar con cualquier prefijo."""
        df = pd.DataFrame({"ID": ["UD01", "UD02"]})
        assert generar_siguiente_id(df, "UD") == "UD03"

    def test_ids_no_consecutivos(self):
        """Si hay huecos, toma el máximo + 1."""
        df = pd.DataFrame({"ID": ["AN01", "AN05"]})
        assert generar_siguiente_id(df, "AN") == "AN06"

    def test_sin_columna_id(self):
        """Si no hay columna 'ID', devuelve el primero."""
        df = pd.DataFrame({"Otro": ["valor"]})
        assert generar_siguiente_id(df, "CE") == "CE01"


# ─────────────────────────────────────────────────────────────
# TESTS: calcular_horas_reales
# ─────────────────────────────────────────────────────────────

class TestCalcularHorasReales:
    def test_semana_completa(self):
        """Lunes a viernes con 2h cada día = 10h."""
        horario = {"Lun": 2, "Mar": 2, "Mié": 2, "Jue": 2, "Vie": 2}
        # 06/10/2025 es lunes, 10/10/2025 es viernes
        inicio = date(2025, 10, 6)
        fin = date(2025, 10, 10)
        assert calcular_horas_reales(inicio, fin, horario) == 10

    def test_fin_de_semana_no_cuenta(self):
        """Si el rango incluye sábado y domingo, no se cuentan."""
        horario = {"Lun": 2, "Mar": 2, "Mié": 2, "Jue": 2, "Vie": 2}
        inicio = date(2025, 10, 6)   # lunes
        fin = date(2025, 10, 12)     # domingo
        assert calcular_horas_reales(inicio, fin, horario) == 10

    def test_festivo_excluye_horas(self):
        """Un día marcado como festivo no se cuenta."""
        horario = {"Lun": 3, "Mar": 3, "Mié": 3, "Jue": 3, "Vie": 3}
        inicio = date(2025, 10, 6)   # lunes
        fin = date(2025, 10, 10)     # viernes
        # Martes 7 es festivo
        notes = {"f_07/10/2025": "Festivo local"}
        assert calcular_horas_reales(inicio, fin, horario, notes) == 12  # 15 - 3

    def test_sin_horario(self):
        """Si no hay horas asignadas, el total es 0."""
        horario = {"Lun": 0, "Mar": 0, "Mié": 0, "Jue": 0, "Vie": 0}
        inicio = date(2025, 10, 6)
        fin = date(2025, 10, 10)
        assert calcular_horas_reales(inicio, fin, horario) == 0

    def test_un_solo_dia(self):
        """Con inicio == fin, solo se cuenta ese día."""
        horario = {"Lun": 5, "Mar": 0, "Mié": 0, "Jue": 0, "Vie": 0}
        inicio = date(2025, 10, 6)  # lunes
        fin = date(2025, 10, 6)
        assert calcular_horas_reales(inicio, fin, horario) == 5

    def test_festivo_con_valor_vacio_no_excluye(self):
        """Un festivo con cadena vacía NO debe excluir el día."""
        horario = {"Lun": 2, "Mar": 2, "Mié": 2, "Jue": 2, "Vie": 2}
        inicio = date(2025, 10, 6)
        fin = date(2025, 10, 10)
        notes = {"f_07/10/2025": ""}  # Vacío = no festivo
        assert calcular_horas_reales(inicio, fin, horario, notes) == 10


# ─────────────────────────────────────────────────────────────
# TESTS: procesar_lista_alumnado
# ─────────────────────────────────────────────────────────────

class TestProcesarListaAlumnado:
    def test_ordena_por_apellidos(self):
        """El alumnado debe quedar ordenado alfabéticamente por apellidos."""
        df = pd.DataFrame({
            "ID": ["", ""],
            "Apellidos": ["Zamora", "Bermejo"],
            "Nombre": ["Ana", "Pepe"],
            "Estado": ["", ""]
        })
        resultado = procesar_lista_alumnado(df)
        assert resultado.iloc[0]["Apellidos"] == "Bermejo"
        assert resultado.iloc[1]["Apellidos"] == "Zamora"

    def test_regenera_ids(self):
        """Los IDs deben regenerarse como AN01, AN02..."""
        df = pd.DataFrame({
            "ID": ["X99", "X88"],
            "Apellidos": ["Beta", "Alfa"],
            "Nombre": ["B", "A"],
            "Estado": ["", ""]
        })
        resultado = procesar_lista_alumnado(df)
        assert resultado.iloc[0]["ID"] == "AN01"
        assert resultado.iloc[1]["ID"] == "AN02"

    def test_estado_vacio_se_convierte_en_alta(self):
        """Si el estado está vacío, debe ser 'Alta'."""
        df = pd.DataFrame({
            "ID": [""],
            "Apellidos": ["Test"],
            "Nombre": ["A"],
            "Estado": [""]
        })
        resultado = procesar_lista_alumnado(df)
        assert resultado.iloc[0]["Estado"] == "Alta"

    def test_estado_baja_se_mantiene(self):
        """Un alumno en 'Baja' no debe cambiarse a 'Alta'."""
        df = pd.DataFrame({
            "ID": [""],
            "Apellidos": ["Test"],
            "Nombre": ["A"],
            "Estado": ["Baja"]
        })
        resultado = procesar_lista_alumnado(df)
        assert resultado.iloc[0]["Estado"] == "Baja"

    def test_df_vacio(self):
        """Con DataFrame vacío, devuelve vacío sin error."""
        df = pd.DataFrame()
        resultado = procesar_lista_alumnado(df)
        assert resultado.empty


# ─────────────────────────────────────────────────────────────
# TESTS: calcular_notas_alumno
# ─────────────────────────────────────────────────────────────

class TestCalcularNotasAlumno:
    def test_nota_perfecta(self, df_ra_basico, df_ce_basico, df_act_basico, df_eval_alumno_10):
        """Con 10 en todo, la nota final debe ser 10."""
        res = calcular_notas_alumno("AN01", df_eval_alumno_10, df_act_basico, df_ce_basico, df_ra_basico)
        assert res["nota_final"] == 10.0
        assert res["notas_ra"]["RA1"] == 10.0
        assert res["notas_ra"]["RA2"] == 10.0

    def test_nota_aprobado_justo(self, df_ra_basico, df_ce_basico, df_act_basico, df_eval_alumno_5):
        """Con 5 en todo, la nota final debe ser 5."""
        res = calcular_notas_alumno("AN01", df_eval_alumno_5, df_act_basico, df_ce_basico, df_ra_basico)
        assert res["nota_final"] == 5.0

    def test_nota_mixta_ponderada(self, df_ra_basico, df_ce_basico, df_act_basico, df_eval_alumno_mixto):
        """Notas 8,6,4,2 → CE1a=8, CE1b=6, CE2a=4, CE2b=2 → RA1=(8*0.5+6*0.5)=7, RA2=(4*0.5+2*0.5)=3 → Final=7*0.6+3*0.4=5.4"""
        res = calcular_notas_alumno("AN01", df_eval_alumno_mixto, df_act_basico, df_ce_basico, df_ra_basico)
        assert res["notas_ra"]["RA1"] == pytest.approx(7.0, abs=0.01)
        assert res["notas_ra"]["RA2"] == pytest.approx(3.0, abs=0.01)
        assert res["nota_final"] == pytest.approx(5.4, abs=0.01)

    def test_alumno_no_existe(self, df_ra_basico, df_ce_basico, df_act_basico, df_eval_alumno_10):
        """Un alumno que no existe devuelve nota 0."""
        res = calcular_notas_alumno("INEXISTENTE", df_eval_alumno_10, df_act_basico, df_ce_basico, df_ra_basico)
        assert res["nota_final"] == 0.0
        assert res["notas_ra"] == {}

    def test_df_vacio(self, df_ra_basico, df_ce_basico, df_act_basico):
        """Con DataFrames vacíos, devuelve nota 0."""
        df_eval_empty = pd.DataFrame()
        res = calcular_notas_alumno("AN01", df_eval_empty, df_act_basico, df_ce_basico, df_ra_basico)
        assert res["nota_final"] == 0.0

    def test_overrides(self, df_ra_basico, df_ce_basico, df_act_basico, df_eval_alumno_5):
        """Los overrides deben reemplazar las notas del DataFrame."""
        overrides = {"ACT01": 10.0, "ACT02": 10.0, "ACT03": 10.0, "ACT04": 10.0}
        res = calcular_notas_alumno("AN01", df_eval_alumno_5, df_act_basico, df_ce_basico, df_ra_basico, overrides=overrides)
        assert res["nota_final"] == 10.0

    def test_notas_ce_intermedias(self, df_ra_basico, df_ce_basico, df_act_basico, df_eval_alumno_mixto):
        """Verificar que las notas de CE se calculan correctamente."""
        res = calcular_notas_alumno("AN01", df_eval_alumno_mixto, df_act_basico, df_ce_basico, df_ra_basico)
        assert res["notas_ce"]["CE1a"] == pytest.approx(8.0, abs=0.01)
        assert res["notas_ce"]["CE1b"] == pytest.approx(6.0, abs=0.01)
        assert res["notas_ce"]["CE2a"] == pytest.approx(4.0, abs=0.01)
        assert res["notas_ce"]["CE2b"] == pytest.approx(2.0, abs=0.01)

    def test_feoe_dualizado(self, df_ce_basico, df_act_basico, df_eval_alumno_10):
        """RA dualizado debe promediar nota clase + nota empresa."""
        df_ra_dual = pd.DataFrame([
            {"id_ra": "RA1", "peso_ra": 60.0, "is_dual": True, "desc_ra": "Resultado 1 Dual"},
            {"id_ra": "RA2", "peso_ra": 40.0, "is_dual": False, "desc_ra": "Resultado 2"},
        ])
        df_feoe = pd.DataFrame([
            {"ID": "AN01", "RA1": 4}  # 4 → 10.0 en la conversión
        ])
        res = calcular_notas_alumno("AN01", df_eval_alumno_10, df_act_basico, df_ce_basico, df_ra_dual, df_feoe=df_feoe)
        # RA1 sin FEOE = 10, con FEOE = (10 + 10) / 2 = 10
        assert res["notas_ra"]["RA1"] == pytest.approx(10.0, abs=0.01)

    def test_feoe_nota_baja(self, df_ce_basico, df_act_basico, df_eval_alumno_10):
        """FEOE con nota empresa 1 (=3.0) debe bajar la media."""
        df_ra_dual = pd.DataFrame([
            {"id_ra": "RA1", "peso_ra": 60.0, "is_dual": True, "desc_ra": "Resultado 1 Dual"},
            {"id_ra": "RA2", "peso_ra": 40.0, "is_dual": False, "desc_ra": "Resultado 2"},
        ])
        df_feoe = pd.DataFrame([
            {"ID": "AN01", "RA1": 1}  # 1 → 3.0 en la conversión
        ])
        res = calcular_notas_alumno("AN01", df_eval_alumno_10, df_act_basico, df_ce_basico, df_ra_dual, df_feoe=df_feoe)
        # RA1 = (10 + 3.0) / 2 = 6.5
        assert res["notas_ra"]["RA1"] == pytest.approx(6.5, abs=0.01)


# ─────────────────────────────────────────────────────────────
# TESTS: get_sigad_info
# ─────────────────────────────────────────────────────────────

class TestGetSigadInfo:
    def test_insuficiente(self):
        n, cod, txt, col = get_sigad_info(3.5)
        assert cod == "IN"
        assert txt == "Insuficiente"

    def test_suficiente(self):
        n, cod, txt, col = get_sigad_info(5.0)
        assert cod == "SU"
        assert txt == "Suficiente"
        assert n == 5

    def test_bien(self):
        n, cod, txt, col = get_sigad_info(6.3)
        assert cod == "BI"

    def test_notable(self):
        n, cod, txt, col = get_sigad_info(7.8)
        assert cod == "NT"

    def test_sobresaliente(self):
        n, cod, txt, col = get_sigad_info(9.5)
        assert cod == "SB"
        assert txt == "Sobresaliente"

    def test_nota_cero(self):
        n, cod, txt, col = get_sigad_info(0.0)
        assert cod == "IN"
        assert n == 1  # Mínimo 1

    def test_nota_diez(self):
        n, cod, txt, col = get_sigad_info(10.0)
        assert cod == "SB"
        assert n == 10

    def test_frontera_4_99(self):
        """4.99 debe ser Insuficiente."""
        _, cod, _, _ = get_sigad_info(4.99)
        assert cod == "IN"

    def test_frontera_5_00(self):
        """5.00 debe ser Suficiente."""
        _, cod, _, _ = get_sigad_info(5.00)
        assert cod == "SU"

    def test_frontera_8_99(self):
        """8.99 debe ser Notable (< 9)."""
        _, cod, _, _ = get_sigad_info(8.99)
        assert cod == "NT"

    def test_frontera_9_00(self):
        """9.00 debe ser Sobresaliente (>= 9)."""
        _, cod, _, _ = get_sigad_info(9.00)
        assert cod == "SB"
