import os
import re

directories = [
    r"c:\GD-rsp\APP\frontend\src\app",
    r"c:\GD-rsp\APP\frontend\src\components\features"
]

for app_dir in directories:
    for root, dirs, files in os.walk(app_dir):
        for f in files:
            if f.endswith(".tsx"):
                path = os.path.join(root, f)
                with open(path, "r", encoding="utf-8") as file:
                    content = file.read()

                original = content
                
                def replace_block(match):
                    tag = match.group(1)
                    classes = match.group(2)
                    inner = match.group(3)
                    
                    # Don't touch main page titles
                    if "text-4xl" in classes:
                        return match.group(0)
                        
                    # Extract mb-X if it exists
                    mb_match = re.search(r'mb-\d+', classes)
                    mb = mb_match.group(0) if mb_match else ""
                    
                    new_classes = "text-2xl font-bold flex items-center gap-2 text-foreground"
                    if mb:
                        new_classes += f" {mb}"
                        
                    return f'<h2 className="{new_classes}">\n{inner}\n</h2>'
                
                # Match <h2/3/4> blocks with flex items-center gap-2
                content = re.sub(r'<(h[234]) className="([^"]*flex items-center gap-2[^"]*)">\s*(.*?)\s*</\1>', replace_block, content, flags=re.DOTALL)

                if original != content:
                    print(f"Updated {path}")
                    with open(path, "w", encoding="utf-8") as file:
                        file.write(content)

print("Done!")
