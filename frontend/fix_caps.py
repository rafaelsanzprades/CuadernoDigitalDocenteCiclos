import os
import re

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return
    
    def replacer(match):
        prefix = match.group(1)
        first_char = match.group(2).upper()
        rest = match.group(3)
        return f">{prefix}{first_char}{rest}<"
        
    new_content = re.sub(r'>([^<a-zA-ZÁÉÍÓÚÑáéíóúñ{]*)([a-záéíóúñ])([^<]*)<', replacer, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Fixed", filepath)

for root, dirs, files in os.walk('./src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            fix_file(os.path.join(root, file))
