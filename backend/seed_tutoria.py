import sqlite3
import json
import pandas as pd
import random
import os
from datetime import datetime

def seed():
    db_path = "c:/GD-rsp/APP/backend/cdd_pro.db"
    excel_path = "c:/GD-rsp/APP/RF Tutoría-Orientación/Orientación-ModeloSinAlumnadodo.xlsx"

    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    if not os.path.exists(excel_path):
        print(f"Error: Excel file not found at {excel_path}")
        return

    # 1. Read Excel file
    print("Reading Excel model...")
    xl = pd.ExcelFile(excel_path)
    df = xl.parse('2025-26')

    # Exclude columns we don't want to seed in tutoring ledger
    exclude_cols = {'ALUMNADO', 'CURSO', 'GRUPO', 'FECHA DE NACIMIENTO'}
    seed_cols = [col for col in df.columns if col not in exclude_cols]

    # Clean up rows that are completely empty
    df_clean = df.dropna(how='all')
    if df_clean.empty:
        print("Error: Excel sheet is empty")
        return

    # Convert row values to JSON-friendly types
    def clean_val(v):
        if pd.isna(v):
            return ""
        if isinstance(v, (datetime, pd.Timestamp)):
            return v.strftime("%Y-%m-%d")
        if isinstance(v, float):
            # check if it's integer float
            if v.is_integer():
                return int(v)
            return float(v)
        return str(v).strip()

    print(f"Loaded {len(df_clean)} rows of data from Excel.")

    # 2. Connect to sqlite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 3. Find all course documents
    cursor.execute("SELECT id, data FROM module_documents WHERE doc_type = 'curso'")
    courses = cursor.fetchall()

    print(f"Found {len(courses)} course documents in the database.")

    for doc_id, data_str in courses:
        data = json.loads(data_str)
        
        # Get students list (df_al) from document data
        df_al = data.get("df_al", [])
        if not df_al:
            # Check normalized course_students table
            cursor.execute("SELECT student_id, apellidos, nombre FROM course_students WHERE module_document_id = ?", (doc_id,))
            db_students = cursor.fetchall()
            df_al = [{"ID": s[0], "Apellidos": s[1], "Nombre": s[2]} for s in db_students]
        
        if not df_al:
            print(f"Course {doc_id} has no students. Skipping.")
            continue

        print(f"\nSeeding course {doc_id} with {len(df_al)} students...")
        tutoria_ledger = data.get("tutoria_ledger", {})
        
        for al in df_al:
            student_id = al.get("ID")
            if not student_id:
                continue
                
            # Select a random row from excel
            random_row = df_clean.sample(n=1).iloc[0]
            
            # Build student tutoria record
            student_tutoria = {}
            for col in seed_cols:
                val = random_row[col]
                student_tutoria[col] = clean_val(val)
                
            tutoria_ledger[student_id] = student_tutoria
            
        data["tutoria_ledger"] = tutoria_ledger
        
        # Update document back in database
        cursor.execute("UPDATE module_documents SET data = ? WHERE id = ?", (json.dumps(data), doc_id))
        print(f"Successfully seeded {len(df_al)} students for course {doc_id}.")

    conn.commit()
    conn.close()
    print("\nDatabase seeding completed successfully!")

if __name__ == "__main__":
    seed()
