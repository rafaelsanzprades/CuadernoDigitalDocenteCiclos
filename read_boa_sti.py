#!/usr/bin/env python3
"""Extrae texto del BOA STI usando rutas pathlib Unicode-safe"""
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

# find the file
candidates = list(Path('.').rglob('*BOA*STI*.docx'))
print(f"Found {len(candidates)} candidates:")
for c in candidates:
    print(f"  {c}")

if not candidates:
    exit(1)

docx_path = candidates[0]
print(f"Reading: {docx_path}")

with zipfile.ZipFile(str(docx_path), 'r') as docx:
    xml_content = docx.read('word/document.xml')
    root = ET.fromstring(xml_content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    parts = []
    for elem in root.findall('.//w:t', ns):
        if elem.text:
            parts.append(elem.text)
    text = ''.join(parts)

out = Path('boa_sti_extracted.txt')
out.write_text(text, encoding='utf-8')
print(f"Guardado {out} ({len(text)} chars)")
