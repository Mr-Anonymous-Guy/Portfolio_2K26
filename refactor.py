import os
import shutil

src = 'c:/Mr-Anonymous-Guy/Portfolio/src'

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

# Delete dead code
dead_files = [
    'components/MyWay/SMyWayModule.backup.ts',
    'utils/Emitter.js',
    'utils/Ticker.js'
]
for f in dead_files:
    path = os.path.join(src, f)
    if os.path.exists(path):
        os.remove(path)

# Establish directories
dirs = [
    'features/Hero/components',
    'features/Projects/Work',
    'features/Projects/MyWay',
    'features/Contact/CTA',
    'features/Loader',
    'features/Services',
    'components/shared/Nav',
    'animations/components',
    'services/audio'
]
for d in dirs:
    ensure_dir(os.path.join(src, d))

# Moves mapped as { source: destination }
moves = {
    # Step 2: Establish /features
    'components/Hero/Hero.scss': 'features/Hero/components/Hero.scss',
    'components/Hero/Hero.tsx': 'features/Hero/components/Hero.tsx',
    'components/Hero/index.tsx': 'features/Hero/components/index.tsx',
    'sections/Hero.tsx': 'features/Hero/HeroSection.tsx',
    'components/SourceHero.tsx': 'features/Hero/SourceHero.tsx',

    'components/Work/AWork.scss': 'features/Projects/Work/AWork.scss',
    'components/Work/AWork.tsx': 'features/Projects/Work/AWork.tsx',
    'components/Work/SWork.scss': 'features/Projects/Work/SWork.scss',
    'components/Work/SWork.tsx': 'features/Projects/Work/SWork.tsx',

    'components/MyWay/Section.ts': 'features/Projects/MyWay/Section.ts',
    'components/MyWay/SMyWay.scss': 'features/Projects/MyWay/SMyWay.scss',
    'components/MyWay/SMyWay.tsx': 'features/Projects/MyWay/SMyWay.tsx',

    'sections/Projects.tsx': 'features/Projects/ProjectsSection.tsx',

    'components/CTA/SCTA.scss': 'features/Contact/CTA/SCTA.scss',
    'components/CTA/SCTA.tsx': 'features/Contact/CTA/SCTA.tsx',

    'sections/Contact.tsx': 'features/Contact/ContactSection.tsx',

    'components/Loader/Loader.scss': 'features/Loader/Loader.scss',
    'components/Loader/Loader.tsx': 'features/Loader/Loader.tsx',
    'components/Loader/index.tsx': 'features/Loader/index.tsx',

    'components/SourceIntroduction.tsx': 'features/Services/SourceIntroduction.tsx',
    'components/SourceServices.tsx': 'features/Services/SourceServices.tsx',

    # Step 3: Organize Shared & Global Layers
    'components/Nav.tsx': 'components/shared/Nav/Nav.tsx',
    'components/Nav.scss': 'components/shared/Nav/Nav.scss',
    'components/AnimatedCounter.tsx': 'components/shared/AnimatedCounter.tsx',
    'components/CustomCursor.tsx': 'components/shared/CustomCursor.tsx',
    'components/Reveal.tsx': 'components/shared/Reveal.tsx',
    'components/SmoothScroll.tsx': 'components/shared/SmoothScroll.tsx',

    'components/animations/AnimatedText.tsx': 'animations/components/AnimatedText.tsx',
    'components/animations/AWaves.scss': 'animations/components/AWaves.scss',
    'components/animations/AWaves.tsx': 'animations/components/AWaves.tsx',
    'components/animations/LoadingIntro.tsx': 'animations/components/LoadingIntro.tsx',
    'components/animations/PerspectiveGrid.tsx': 'animations/components/PerspectiveGrid.tsx',
    'components/animations/WaveCanvas.tsx': 'animations/components/WaveCanvas.tsx',

    'audio/audioManager.ts': 'services/audio/audioManager.ts'
}

