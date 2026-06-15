#!/usr/bin/env python3
"""Extrae CE y horas del texto SIRL"""
import re

with open("sirl_extracted.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Extraer CE de cada RA
print("=== CRITERIOS DE EVALUACIÓN ===")
ra_ce_pattern = re.compile(r'RA(\d+)\.\s*([^\n]+)(.*?)(?=RA\d+\.|SECUENCIACIÓN|$)', re.DOTALL)
ra_ce_matches = ra_ce_pattern.findall(text)

for ra_num, ra_desc, ra_content in ra_ce_matches[:5]:
    print(f"\nRA{ra_num}: {ra_desc.strip()[:80]}...")
    ce_pattern = re.compile(r'([a-z])\)\s*([^\n]+)')
    ce_matches = ce_pattern.findall(ra_content)
    if ce_matches:
        print("  Criterios de evaluación:")
        for ce_letter, ce_desc in ce_matches:
            print(f"    {ce_letter}) {ce_desc.strip()[:100]}")

# Extraer horas por UD
print("\n=== HORAS POR UD ===")
# Buscar tablas de horas
horas_pattern = re.compile(r'(\d+)\s*horas\s*UD\s*(\d+)|UD\s*(\d+)\s*:\s*(\d+)\s*horas', re.IGNORECASE)
horas_matches = horas_pattern.findall(text)
for h in horas_matches:
    print(h)

# Buscar horas en tablas
print("\n=== TABLAS DE HORAS ===")
# Buscar patrones como "UD1: 25 horas" o "UD1 25"
horas_pattern2 = re.compile(r'UD\s*(\d+)\s*[:\s]*(\d+)\s*horas', re.IGNORECASE)
horas_matches2 = horas_pattern2.findall(text)
for h in horas_matches2:
    print(f"UD{h[0]}: {h[1]} horas")

# Buscar horas en formato de tabla
horas_pattern3 = re.compile(r'(\d+)\s*sesiones\s*UD\s*(\d+)|UD\s*(\d+)\s*:\s*(\d+)\s*sesiones', re.IGNORECASE)
horas_matches3 = horas_pattern3.findall(text)
for h in horas_matches3:
    print(f"UD{h[0]}: {h[1]} sesiones")
