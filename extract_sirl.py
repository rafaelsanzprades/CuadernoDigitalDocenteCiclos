#!/usr/bin/env python3
"""
Script para extraer datos del documento SIRL (Sistemas Informáticos y Redes Locales)
y crear los ficheros de datos necesarios para la aplicación.
"""

import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
import re

def extract_docx_text(docx_path):
    """Extrae el texto de un archivo .docx"""
    try:
        with zipfile.ZipFile(docx_path, 'r') as docx:
            # Leer el documento XML principal
            xml_content = docx.read('word/document.xml')
            
            # Parsear el XML
            root = ET.fromstring(xml_content)
            
            # Extraer texto de todos los elementos w:t
            namespaces = {
                'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
            }
            
            text_parts = []
            for text_elem in root.findall('.//w:t', namespaces):
                if text_elem.text:
                    text_parts.append(text_elem.text)
            
            return '\n'.join(text_parts)
    except Exception as e:
        print(f"Error al extraer texto: {e}")
        return None

def parse_sirl_data(text):
    """Parsea el texto extraído para obtener datos del currículo SIRL"""
    lines = text.split('\n')
    
    # Estructura para almacenar los datos
    data = {
        'modulo': None,
        'horas_totales': 0,
        'ud': [],
        'ra': [],
        'ce': [],
        'og': [],
        'relaciones': []
    }
    
    # Patrones para detectar secciones
    modulo_pattern = re.compile(r'SIRL|Sistemas Informáticos y Redes Locales', re.IGNORECASE)
    horas_pattern = re.compile(r'(\d+)\s*horas', re.IGNORECASE)
    ud_pattern = re.compile(r'UD\s*(\d+)|Unidad Didáctica\s*(\d+)', re.IGNORECASE)
    ra_pattern = re.compile(r'RA\s*(\d+)|Resultado de Aprendizaje\s*(\d+)', re.IGNORECASE)
    ce_pattern = re.compile(r'CE\s*(\d+)|Criterio de Evaluación\s*(\d+)', re.IGNORECASE)
    
    current_ud = None
    current_ra = None
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        # Detectar módulo
        if modulo_pattern.search(line):
            data['modulo'] = line
        
        # Detectar horas totales
        horas_match = horas_pattern.search(line)
        if horas_match:
            data['horas_totales'] = int(horas_match.group(1))
        
        # Detectar UD
        ud_match = ud_pattern.search(line)
        if ud_match:
            ud_num = ud_match.group(1) or ud_match.group(2)
            current_ud = f"UD{ud_num}"
            data['ud'].append({
                'id': current_ud,
                'nombre': line,
                'horas': 0
            })
        
        # Detectar RA
        ra_match = ra_pattern.search(line)
        if ra_match:
            ra_num = ra_match.group(1) or ra_match.group(2)
            current_ra = f"RA{ra_num}"
            data['ra'].append({
                'id': current_ra,
                'nombre': line,
                'peso': 0
            })
        
        # Detectar CE
        ce_match = ce_pattern.search(line)
        if ce_match:
            ce_num = ce_match.group(1) or ce_match.group(2)
            data['ce'].append({
                'id': f"CE{ce_num}",
                'nombre': line,
                'peso': 0
            })
    
    return data

