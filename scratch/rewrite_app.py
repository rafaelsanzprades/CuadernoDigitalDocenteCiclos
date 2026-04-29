import sys

with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update opciones_globales
content = content.replace(
    'opciones_globales = ["Introducción y planes", "Calendario académico"]',
    'opciones_globales = ["Introducción y planes", "Calendario académico", "Descargas PDF"]'
)

# 2. Remove Descargas expander
import re
# Find the start of the expander
pattern_descargas = r'    with st\.expander\("📥 Descargas \.pdf"\):.*?# --- MEJORA #8 \+ MEJORA #1'
content = re.sub(pattern_descargas, '    # --- MEJORA #8 + MEJORA #1', content, flags=re.DOTALL)

# 3. Add imports and dispatcher
content = content.replace(
    'from pages_ui import modulo_didactico, matrices, calendario_academico, matricula_alumnado, seguimiento_diario, instrumentos, calificacion_feoe, calificacion_academica, evaluacion_continua, programacion_aula, introduccion_planes, portal_alumnado\n',
    'from pages_ui import modulo_didactico, matrices, calendario_academico, matricula_alumnado, seguimiento_diario, instrumentos, calificacion_feoe, calificacion_academica, evaluacion_continua, programacion_aula, introduccion_planes, portal_alumnado, descargas_pdf\n'
)

content = content.replace(
    "elif menu == 'Introducción y planes':\n    introduccion_planes.render_introduccion_planes(ro_pd, ro_curso, ro_global)\n",
    "elif menu == 'Introducción y planes':\n    introduccion_planes.render_introduccion_planes(ro_pd, ro_curso, ro_global)\nelif menu == 'Descargas PDF':\n    descargas_pdf.render_descargas_pdf(ro_pd, ro_curso, ro_global)\n"
)

# 4. Hide teacher elements from alumnos
lines = content.split('\n')
new_lines = []

inside_sidebar_teacher = False
inside_main_teacher = False

for i, line in enumerate(lines):
    if '# --- MEJORA #8 + MEJORA #1: Indicador visual' in line:
        new_lines.append('    if st.session_state.auth["role"] != "alumno":')
        inside_sidebar_teacher = True
    
    if inside_sidebar_teacher:
        if line.startswith('    # =========================================='):
            inside_sidebar_teacher = False
            new_lines.append(line)
        else:
            if line.strip() == '':
                new_lines.append('')
            else:
                new_lines.append('    ' + line)
        continue

    if '# --- MEJORA #9: Banner + CSS' in line:
        new_lines.append('if st.session_state.auth["role"] != "alumno":')
        inside_main_teacher = True
        
    if inside_main_teacher:
        if line.startswith('# --- FIN MEJORA #9 ---'):
            inside_main_teacher = False
            new_lines.append('    ' + line)
        else:
            if line.strip() == '':
                new_lines.append('')
            else:
                new_lines.append('    ' + line)
        continue
        
    new_lines.append(line)

with open('app.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print("app.py successfully rewritten.")
