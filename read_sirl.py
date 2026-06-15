#!/usr/bin/env python3
"""Lee el texto del .docx SIRL y lo guarda en un .txt para inspección"""
import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile("RF Currículos/GS-1-0552-sirl-sistemas-informáticos-y-redes-locales.docx", 'r') as docx:
    xml_content = docx.read('word/document.xml')
    root = ET.fromstring(xml_content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    parts = []
    for elem in root.findall('.//w:t', ns):
        if elem.text:
            parts.append(elem.text)
    text = ''.join(parts)

with open("sirl_extracted.txt", "w", encoding="utf-8") as f:
    f.write(text)
print(f"Guardado sirl_extracted.txt ({len(text)} chars)")