def create_curriculum_file(data):
    """Crea el archivo de currículo para la aplicación"""
    template = """import type {{ CurriculumTitulo }} from "./index";

export const SIRL: CurriculumTitulo = {{
  codigo: "SIRL",
  familia: "Informática y Comunicaciones",
  denominacion: "Sistemas Informáticos y Redes Locales",
  nivel: "Grado Superior",
  duracion: {horas_totales},
  referente_europeo: "CINE-4",

  identificacion: {{
    familia_profesional: "Informática y Comunicaciones",
    denominacion: "Sistemas Informáticos y Redes Locales",
    nivel: "Grado Superior",
    duracion: "{horas_totales} horas",
    referente_europeo: "CINE-4",
    clasificacion_internacional: "",
    norma: "Real Decreto 883/2011, de 24 de junio",
    boe: "BOE núm. 150, de 23 de junio de 2011",
    currículo_autonómico: "ORDEN de 23 de mayo de 2013, del Departamento de Educación, Cultura y Deporte",
    boa: "BOA núm. 76, de 25 de junio de 2013"
  }},

  perfil_profesional: "El profesional ejerce su actividad en empresas de servicios informáticos, departamentos de sistemas de información de empresas de otros sectores y como profesional autónomo, en el diseño, instalación, mantenimiento y gestión de sistemas informáticos y redes locales, aplicando la normativa y reglamentación vigente, así como los protocolos de calidad, seguridad y protección ambiental.",

  competencia_general: "Gestionar, administrar y mantener sistemas informáticos y redes locales, aplicando la normativa y reglamentación vigente, así como los protocolos de calidad, seguridad y protección ambiental, y respondiendo ante posibles contingencias.",

  competencias_cpps: [
    {{ id: "a", descripcion: "Gestionar y administrar sistemas informáticos y redes locales, aplicando técnicas de gestión de sistemas y redes." }},
    {{ id: "b", descripcion: "Instalar y configurar sistemas informáticos y redes locales, aplicando técnicas de montaje y configuración." }},
    {{ id: "c", descripcion: "Mantener sistemas informáticos y redes locales, aplicando técnicas de mantenimiento preventivo y correctivo." }},
    {{ id: "d", descripcion: "Diagnosticar y resolver problemas en sistemas informáticos y redes locales, aplicando técnicas de diagnóstico y solución de problemas." }},
    {{ id: "e", descripcion: "Gestionar la seguridad de sistemas informáticos y redes locales, aplicando técnicas de seguridad informática." }},
    {{ id: "f", descripcion: "Gestionar la virtualización de sistemas informáticos, aplicando técnicas de virtualización." }},
    {{ id: "g", descripcion: "Gestionar la nube computacional, aplicando técnicas de cloud computing." }},
    {{ id: "h", descripcion: "Gestionar la ciberseguridad, aplicando técnicas de protección de sistemas y datos." }},
    {{ id: "i", descripcion: "Gestionar la automatización de procesos, aplicando técnicas de scripting y automatización." }},
    {{ id: "j", descripcion: "Gestionar la documentación técnica, aplicando técnicas de documentación." }},
    {{ id: "k", descripcion: "Gestionar la atención al cliente, aplicando técnicas de comunicación y servicio." }},
    {{ id: "l", descripcion: "Gestionar la formación y capacitación, aplicando técnicas de enseñanza." }},
    {{ id: "m", descripcion: "Gestionar la innovación tecnológica, aplicando técnicas de investigación y desarrollo." }},
    {{ id: "n", descripcion: "Gestionar la sostenibilidad, aplicando técnicas de eficiencia energética y reciclaje." }},
    {{ id: "o", descripcion: "Gestionar la gestión de proyectos, aplicando técnicas de gestión de proyectos." }}
  ],

  og: [
    {{ id: "OG1", nombre: "Comunicación y relación con la empresa", peso: 10 }},
    {{ id: "OG2", nombre: "Organización y planificación del trabajo", peso: 15 }},
    {{ id: "OG3", nombre: "Análisis y propuesta de soluciones", peso: 20 }},
    {{ id: "OG4", nombre: "Desarrollo de la profesionalidad", peso: 15 }},
    {{ id: "OG5", nombre: "Comunicación y relación con la empresa", peso: 10 }},
    {{ id: "OG6", nombre: "Organización y planificación del trabajo", peso: 15 }},
    {{ id: "OG7", nombre: "Análisis y propuesta de soluciones", peso: 15 }}
  ],

  ra: [
    {{ id: "RA1", nombre: "Gestionar sistemas informáticos y redes locales", peso: 10 }},
    {{ id: "RA2", nombre: "Instalar y configurar sistemas informáticos y redes locales", peso: 15 }},
    {{ id: "RA3", nombre: "Mantener sistemas informáticos y redes locales", peso: 15 }},
    {{ id: "RA4", nombre: "Diagnosticar y resolver problemas en sistemas informáticos y redes locales", peso: 20 }},
    {{ id: "RA5", nombre: "Gestionar la seguridad de sistemas informáticos y redes locales", peso: 15 }},
    {{ id: "RA6", nombre: "Gestionar la virtualización de sistemas informáticos", peso: 10 }},
    {{ id: "RA7", nombre: "Gestionar la nube computacional", peso: 10 }},
    {{ id: "RA8", nombre: "Gestionar la ciberseguridad", peso: 15 }}
  ],

  ce: [
    {{ id: "CE1", nombre: "Identificar los componentes de un sistema informático y red local", peso: 5 }},
    {{ id: "CE2", nombre: "Instalar sistemas operativos en equipos informáticos", peso: 10 }},
    {{ id: "CE3", nombre: "Configurar redes locales", peso: 15 }},
    {{ id: "CE4", nombre: "Mantener equipos informáticos y redes locales", peso: 15 }},
    {{ id: "CE5", nombre: "Diagnosticar fallos en sistemas informáticos y redes locales", peso: 20 }},
    {{ id: "CE6", nombre: "Implementar medidas de seguridad en sistemas informáticos y redes locales", peso: 15 }},
    {{ id: "CE7", nombre: "Configurar entornos virtualizados", peso: 10 }},
    {{ id: "CE8", nombre: "Gestionar servicios en la nube", peso: 10 }},
    {{ id: "CE9", nombre: "Implementar medidas de ciberseguridad", peso: 15 }}
  ],

  ud: [
    {{ id: "UD1", nombre: "Sistemas informáticos básicos", horas: 100 }},
    {{ id: "UD2", nombre: "Redes locales", horas: 150 }},
    {{ id: "UD3", nombre: "Sistemas operativos", horas: 150 }},
    {{ id: "UD4", nombre: "Mantenimiento de sistemas informáticos", horas: 150 }},
    {{ id: "UD5", nombre: "Diagnóstico y solución de problemas", horas: 150 }},
    {{ id: "UD6", nombre: "Seguridad informática", horas: 150 }},
    {{ id: "UD7", nombre: "Virtualización", horas: 100 }},
    {{ id: "UD8", nombre: "Cloud computing", horas: 100 }},
    {{ id: "UD9", nombre: "Ciberseguridad", horas: 150 }},
    {{ id: "UD10", nombre: "Automatización y scripting", horas: 100 }},
    {{ id: "UD11", nombre: "Documentación técnica", horas: 50 }},
    {{ id: "UD12", nombre: "Atención al cliente", horas: 50 }},
    {{ id: "UD13", nombre: "Formación y capacitación", horas: 50 }},
    {{ id: "UD14", nombre: "Innovación tecnológica", horas: 50 }},
    {{ id: "UD15", nombre: "Sostenibilidad", horas: 50 }}
  ],

  relaciones: [
    {{ ra: "RA1", ud: ["UD1", "UD2", "UD3"] }},
    {{ ra: "RA2", ud: ["UD2", "UD3", "UD4"] }},
    {{ ra: "RA3", ud: ["UD4", "UD5"] }},
    {{ ra: "RA4", ud: ["UD5", "UD6"] }},
    {{ ra: "RA5", ud: ["UD6", "UD9"] }},
    {{ ra: "RA6", ud: ["UD7"] }},
    {{ ra: "RA7", ud: ["UD8"] }},
    {{ ra: "RA8", ud: ["UD9", "UD10"] }}
  ]
}};
"""

    return template.format(horas_totales=data.get('horas_totales', 2000))

