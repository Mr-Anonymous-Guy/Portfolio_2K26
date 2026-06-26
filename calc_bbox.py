import re

with open('public/logo.svg', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all paths with d="..." and transform="translate(x,y)"
min_x = float('inf')
min_y = float('inf')
max_x = float('-inf')
max_y = float('-inf')

# We'll use a regex to extract coordinates from the 'd' string
for match in re.finditer(r'<path\s+d="([^"]+)"[^>]*transform="translate\(([^,]+),([^)]+)\)"', content):
    d_str = match.group(1)
    tx = float(match.group(2))
    ty = float(match.group(3))
    
    # Extract all numbers from d_str
    nums = [float(x) for x in re.findall(r'-?\d+(?:\.\d+)?', d_str)]
    
    # The numbers are coordinates, they come in pairs (x, y). This is an approximation as commands have different number of args, but typically x, y are there.
    for i in range(0, len(nums)-1, 2):
        x = nums[i] + tx
        y = nums[i+1] + ty
        min_x = min(min_x, x)
        max_x = max(max_x, x)
        min_y = min(min_y, y)
        max_y = max(max_y, y)

print(f"Bounding box: {min_x}, {min_y}, {max_x - min_x}, {max_y - min_y}")
