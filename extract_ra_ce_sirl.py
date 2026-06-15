#!/usr/bin/env python3
"""Extrae RA/CE SOLO del modulo 0552 SIRL (pos 69030)"""
from pathlib import Path
import re

t = Path('boa_sti_extracted.txt').read_text(encoding='utf-8')

# El modulo 0552 empieza en ~69030 y termina antes de "Orientaciones pedagogicas"
start = 69030
end = t.find('Orientaciones pedag', start)
if end == -1:
    end = start + 15000

section = t[start:end]
print("Longitud:", len(section))
print()

# Extraer RA: empiezan con verbo en 3a persona y terminan antes de "Criterios"
# Patrón: texto hasta "Criterios de evaluación:"
ra_parts = re.split(r'Criterios de evaluaci[oó]n:', section)
print(f"Hay {len(ra_parts)-1} bloques RA+CE")
print()

for i, part in enumerate(ra_parts):
    if i == 0:
        # El primero es el header del modulo
        print("=== HEADER ===")
        print(part[:300])
        print()
        continue
    
    # El RA esta al principio del bloque anterior
    ra_text = ra_parts[i-1].rstrip('. ')
    # Tomar la ultima oracion como RA
    sentences = re.split(r'(?<=[a-záéíóú])\.(?=[A-Z\s])', ra_text)
    if len(sentences) > 1:
        ra_name = sentences[-1].strip().rstrip('.')
    else:
        ra_name = ra_text.strip().rstrip('.')
    
    # El CE esta en este bloque
    ce_text = part.strip()
    # Separar por "Se han" o "Se ha"
    ces = re.findall(r'Se (?:han? )[^\.]+\.', ce_text)
    
    print(f"RA{i}: {ra_name}")
    for j, ce in enumerate(ces, 1):
        print(f"  CE{i}.{j}: Se {ce}")
    print()
