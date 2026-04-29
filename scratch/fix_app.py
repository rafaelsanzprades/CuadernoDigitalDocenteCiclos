import os

with open('app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Enclose lines 233 to 384 (indices 232 to 383)
    if i == 232:
        new_lines.append('    if st.session_state.auth["role"] != "alumno":\n')
    
    if 232 <= i <= 383:
        new_lines.append('        ' + line.lstrip(' ') if line.strip() else line)
        
    # Enclose lines 391 to 460 (indices 390 to 459)
    elif i == 390:
        new_lines.append(line)
        new_lines.append('if st.session_state.auth["role"] != "alumno":\n')
    elif 391 <= i <= 460:
        new_lines.append('    ' + line)
        
    else:
        new_lines.append(line)

with open('app.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
