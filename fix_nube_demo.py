"""Fix: Hide NUBE tab and content in demo mode."""
import re

path = r'frontend/src/app/entorno/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1) Filter the tabs array to exclude 'nube' in demo mode
# Find the tabs definition
old_tabs = '{ id: "nube", label: <span className="flex items-center gap-2"><Cloud className="w-4 h-4 shrink-0" />'

# We need to wrap it. Let's find the full line.
# The tabs are in an array: tabs = [ { id: "datos", ... }, { id: "nube", ... } ]
# We want to conditionally filter: tabs = [ { id: "datos", ... }, ...(dataSource !== 'demo' ? [{ id: "nube", ... }] : []) ]

# Let's find and replace the nube tab entry
# First, let's find the exact nube tab text
nube_match = re.search(r'\{ id: "nube".*?\}', content, re.DOTALL)
if nube_match:
    nube_tab = nube_match.group(0)
    print(f"Found nube tab: {nube_tab[:80]}...")
    
    # Replace the tabs array construction to use conditional spread
    # The array ends with "];" after the nube tab
    # We need to find the full tabs array
    
    # Find "const tabs = [" or similar
    tabs_start = content.find('tabs = [')
    if tabs_start == -1:
        tabs_start = content.find('tabs=[')
    
    print(f"tabs_start at: {tabs_start}")
    
    # Show context
    print(repr(content[tabs_start-20:tabs_start+300]))
else:
    print("Nube tab not found!")

# 2) Fix the NUBE content section
old_content_pattern = r'\{/\*.*?NUBE.*?\*/\}\s*\{activeTab === "nube" && \(\s*<GoogleDriveSyncPanel />\s*\)\}'
new_content = '{/* PESTAÑA: NUBE (solo en modo datos reales) */}\n              {activeTab === "nube" && dataSource !== \'demo\' && (\n                <GoogleDriveSyncPanel />\n              )}'

content_new = re.sub(old_content_pattern, new_content, content, flags=re.DOTALL)

if content_new != content:
    print("NUBE content section replaced!")
    content = content_new
else:
    print("NUBE content section NOT replaced - trying manual approach")
    # Manual approach using the known byte positions
    # Find the NUBE comment
    idx = content.find('NUBE')
    if idx != -1:
        # Get surrounding context
        start = content.rfind('{', 0, idx)
        # Find the closing )}  after GoogleDriveSyncPanel
        end = content.find(')}', content.find('GoogleDriveSyncPanel', idx)) + 2
        old_block = content[start:end]
        print(f"Found block: {repr(old_block[:100])}")
        
        new_block = "{/* PESTAÑA: NUBE (solo en modo datos reales) */}\n              {activeTab === \"nube\" && dataSource !== 'demo' && (\n                <GoogleDriveSyncPanel />\n              )}"
        content = content[:start] + new_block + content[end:]
        print("Replaced!")

# Write back
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
