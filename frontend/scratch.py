import os
import re

def to_sentence_case(text):
    # Keep acronyms intact
    whitelist = r'\b(OG|RA|CE|UD|CPPS|FEOE|FCT|ICT|DUA|ACIS|ACS|LOMLOE|FP|IES|PD|IES)\b'
    
    def replace_func(match):
        word = match.group(0)
        if re.match(whitelist, word, re.IGNORECASE):
            return word.upper() # Enforce uppercase for acronyms
        return word.lower()

    # Lowercase everything except the first letter
    if not text:
        return text
        
    first_letter = text[0].upper()
    rest = re.sub(r'[a-zA-ZÁÉÍÓÚÑáéíóúñ]+', replace_func, text[1:])
    return first_letter + rest

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return
        
    original = content
    
    # 1. Remove tailwind classes uppercase and capitalize
    content = re.sub(r'\b(uppercase|capitalize)\b\s*', '', content)
    content = re.sub(r'className=([\"\'\`])\s+([\"\'\`])', r'className=\1\2', content)

    # 2. Find ALL CAPS text inside JSX nodes: >TEXTO<
    # We find strings between > and < that are at least 3 characters long and have uppercase letters.
    # We must be careful not to break JSX components like <MyComponent>.
    # So we match > (spaces) (ALL CAPS WORDS) (spaces) <
    def jsx_text_replace(match):
        inner_text = match.group(1)
        # If the inner text has no lowercase letters and contains letters, it's ALL CAPS
        if not re.search(r'[a-záéíóúñ]', inner_text) and re.search(r'[A-ZÁÉÍÓÚÑ]', inner_text):
            return ">" + to_sentence_case(inner_text) + "<"
        return match.group(0)

    # We match > followed by anything that isn't <, then <
    content = re.sub(r'>([^<]+)<', jsx_text_replace, content)
    
    # Also find hardcoded uppercase strings inside quotes that look like UI labels
    def quote_text_replace(match):
        quote = match.group(1)
        inner_text = match.group(2)
        if not re.search(r'[a-záéíóúñ]', inner_text) and re.search(r'[A-ZÁÉÍÓÚÑ]', inner_text) and len(inner_text) > 3:
            # We don't want to break keys or IDs, so we only convert if it has spaces (phrase) or is specifically matched
            if ' ' in inner_text or inner_text in ["DATOS FICTICIOS (DEMO)"]:
                return quote + to_sentence_case(inner_text) + quote
        return match.group(0)
        
    content = re.sub(r'([\"\'])([^\"\'\n]+)\1', quote_text_replace, content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed styles in {filepath}')

for root, dirs, files in os.walk('./src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            process_file(os.path.join(root, file))
