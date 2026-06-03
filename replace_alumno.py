import os
import re

directories = ['c:/GD-rsp/APP/frontend/src', 'c:/GD-rsp/APP/backend']
extensions = ('.ts', '.tsx', '.py', '.md', '.json', '.txt', '.css')

def replace_alumno(content):
    count = 0
    
    # Lowercase
    new_content, n = re.subn(r'alumn[oa]s?', 'alumnado', content)
    count += n
    content = new_content
    
    # Capitalized
    new_content, n = re.subn(r'Alumn[oa]s?', 'Alumnado', content)
    count += n
    content = new_content
    
    # UPPERCASE
    new_content, n = re.subn(r'ALUMN[OA]S?', 'ALUMNADO', content)
    count += n
    content = new_content
    
    return content, count

total_replacements = 0
files_changed = 0

for directory in directories:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(extensions):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content, count = replace_alumno(content)
                    
                    if count > 0:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        total_replacements += count
                        files_changed += 1
                        print(f'Replaced {count} in {filepath}')
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")

print(f'\nTotal replacements: {total_replacements}')
print(f'Files changed: {files_changed}')
