#!/usr/bin/env python3
"""Extrae todos los RA y CE del texto SIRL"""
import re

with open("sirl_extracted.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Extraer RA con su descripción completa
ra_pattern = re.compile(r'RA(\d+)\.\s*([^\n]+)(.*?)(?=RA\d+\.|SECUENCIACIÓN|RESULTADOS DE APRENDIZAJE|$)', re.DOTALL)
ra_matches = ra_pattern.findall(text)

print("=== RESULTADOS DE APRENDIZAJE ===")
for ra_num, ra_desc, ra_content in ra_matches[:10]:
    print(f"\nRA{ra_num}: {ra_desc.strip()}")
    # Extraer CE de este RA
    ce_pattern = re.compile(r'([a-z])\)\s*([^\n]+)')
    ce_matches = ce_pattern.findall(ra_content)
    if ce_matches:
        print("  Criterios de evaluación:")
        for ce_letter, ce_desc in ce_matches:
            print(f"    {ce_letter}) {ce_desc.strip()}")

# Extraer UD con horas
print("\n=== UNIDADES DIDÁCTICAS ===")
ud_pattern = re.compile(r'UD\s*(\d+)[.\s]*([^\n]+)')
ud_matches = ud_pattern.findall(text)
for ud_num, ud_desc in ud_matches:
    print(f"\nUD{ud_num}: {ud_desc.strip()}")

# Buscar horas por UD
print("\n=== HORAS POR UD ===")
# Buscar tablas o listas de horas
horas_pattern = re.compile(r'(\d+)\s*horas\s*UD\s*(\d+)|UD\s*(\d+)\s*:\s*(\d+)\s*horas', re.IGNORECASE)
horas_matches = horas_pattern.findall(text)
for h in horas_matches:
    print(h)
