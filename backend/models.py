from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, DateTime, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

class Titularidad(enum.Enum):
    PUBLICA = "Pública"
    CONCERTADA = "Concertada"
    PRIVADA = "Privada"

class NivelFP(enum.Enum):
    BASICA = "Grado Básico"
    MEDIO = "Grado Medio"
    SUPERIOR = "Grado Superior"
    ESPECIALIZACION = "Curso de Especialización"

# ==========================================
# 1. MAESTROS Y TERRITORIO
# ==========================================
class Region(Base):
    __tablename__ = "regions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False) # ej: Aragón
    provinces = relationship("Province", back_populates="region")

class Province(Base):
    __tablename__ = "provinces"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    region_id = Column(Integer, ForeignKey("regions.id"))
    region = relationship("Region", back_populates="provinces")
    cities = relationship("City", back_populates="province")

class City(Base):
    __tablename__ = "cities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    province_id = Column(Integer, ForeignKey("provinces.id"))
    province = relationship("Province", back_populates="cities")

# ==========================================
# 2. FAMILIAS PROFESIONALES Y CURRÍCULO
# ==========================================
class ProfessionalFamily(Base):
    __tablename__ = "professional_families"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True) # ej: IFC para Informática
    name = Column(String, nullable=False)
    icon_url = Column(String) # Icono de eligetuprofesion.aragon.es
    color_hex = Column(String)
    degrees = relationship("Degree", back_populates="family")

class Degree(Base):
    __tablename__ = "degrees"
    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("professional_families.id"))
    level = Column(Enum(NivelFP), nullable=False)
    name = Column(String, nullable=False)
    hours = Column(Integer)
    
    family = relationship("ProfessionalFamily", back_populates="degrees")
    modules = relationship("Module", back_populates="degree")

class Module(Base):
    __tablename__ = "modules"
    id = Column(Integer, primary_key=True, index=True)
    degree_id = Column(Integer, ForeignKey("degrees.id"))
    code = Column(String) # ej: 0484
    name = Column(String, nullable=False) # ej: Bases de Datos
    hours = Column(Integer)
    is_dual = Column(Boolean, default=True) # Sujeto a FEOE
    
    degree = relationship("Degree", back_populates="modules")

# ==========================================
# 3. CENTROS EDUCATIVOS
# ==========================================
# Tabla asociativa para Centros y Títulos (Qué imparte cada centro)
center_degrees_table = Table(
    'center_degrees', Base.metadata,
    Column('center_id', Integer, ForeignKey('centers.id'), primary_key=True),
    Column('degree_id', Integer, ForeignKey('degrees.id'), primary_key=True)
)

class Center(Base):
    __tablename__ = "centers"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True) # Código oficial del centro
    name = Column(String, nullable=False)
    titularity = Column(Enum(Titularidad), nullable=False, default=Titularidad.PUBLICA)
    city_id = Column(Integer, ForeignKey("cities.id"))
    
    degrees = relationship("Degree", secondary=center_degrees_table)

# ==========================================
# 4. USUARIOS, ROLES Y CURSOS
# ==========================================
class AcademicYear(Base):
    __tablename__ = "academic_years"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True) # ej: 2024-2025
    is_active = Column(Boolean, default=False)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    surname = Column(String)
    is_superadmin = Column(Boolean, default=False)
    is_student = Column(Boolean, default=False)

# Rol: Pertenencia y COFOTAP
class CenterStaff(Base):
    __tablename__ = "center_staff"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    center_id = Column(Integer, ForeignKey("centers.id"), primary_key=True)
    is_center_admin = Column(Boolean, default=False) # COFOTAP

# Rol: Jefe de Estudios
class HeadOfStudies(Base):
    __tablename__ = 'head_of_studies'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    center_id = Column(Integer, ForeignKey('centers.id'))
    academic_year_id = Column(Integer, ForeignKey('academic_years.id'))

# Rol: Jefe de Departamento Didáctico
class DepartmentHead(Base):
    __tablename__ = 'department_heads'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    center_id = Column(Integer, ForeignKey('centers.id'))
    family_id = Column(Integer, ForeignKey('professional_families.id'))
    academic_year_id = Column(Integer, ForeignKey('academic_years.id'))

# Rol: Coordinador Dual (Nivel Centro)
class DualCoordinator(Base):
    __tablename__ = 'dual_coordinators'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    center_id = Column(Integer, ForeignKey('centers.id'))
    academic_year_id = Column(Integer, ForeignKey('academic_years.id'))

# Rol: Tutor Dual General (Prospector de Empresas por Centro o Familia)
class DualGeneralTutor(Base):
    __tablename__ = 'dual_general_tutors'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    center_id = Column(Integer, ForeignKey('centers.id'))
    family_id = Column(Integer, ForeignKey('professional_families.id'), nullable=True) # Opcional: filtrado por familia
    academic_year_id = Column(Integer, ForeignKey('academic_years.id'))

# Entidad Organizativa: Grupo/Clase (ej. 1º DAW Diurno)
class CourseGroup(Base):
    __tablename__ = "course_groups"
    id = Column(Integer, primary_key=True, index=True)
    center_id = Column(Integer, ForeignKey("centers.id"))
    degree_id = Column(Integer, ForeignKey("degrees.id"))
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))
    name = Column(String)

# Rol: Tutor de Grupo / Tutor Dual de Alumnos
class GroupTutor(Base):
    __tablename__ = "group_tutors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_group_id = Column(Integer, ForeignKey("course_groups.id"))
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))
    is_dual_tutor = Column(Boolean, default=False) # Si es el responsable de seguimiento Dual de este grupo

# Rol: Profesor (Asignación de Módulos)
class TeachingAssignment(Base):
    __tablename__ = "teaching_assignments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    module_id = Column(Integer, ForeignKey("modules.id"))
    course_group_id = Column(Integer, ForeignKey("course_groups.id"))
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))

# Rol: Alumnado (Matrícula)
class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    module_id = Column(Integer, ForeignKey("modules.id"))
    course_group_id = Column(Integer, ForeignKey("course_groups.id"))
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))

# ==========================================
# COMPATIBILIDAD CON SISTEMA JSON ANTERIOR
# ==========================================
class ModuleDocument(Base):
    __tablename__ = "module_documents"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
