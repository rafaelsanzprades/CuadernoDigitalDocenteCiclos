import sqlite3
import json

def to_sentence_case(text):
    if not text:
        return text
    text = text.strip()
    # Check if the string is all uppercase
    if text.isupper():
        if len(text) > 1:
            return text[0].upper() + text[1:].lower()
        return text.upper()
    return text

def main():
    db_path = 'backend/cdd_pro.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Update learning_outcomes table
    cursor.execute("SELECT id, description FROM learning_outcomes")
    rows = cursor.fetchall()
    updated_db_rows = 0

    for row_id, description in rows:
        new_desc = to_sentence_case(description)
        if new_desc != description:
            cursor.execute("UPDATE learning_outcomes SET description = ? WHERE id = ?", (new_desc, row_id))
            updated_db_rows += 1

    # 2. Update module_documents JSON data
    cursor.execute("SELECT id, data FROM module_documents")
    docs = cursor.fetchall()
    updated_docs = 0

    for doc_id, data_str in docs:
        try:
            data = json.loads(data_str)
            modified = False
            
            # Check for learning outcomes in df_ra
            if 'df_ra' in data and isinstance(data['df_ra'], list):
                for item in data['df_ra']:
                    if isinstance(item, dict) and 'desc_ra' in item:
                        old_desc = item['desc_ra']
                        new_desc = to_sentence_case(old_desc)
                        if new_desc != old_desc:
                            item['desc_ra'] = new_desc
                            modified = True
            
            if modified:
                new_data_str = json.dumps(data, ensure_ascii=False)
                cursor.execute("UPDATE module_documents SET data = ? WHERE id = ?", (new_data_str, doc_id))
                updated_docs += 1
        except Exception as e:
            print(f"Error processing document {doc_id}: {e}")

    conn.commit()
    conn.close()

    print(f"Successfully updated {updated_db_rows} learning outcomes in the 'learning_outcomes' table.")
    print(f"Successfully updated {updated_docs} documents in the 'module_documents' table.")

if __name__ == '__main__':
    main()
