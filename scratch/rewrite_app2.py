import sys
import re

with open('app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_descargas = False

for i, line in enumerate(lines):
    if 'opciones_globales = ["Introducción y planes", "Calendario académico"]' in line:
        line = line.replace('["Introducción y planes", "Calendario académico"]', '["Introducción y planes", "Calendario académico", "Descargas PDF"]')
        new_lines.append(line)
        continue

    # Skip the expander "Descargas .pdf" completely
    if 'with st.expander("📥 Descargas .pdf"):' in line:
        skip_descargas = True
        continue
        
    if skip_descargas:
        if '# --- MEJORA #8 + MEJORA #1' in line:
            skip_descargas = False
        else:
            continue

    # Enclose teacher sidebar UI
    if '# --- MEJORA #8 + MEJORA #1: Indicador visual de módulo activo + autoguardado ---' in line:
        new_lines.append('    if st.session_state.auth["role"] != "alumno":\n')
        
    if '# --- MEJORA #8 + MEJORA #1' in line or skip_descargas == False:
        # Check if we are between the start of Mejora 8 and the end of the sidebar
        # The end of the sidebar is marked by the first line without indentation after the sidebar
        # Wait, the end of the sidebar is at line 386 which is:
        # st.markdown('<p class="user-subtitle">(c) Rafael Sanz Prades</p>', unsafe_allow_html=True)
        pass

# It's much safer to find exactly the lines that need indentation.
# Let's read the file again and find line indices.
with open('app.py', 'r', encoding='utf-8') as f:
    original_lines = f.readlines()

output = []
in_descargas = False
in_teacher_sidebar = False
in_teacher_main = False

for i, line in enumerate(original_lines):
    # 1. Update opciones globales
    if 'opciones_globales = ["Introducción y planes", "Calendario académico"]' in line:
        line = line.replace('["Introducción y planes", "Calendario académico"]', '["Introducción y planes", "Calendario académico", "Descargas PDF"]')

    # 2. Add imports
    if line.startswith('from pages_ui import modulo_didactico,'):
        line = line.replace('portal_alumnado', 'portal_alumnado, descargas_pdf')

    # 3. Add to dispatcher
    if line.startswith("elif menu == 'Introducción y planes':"):
        output.append(line)
        output.append("    introduccion_planes.render_introduccion_planes(ro_pd, ro_curso, ro_global)\n")
        output.append("elif menu == 'Descargas PDF':\n")
        output.append("    descargas_pdf.render_descargas_pdf(ro_pd, ro_curso, ro_global)\n")
        continue
    if line.startswith("    introduccion_planes.render_introduccion_planes") and "elif menu == 'Introducción y planes':" in original_lines[i-1]:
        continue

    # 4. Skip Descargas block
    if 'with st.expander("📥 Descargas .pdf"):' in line:
        in_descargas = True
        continue
    if in_descargas and '# --- MEJORA #8 + MEJORA #1' in line:
        in_descargas = False
    if in_descargas:
        continue

    # 5. Teacher Sidebar UI (Indentation)
    if '# --- MEJORA #8 + MEJORA #1: Indicador visual' in line:
        output.append('    if st.session_state.auth["role"] != "alumno":\n')
        in_teacher_sidebar = True

    if in_teacher_sidebar:
        if line.startswith('# =========================================='):
            in_teacher_sidebar = False
            output.append(line)
        else:
            if line == '\n':
                output.append(line)
            else:
                output.append('    ' + line)
        continue

    # 6. Teacher Main UI (Indentation)
    if '# --- MEJORA #9: Banner + CSS overlay de solo lectura ---' in line:
        output.append(line)
        output.append('if st.session_state.auth["role"] != "alumno":\n')
        in_teacher_main = True
        continue
        
    if in_teacher_main:
        if line.startswith('# --- FIN MEJORA #9 ---'):
            in_teacher_main = False
            output.append(line)
        else:
            if line == '\n':
                output.append(line)
            else:
                output.append('    ' + line)
        continue

    output.append(line)

with open('app.py', 'w', encoding='utf-8') as f:
    f.writelines(output)
