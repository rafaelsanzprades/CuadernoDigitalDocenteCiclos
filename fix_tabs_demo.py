"""Fix: Filter NUBE tab in demo mode."""
path = r'frontend/src/app/entorno/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the TABS array
old = '''  const TABS = [
    { id: "datos", label: <span className="flex items-center gap-2"><Database className="w-4 h-4 shrink-0" /> Gestor de archivos</span> },
    { id: "nube", label: <span className="flex items-center gap-2"><Cloud className="w-4 h-4 shrink-0" /> Sincronización con Google Drive</span> }
  ];'''

new = '''  const TABS = [
    { id: "datos", label: <span className="flex items-center gap-2"><Database className="w-4 h-4 shrink-0" /> Gestor de archivos</span> },
    ...(dataSource !== 'demo' ? [{ id: "nube", label: <span className="flex items-center gap-2"><Cloud className="w-4 h-4 shrink-0" /> Sincronización con Google Drive</span> }] : [])
  ];'''

if old in content:
    content = content.replace(old, new)
    print("TABS array updated!")
else:
    print("TABS array not found, trying with \\r\\n...")
    old_crlf = old.replace('\n', '\r\n')
    new_crlf = new.replace('\n', '\r\n')
    if old_crlf in content:
        content = content.replace(old_crlf, new_crlf)
        print("TABS array updated (CRLF)!")
    else:
        print("Still not found. Checking raw bytes...")
        # Try to find it manually
        idx = content.find('const TABS')
        if idx != -1:
            print(f"Found 'const TABS' at {idx}")
            print(repr(content[idx:idx+400]))
        else:
            print("'const TABS' not found at all!")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done!")
