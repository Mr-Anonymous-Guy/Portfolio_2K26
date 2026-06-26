import os
import json

src_dir = 'c:/Mr-Anonymous-Guy/Portfolio/src'

print("--- DIRECTORY TREE ---")
for root, dirs, files in os.walk(src_dir):
    level = root.replace(src_dir, '').count(os.sep)
    indent = ' ' * 4 * (level)
    print(f"{indent}{os.path.basename(root)}/")
    subindent = ' ' * 4 * (level + 1)
    for f in files:
        if f.endswith(('.ts', '.tsx', '.js', '.jsx', '.scss', '.css')):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                lines = len(file.readlines())
            if lines > 300:
                print(f"{subindent}{f} ({lines} lines) [LARGE]")
            else:
                print(f"{subindent}{f} ({lines} lines)")
