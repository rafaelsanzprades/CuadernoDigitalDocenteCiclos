#!/usr/bin/env python3
"""Busca datos del modulo 0552 SIRL en el BOA STI"""
from pathlib import Path
import re

t = Path('boa_sti_extracted.txt').read_text(encoding='utf-8')

# Buscar todos los '0552' y sus contextos
for m in re.finditer(r'0552', t):
    start = max(0, m.start() - 50)
    end = min(len(t), m.end() + 300)
    ctx = t[start:end]
    print(f"=== POS {m.start()} ===")
    print(ctx)
    print()

# Buscar tabla de modulos (patron: codigo + nombre + horas/sesiones)
print("\n=== BUSCANDO PATRON TABLA MODULOS ===")
# Las tablas suelen tener: codigo, nombre, curso, horas, FOL/FPB, evaluacion
tabla_pattern = re.compile(r'(\d{3,4})\.?\s+([A-Z][^\.]{10,60})\s+(\d)\s+(\d+)\s+(\d+)')
for m in tabla_pattern.finditer(t):
    print(f"Modulo: {m.group(1)} - {m.group(2).strip()} - Curso:{m.group(3)} - Horas:{m.group(4)} - Eval:{m.group(5)}")

# Buscar sesiones/horas en todo el documento
print("\n=== BUSCANDO 'sesiones' ===")
for m in re.finditer(r'sesiones', t):
    start = max(0, m.start() - 100)
    end = min(len(t), m.end() + 100)
    print(t[start:end])
    print("---")
