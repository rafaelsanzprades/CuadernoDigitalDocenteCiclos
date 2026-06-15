#!/usr/bin/env python3
"""Procesa el texto del SIRL para extraer datos estructurados"""
import re

with open("sirl_extracted.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Separar por líneas basándonos en patrones
# 1. Identificar UD (Unidades Didácticas)
ud_pattern = re.compile(r'UD\s*(\d+)|Unidad\s+Didáctica\s*(\d+)|UD\s*-\s*(\d+)', re.IGNORECASE)
ud_matches = ud_pattern.findall(text)
print("UD encontradas:", len(ud_matches))
for m in ud_matches[:10]:
    print(f"  {m}")

# 2. Identificar RA (Resultados de Aprendizaje)
ra_pattern = re.compile(r'RA\s*(\d+)|Resultado\s+de\s+Aprendizaje\s*(\d+)', re.IGNORECASE)
ra_matches = ra_pattern.findall(text)
print("\nRA encontradas:", len(ra_matches))
for m in ra_matches[:10]:
    print(f"  {m}")

# 3. Identificar CE (Criterios de Evaluación)
ce_pattern = re.compile(r'CE\s*(\d+)|Criterio\s+de\s+Evaluación\s*(\d+)', re.IGNORECASE)
ce_matches = ce_pattern.findall(text)
print("\nCE encontradas:", len(ce_matches))
for m in ce_matches[:10]:
    print(f"  {m}")

# 4. Buscar horas del módulo
horas_pattern = re.compile(r'(\d+)\s*horas', re.IGNORECASE)
horas_matches = horas_pattern.findall(text)
print("\nHoras encontradas:", horas_matches)

# 5. Extraer texto de UD
print("\n--- Texto de UD ---")
ud_texts = re.split(r'UD\s*\d+', text)
for i, ud_text in enumerate(ud_texts[1:11], 1):
    print(f"\nUD{i}:")
    print(ud_text[:200].strip())

# 6. Extraer texto de RA
print("\n--- Texto de RA ---")
ra_texts = re.split(r'RA\s*\d+', text)
for i, ra_text in enumerate(ra_texts[1:11], 1):
    print(f"\nRA{i}:")
    print(ra_text[:200].strip())
