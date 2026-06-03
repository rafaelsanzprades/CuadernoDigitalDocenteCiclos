from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List

class Sesion(BaseModel):
    ID: str
    id_ud: str
    Num_Orden: int | str
    Horas: int | str
    Tipo_Actividad: str
    RA_CE: Optional[str] = None
    Contenidos: Optional[str] = None
    Aspectos_Clave: Optional[str] = None
    Recursos: Optional[str] = None

class UnidadDidactica(BaseModel):
    id_ud: str
    desc_ud: str
    horas_ud: int | str
    ra_mappings: Optional[Dict[str, Any]] = None

class Tarea(BaseModel):
    ID: str
    id_act: Optional[str] = None
    Nombre_Tarea: Optional[str] = None
    Reto: Optional[str] = None
    RA_Asociados: Optional[str] = None
    Instrumento: Optional[str] = None
    desc_act: Optional[str] = None

class Alumnado(BaseModel):
    ID: Optional[str] = None
    student_id: Optional[str] = None
    Nombre: Optional[str] = None
    Apellidos: Optional[str] = None
    Estado: Optional[str] = None
    Edad: Optional[str] = None
    Nacimiento: Optional[str] = None
    Repite: Optional[str] = None
    Matricula: Optional[str] = None
    Comentarios: Optional[str] = None
    Email: Optional[str] = None
    Movil: Optional[str] = None

class ResultadoAprendizaje(BaseModel):
    id_ra: str
    desc_ra: Optional[str] = None
    peso_ra: int | str | float | None = None
    is_dual: Optional[str] = None

class CriterioEvaluacion(BaseModel):
    id_ce: str
    id_ra: str
    id_ud: Optional[str] = None
    desc_ce: Optional[str] = None
    peso_ce: int | str | float | None = None

class SeguimientoUD(BaseModel):
    id_ud: str
    horas_ud: int | str | float | None = None
    Total_Imp: int | str | float | None = None
    model_config = ConfigDict(extra="allow")

class CrmInteraccion(BaseModel):
    id: str
    fecha: str
    tipo: str
    descripcion: str
    contacto: str

class CrmEmpresa(BaseModel):
    id: str
    nombre: str
    contacto_nombre: str
    contacto_cargo: str
    telefono: str
    email: str
    direccion: str
    ciudad: str
    codigo_postal: str
    provincia: str
    sector: str
    notas: str
    estado: str
    interacciones: List[CrmInteraccion]
    alumnado_asignados: List[str]

class ModuleUpdateBody(BaseModel):
    df_ra: Optional[List[ResultadoAprendizaje]] = None
    df_ce: Optional[List[CriterioEvaluacion]] = None
    df_ud: Optional[List[UnidadDidactica]] = None
    df_sesiones: Optional[List[Sesion]] = None
    df_al: Optional[List[Alumnado]] = None
    df_act: Optional[List[Any]] = None
    df_eval: Optional[List[Any]] = None
    df_feoe: Optional[List[Any]] = None
    df_tareas: Optional[List[Tarea]] = None
    df_sgmt: Optional[List[SeguimientoUD]] = None
    df_pr: Optional[List[Any]] = None
    
    info_modulo: Optional[Dict[str, Any]] = None
    info_fechas: Optional[Dict[str, Any]] = None
    horario: Optional[Dict[str, Any]] = None
    planning_ledger: Optional[Dict[str, Any]] = None
    calendar_notes: Optional[Dict[str, Any]] = None
    tutoria_ledger: Optional[Dict[str, Any]] = None
    plano_clase: Optional[Any] = None
    daily_ledger: Optional[Dict[str, Any]] = None
    attendance_records: Optional[List[Any]] = None
    
    __version__: Optional[int] = None

    model_config = ConfigDict(extra="allow")
