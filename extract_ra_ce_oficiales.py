#!/usr/bin/env python3
"""Extrae RA y CE oficiales del módulo 0552 SIRL"""
from pathlib import Path
import re

t = Path('boa_sti_extracted.txt').read_text(encoding='utf-8')

# Buscar la sección de RA y CE
start = t.find('Resultados de aprendizaje y criterios de evaluación:')
if start == -1:
    start = t.find('Resultados de aprendizaje')
    
end = t.find('Contenidos:', start)
if end == -1:
    end = start + 10000

section = t[start:end]
print("=== SECCIÓN RA/CE ===")
print(section[:3000])
print("\n=== EXTRACCIÓN DE RA ===")

# Extraer RA (empiezan con "Selecciona", "Configura", "Integra", "Realiza", "Mantiene")
ra_pattern = re.compile(r'([A-Z][^\.]{50,500})\.?\s+Criterios de evaluación:')
ra_matches = ra_pattern.findall(section)
for i, ra in enumerate(ra_matches, 1):
    print(f"RA{i}: {ra.strip()}")

print("\n=== EXTRACCIÓN DE CE ===")
# Extraer CE (empiezan con "Se han")
ce_pattern = re.compile(r'Se han ([^\.]+\.)')
ce_matches = ce_pattern.findall(section)
for i, ce in enumerate(ce_matches, 1):
    print(f"CE{i}: Se han {ce.strip()}")
