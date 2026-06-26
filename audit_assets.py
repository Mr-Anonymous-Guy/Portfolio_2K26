import os
import re

assets_dir = 'c:/Mr-Anonymous-Guy/Portfolio/src/assets'
src_dir = 'c:/Mr-Anonymous-Guy/Portfolio/src'

assets = os.listdir(assets_dir)
dependency_graph = {asset: [] for asset in assets}

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css', '.scss')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            for asset in assets:
                if asset in content:
                    dependency_graph[asset].append(os.path.relpath(filepath, src_dir))

for asset, deps in dependency_graph.items():
    print(f"- {asset}:")
    if deps:
        for dep in deps:
            print(f"  - {dep}")
    else:
        print("  - (Unused)")
