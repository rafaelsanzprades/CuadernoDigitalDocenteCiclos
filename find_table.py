#!/usr/bin/env python3
"""Busca la tabla resumen de modulos con horas"""
from pathlib import Path
import re

t = Path('boa_sti_extracted.txt').read_text(encoding='utf-8')

# Buscar tablas con codigos de modulo y horas
# El formato tipico es: codigo + nombre + curso + horas + FOL
# Buscar cerca de 160 horas (que es el modulo 0552)
for m in re.finditer(r'160\s+horas', t, re.IGNORECASE):
    start = max(0, m.start() - 200)
    end = min(len(t), m.end() + 200)
    print(f"=== 160 horas at {m.start()} ===")
    print(t[start:end])
    print()

# Buscar tabla de creditos/ects
for m in re.finditer(r'ECTS', t):
    start = max(0, m.start() - 300)
    end = min(len(t), m.end() + 500)
    print(f"=== ECTS at {m.start()} ===")
    print(t[start:end])
    print()
