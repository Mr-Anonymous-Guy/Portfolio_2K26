import os

src = 'c:/Mr-Anonymous-Guy/Portfolio/src'

# Files that were moved from level 2 to level 3 (or 3 to 4)
scss_files = [
    'features/Projects/Work/SWork.scss',
    'features/Contact/CTA/SCTA.scss',
    'features/Projects/MyWay/SMyWay.scss',
    'features/Projects/Work/AWork.scss',
    'features/Hero/components/Hero.scss',
    'features/Loader/Loader.scss',
    'components/shared/Nav/Nav.scss',
    'animations/components/AWaves.scss'
]

for scss in scss_files:
    filepath = os.path.join(src, scss)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Determine current depth vs target depth
        # For features/Projects/Work (3 levels), the root is ../../../
        # For features/Contact/CTA (3 levels) -> ../../../
        # For features/Loader (2 levels) -> ../../
        
        parts = scss.split('/')
        depth = len(parts) - 1
        prefix = '../' * depth
        
        # Naive replace: 
        content = content.replace('../../styles', prefix + 'styles')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("SCSS Fixes applied.")
