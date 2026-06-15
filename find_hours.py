#!/usr/bin/env python3
"""Busca la tabla de distribucion temporal y horas por UD del modulo 0552"""
from pathlib import Path
import re

t = Path('boa_sti_extracted.txt').read_text(encoding='utf-8')

# Buscar distribucion temporal o sesiones
for kw in ['istribuci', 'temporal', 'sesiones', 'créditos', 'creditos', 'horas por', 'Unidad']:
    for m in re.finditer(kw, t, re.IGNORECASE):
        start = max(0, m.start() - 100)
        end = min(len(t), m.end() + 200)
        ctx = t[start:end]
        print(f"=== '{kw}' at {m.start()} ===")
        print(ctx)
        print()