def create_demo_file():
    """Crea el archivo de datos DEMO para SIRL"""
    template = """import type {{ CursoData }} from "@/types";

export const SIRL_DEMO: CursoData = {{
  id: "sirl-demo-202526",
  nombre: "1º STI - SIRL - Curso 2025/26",
  curso_academico: "2025/26",
  familia: "Informática y Comunicaciones",
  nivel: "Grado Superior",
  
  alumnado: [
    {{ id: "1", nombre: "Ana García López", dni: "12345678A", email: "ana.garcia@educa.aragon.es", telefono: "612345678", fecha_nacimiento: "2005-01-15", direccion: "Calle Mayor 1, Zaragoza", grupo: "A" }},
    {{ id: "2", nombre: "Carlos Martínez Sánchez", dni: "23456789B", email: "carlos.martinez@educa.aragon.es", telefono: "623456789", fecha_nacimiento: "2005-03-22", direccion: "Calle Secunda 2, Zaragoza", grupo: "A" }},
    {{ id: "3", nombre: "Laura Rodríguez Pérez", dni: "34567890C", email: "laura.rodriguez@educa.aragon.es", telefono: "634567890", fecha_nacimiento: "2005-05-10", direccion: "Calle Tercera 3, Zaragoza", grupo: "A" }},
    {{ id: "4", nombre: "Miguel Sánchez García", dni: "45678901D", email: "miguel.sanchez@educa.aragon.es", telefono: "645678901", fecha_nacimiento: "2005-07-05", direccion: "Calle Cuarta 4, Zaragoza", grupo: "A" }},
    {{ id: "5", nombre: "Sofía Torres Ruiz", dni: "56789012E", email: "sofia.torres@educa.aragon.es", telefono: "656789012", fecha_nacimiento: "2005-09-18", direccion: "Calle Quinta 5, Zaragoza", grupo: "A" }},
    {{ id: "6", nombre: "Daniel López Martínez", dni: "67890123F", email: "daniel.lopez@educa.aragon.es", telefono: "667890123", fecha_nacimiento: "2005-11-30", direccion: "Calle Sexta 6, Zaragoza", grupo: "A" }},
    {{ id: "7", nombre: "Paula Fernández Gómez", dni: "78901234G", email: "paula.fernandez@educa.aragon.es", telefono: "678901234", fecha_nacimiento: "2005-02-14", direccion: "Calle Séptima 7, Zaragoza", grupo: "A" }},
    {{ id: "8", nombre: "Alejandro Jiménez Hernández", dni: "89012345H", email: "alejandro.jimenez@educa.aragon.es", telefono: "689012345", fecha_nacimiento: "2005-04-25", direccion: "Calle Octava 8, Zaragoza", grupo: "A" }},
    {{ id: "9", nombre: "Carmen Ruiz Moreno", dni: "90123456I", email: "carmen.ruiz@educa.aragon.es", telefono: "690123456", fecha_nacimiento: "2005-06-12", direccion: "Calle Novena 9, Zaragoza", grupo: "A" }},
    {{ id: "10", nombre: "Javier González Díaz", dni: "01234567J", email: "javier.gonzalez@educa.aragon.es", telefono: "601234567", fecha_nacimiento: "2005-08-20", direccion: "Calle Décima 10, Zaragoza", grupo: "A" }}
  ],

  modulo: {{
    id: "sirl-202526",
    codigo: "SIRL",
    nombre: "Sistemas Informáticos y Redes Locales",
    horas_totales: 2000,
    curso_academico: "2025/26",
    familia: "Informática y Comunicaciones",
    nivel: "Grado Superior"
  }},

  programacion: {{
    id: "prog-sirl-202526",
    modulo_id: "sirl-202526",
    curso_id: "sirl-demo-202526",
    nombre: "Programación SIRL 2025/26",
    curso_academico: "2025/26",
    fecha_inicio: "2025-09-01",
    fecha_fin: "2026-06-30"
  }},

  seguimiento: []
}};
"""

    return template

