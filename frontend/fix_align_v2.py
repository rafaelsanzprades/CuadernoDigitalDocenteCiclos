import os
import re

app_dir = r"c:\GD-rsp\APP\frontend\src\app"

for root, dirs, files in os.walk(app_dir):
    for f in files:
        if f == "page.tsx":
            path = os.path.join(root, f)
            with open(path, "r", encoding="utf-8") as file:
                content = file.read()

            original = content
            
            # 1. Standardize wrapper
            content = re.sub(r'<div className="([^"]*)pl-6([^"]*)">(\s*<h1)', r'<div className="mb-8">\3', content)
            content = re.sub(r'<div className="mb-\d+">(\s*<h1)', r'<div className="mb-8">\1', content)
            # Catch plain <div className="pl-6">
            content = re.sub(r'<div className="pl-6">(\s*<h1)', r'<div className="mb-8">\1', content)

            # 2. Standardize h1
            content = re.sub(r'<h1 className="[^"]*">', r'<h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">', content)
            
            # 3. Standardize subtitle <p className="text-muted...">
            content = re.sub(r'(</h1>\s*<p className=")text-muted[^"]*(">)', r'\1text-muted mt-2 text-lg\2', content)

            # 4. Standardize tabs wrapper
            content = re.sub(r'<div className="flex border-b border-\[var\(--glass-border\)\][^"]*overflow-x-auto scrollbar-hide">', r'<div className="flex border-b border-[var(--glass-border)] mb-8 overflow-x-auto scrollbar-hide">', content)

            # 5. Standardize tab buttons
            content = re.sub(r'px-6 py-3 font-bold text-sm', r'px-6 py-4 font-bold text-sm', content)
            
            # 6. Fix main padding-top
            content = re.sub(r'p-8 pt-4', r'p-8', content)

            if original != content:
                print(f"Updated {path}")
                with open(path, "w", encoding="utf-8") as file:
                    file.write(content)

print("Done!")
