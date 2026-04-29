import os
import json

def fix_mojibake(obj):
    if isinstance(obj, str):
        try:
            # The string was read as Windows-1252 but it was actually UTF-8 bytes.
            # Convert back to bytes using Windows-1252 (or latin-1), then decode as UTF-8
            return obj.encode('latin-1').decode('utf-8')
        except (UnicodeEncodeError, UnicodeDecodeError):
            return obj
    elif isinstance(obj, dict):
        return {k: fix_mojibake(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [fix_mojibake(item) for item in obj]
    else:
        return obj

for file in os.listdir('.'):
    if file.endswith('.json'):
        try:
            with open(file, 'r', encoding='utf-8-sig') as f:
                data = json.load(f)
            
            fixed_data = fix_mojibake(data)
            
            with open(file, 'w', encoding='utf-8') as f:
                json.dump(fixed_data, f, ensure_ascii=False, indent=4)
            print(f"Fixed {file}")
        except Exception as e:
            print(f"Error processing {file}: {e}")