for src_path, dest_path in moves.items():
    full_src = os.path.join(src, src_path)
    full_dest = os.path.join(src, dest_path)
    if os.path.exists(full_src):
        shutil.move(full_src, full_dest)

# We must update imports in all files
# It's safer to just replace all string matches in the codebase
replace_map = {
    # Update relative imports to absolute `@/` imports first
    '"../store/ui"': '"@/store/ui"',
    '"../../utils/Emitter"': '"@/utils/Emitter"',
    '"../../utils/Ticker"': '"@/utils/Ticker"',
    '"../utils/Emitter"': '"@/utils/Emitter"',
    '"../utils/Ticker"': '"@/utils/Ticker"',
    '"../lib/lovable-error-reporting"': '"@/lib/lovable-error-reporting"',
    '"../lib/observerBridge"': '"@/lib/observerBridge"',
    '"../../lib/observerBridge"': '"@/lib/observerBridge"',
    '"../styles.css?url"': '"@/styles.css?url"',

    # Now update moved aliases
    '"@/components/Hero"': '"@/features/Hero/components"',
    '"@/sections/Hero"': '"@/features/Hero/HeroSection"',
    '"@/components/SourceHero"': '"@/features/Hero/SourceHero"',

    '"@/components/Work"': '"@/features/Projects/Work"',
    '"@/components/MyWay"': '"@/features/Projects/MyWay"',
    '"@/sections/Projects"': '"@/features/Projects/ProjectsSection"',

    '"@/components/CTA"': '"@/features/Contact/CTA"',
    '"@/sections/Contact"': '"@/features/Contact/ContactSection"',

    '"@/components/Loader"': '"@/features/Loader"',

    '"@/components/SourceIntroduction"': '"@/features/Services/SourceIntroduction"',
    '"@/components/SourceServices"': '"@/features/Services/SourceServices"',

    '"@/components/Nav"': '"@/components/shared/Nav/Nav"',
    '"@/components/AnimatedCounter"': '"@/components/shared/AnimatedCounter"',
    '"@/components/CustomCursor"': '"@/components/shared/CustomCursor"',
    '"@/components/Reveal"': '"@/components/shared/Reveal"',
    '"@/components/SmoothScroll"': '"@/components/shared/SmoothScroll"',

    '"@/components/animations/AnimatedText"': '"@/animations/components/AnimatedText"',
    '"@/components/animations/LoadingIntro"': '"@/animations/components/LoadingIntro"',
    '"@/components/animations/PerspectiveGrid"': '"@/animations/components/PerspectiveGrid"',
    '"@/components/animations/AWaves"': '"@/animations/components/AWaves"',
    '"@/components/animations/WaveCanvas"': '"@/animations/components/WaveCanvas"',

    '"@/audio/audioManager"': '"@/services/audio/audioManager"'
}

# Allow matching single quotes as well
final_replace_map = {}
for k, v in replace_map.items():
    final_replace_map[k] = v
    final_replace_map[k.replace('"', "'")] = v.replace('"', "'")

# Iterate over all files and replace
for root_dir, dirs, files in os.walk(src):
    for f in files:
        if f.endswith(('.tsx', '.ts', '.jsx', '.js', '.scss', '.css')):
            filepath = os.path.join(root_dir, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            
            modified = False
            for old, new in final_replace_map.items():
                if old in content:
                    content = content.replace(old, new)
                    modified = True
            
            # Special case for internal component imports that were relative
            if 'Nav' in filepath and './SourceHero' in content:
                content = content.replace('./SourceHero', '@/features/Hero/SourceHero')
                modified = True
            
            if 'index.tsx' in filepath and './Loader' in content:
                content = content.replace('./Loader', '@/features/Loader/Loader')
                modified = True

            if modified:
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(content)

# Clean up empty directories
empty_dirs = [
    'components/Hero',
    'components/Work',
    'components/MyWay',
    'components/CTA',
    'components/Loader',
    'components/animations',
    'audio',
    'sections'
]
for d in empty_dirs:
    path = os.path.join(src, d)
    try:
        os.rmdir(path)
    except:
        pass