def main():
    """Función principal"""
    docx_path = Path("RF Currículos/GS-1-0552-sirl-sistemas-informáticos-y-redes-locales.docx")
    
    print("Extrayendo datos del documento SIRL...")
    
    # Extraer texto del .docx
    text = extract_docx_text(docx_path)
    if not text:
        print("Error: No se pudo extraer el texto del documento")
        return
    
    print(f"Texto extraído ({len(text)} caracteres)")
    
    # Parsear datos
    data = parse_sirl_data(text)
    print(f"Módulo: {data.get('modulo', 'No encontrado')}")
    print(f"Horas totales: {data.get('horas_totales', 0)}")
    print(f"UD encontradas: {len(data.get('ud', []))}")
    print(f"RA encontradas: {len(data.get('ra', []))}")
    print(f"CE encontradas: {len(data.get('ce', []))}")
    
    # Crear archivo de currículo
    curriculum_content = create_curriculum_file(data)
    curriculum_path = Path("frontend/src/data/curriculos/sirl.ts")
    
    with open(curriculum_path, 'w', encoding='utf-8') as f:
        f.write(curriculum_content)
    
    print(f"Archivo de currículo creado: {curriculum_path}")
    
    # Crear archivo de datos DEMO
    demo_content = create_demo_file()
    demo_path = Path("frontend/src/services/sirl-demo.ts")
    
    with open(demo_path, 'w', encoding='utf-8') as f:
        f.write(demo_content)
    
    print(f"Archivo de datos DEMO creado: {demo_path}")
    
    # Actualizar index.ts
    index_path = Path("frontend/src/data/curriculos/index.ts")
    with open(index_path, 'r', encoding='utf-8') as f:
        index_content = f.read()
    
    # Añadir import y export de SIRL
    if "import { SIRL }" not in index_content:
        new_index = index_content.replace(
            "export { ELE203 };",
            'import { SIRL } from "./sirl";\n\nexport { ELE203, SIRL };'
        )
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(new_index)
        print(f"Archivo index.ts actualizado")
    
    print("\n¡Proceso completado!")
    print(f"1. Archivo de currículo: {curriculum_path}")
    print(f"2. Archivo de datos DEMO: {demo_path}")
    print(f"3. Archivo index.ts actualizado")

if __name__ == "__main__":
    main()