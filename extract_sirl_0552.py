#!/usr/bin/env python3
"""Extrae RA/CE del modulo 0552 SIRL"""
from pathlib import Path

t = Path('boa_sti_extracted.txt').read_text(encoding='utf-8')

# Datos del modulo en pos 69030
start = 69020
end = 76000
chunk = t[start:end]
print(chunk)
