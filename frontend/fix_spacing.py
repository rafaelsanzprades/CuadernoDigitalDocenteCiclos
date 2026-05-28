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
            
            # 1. Remove mb-8 from title wrapper
            content = re.sub(r'<div className="mb-8">\s*<h1', r'<div>\n              <h1', content)
            
            # 2. Remove mb-8 from tabs wrapper
            content = re.sub(r'<div className="flex border-b border-\[var\(--glass-border\)\] mb-8 overflow-x-auto scrollbar-hide">', r'<div className="flex border-b border-[var(--glass-border)] overflow-x-auto scrollbar-hide">', content)

            # 3. For programacion specifically, there is a flex justify-between wrapper.
            # We will handle it in a separate edit tool, but let's try to remove mb-8 from flex justify-between wrappers if they just wrap the title.
            # <div className="flex justify-between items-center mb-8">
            content = re.sub(r'<div className="flex justify-between items-center mb-8">', r'<div className="flex justify-between items-center">', content)

            if original != content:
                print(f"Updated {path}")
                with open(path, "w", encoding="utf-8") as file:
                    file.write(content)

print("Done!")
