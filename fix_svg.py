import re

with open('public/logo.svg', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace fill attributes with #000000
content = re.sub(r'fill="[^"]*"', 'fill="#000000"', content)

# Replace stroke attributes with #000000
content = re.sub(r'stroke="[^"]*"', 'stroke="#000000"', content)

# Remove opacity attributes
content = re.sub(r'opacity="[^"]*"', '', content)
content = re.sub(r'fill-opacity="[^"]*"', '', content)
content = re.sub(r'stroke-opacity="[^"]*"', '', content)
content = re.sub(r'filter="[^"]*"', '', content)
content = re.sub(r'mask="[^"]*"', '', content)
content = re.sub(r'style="[^"]*"', '', content)

with open('public/logo.svg', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done processing logo.svg')
