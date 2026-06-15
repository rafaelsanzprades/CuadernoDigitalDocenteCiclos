#!/usr/bin/env python3
"""Lee el texto completo y busca patrones de horas"""
import re

with open("sirl_extracted.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Buscar todas las apariciones de "horas"
horas_positions = []
for match in re.finditer(r'horas', text, re.IGNORECASE):
    start = max(0, match.start() - 100)
    end = min(len(text), match.end() + 100)
    context = text[start:end]
    horas_positions.append(context)

print("=== CONTEXTOS CON 'horas' ===")
for i, context in enumerate(horas_positions[:20]):
    print(f"\n{i+1}. {context}")

# Buscar tablas de UD
print("\n=== BUSCANDO TABLAS DE UD ===")
ud_table_pattern = re.compile(r'UD\s*(\d+)[^\n]*\n[^\n]*\n[^\n]*\n[^\n]*\n[^\n]*\n[^\n]*\n[^\n]*\n[^\n]*\n[^\n]*\n[^\n]*', re.DOTALL)
ud_tables = ud_table_pattern.findall(text)
for table in ud_tables[:5]:
    print(f"Tabla encontrada: {table}")

# Buscar "133 sesiones"
print("\n=== BUSCANDO '133 sesiones' ===")
sesiones_match = re.search(r'133 sesiones', text)
if sesiones_match:
    start = max(0, sesiones_match.start() - 200)
    end = min(len(text), sesiones_match.end() + 200)
    print(text[start:end])
