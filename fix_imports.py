import os

src = 'c:/Mr-Anonymous-Guy/Portfolio/src'

replacements = {
    'routes/index.tsx': {
        '@/components/CTA/SCTA': '@/features/Contact/CTA/SCTA',
        '@/components/MyWay/SMyWay': '@/features/Projects/MyWay/SMyWay',
        '@/components/Work/SWork': '@/features/Projects/Work/SWork',
        '@/sections/Hero': '@/features/Hero/HeroSection',
        '@/sections/Projects': '@/features/Projects/ProjectsSection',
        '@/sections/Contact': '@/features/Contact/ContactSection'
    },
    'features/Services/SourceIntroduction.tsx': {
        './SourceHero': '@/features/Hero/SourceHero'
    },
    'features/Services/SourceServices.tsx': {
        './SourceHero': '@/features/Hero/SourceHero'
    }
}

for rel_path, replace_map in replacements.items():
    filepath = os.path.join(src, rel_path)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        for old, new in replace_map.items():
            content = content.replace(old, new)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Fixes applied.")
