#!/usr/bin/env python3
"""Extrae todo el contenido del modulo 0552 SIRL"""
from pathlib import Path

t = Path('boa_sti_extracted.txt').read_text(encoding='utf-8')

# Continuar desde donde se cortó
start = 70000
end = 85000
chunk = t[start:end]
print(chunk)
