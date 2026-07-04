import fs from 'fs';
import path from 'path';

const worksDir = path.join(process.cwd(), 'public', 'works');
const manifestPath = path.join(process.cwd(), 'src', 'data', 'workManifest.json');

// Supported extensions
const supportedExtensions = ['.mp4', '.webm', '.mov', '.m4v'];

// Format titles
function formatTitle(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  // Custom manual mappings based on the user's requirements
  if (nameWithoutExt === 'Employee_Management_CPP') return 'Employee Management (C++)';
  if (nameWithoutExt === 'Simple_Inventory_Cpp') return 'Simple Inventory (C++)';
  if (nameWithoutExt === 'cli-calc') return 'CLI Calculator';
  if (nameWithoutExt === 'personalize-assistant') return 'Personal AI Assistant';
  if (nameWithoutExt === 'Simple-Wether') return 'Simple Weather';
  if (nameWithoutExt === 'Pattern_Printer') return 'Pattern Printer';
  if (nameWithoutExt === 'PortfolioV1') return 'Portfolio V1';
  if (nameWithoutExt === 'Libarary_Management_CPP') return 'Library Management (C++)';
  if (nameWithoutExt === 'Number_Guessing_CPP') return 'Number Guessing (C++)';
  if (nameWithoutExt === 'Grade_calc_Java') return 'Grade Calculator (Java)';
  if (nameWithoutExt === 'Studen_Record_System') return 'Student Record System';
  
  // Default fallback cleaner
  return nameWithoutExt
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function determineCategory(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('cpp') || lower.includes('c_')) return 'C++';
  if (lower.includes('java')) return 'Java';
  if (lower.includes('python') || lower.includes('data')) return 'Python';
  return 'Web';
}

function generateManifest() {
  console.log('Generating Work Manifest...');
  
  // Read existing manifest
  let existingManifest: any[] = [];
  if (fs.existsSync(manifestPath)) {
    try {
      const content = fs.readFileSync(manifestPath, 'utf-8');
      existingManifest = JSON.parse(content);
    } catch (e) {
      console.warn('Failed to parse existing manifest. Starting fresh.');
    }
  }

  // Ensure works dir exists
  if (!fs.existsSync(worksDir)) {
    console.warn(`Works directory not found: ${worksDir}`);
    return;
  }

  // Scan for files
  const files = fs.readdirSync(worksDir);
  const videoFiles = files.filter(file => supportedExtensions.includes(path.extname(file).toLowerCase()));

  // Create a map of existing items by ID
  const existingMap = new Map(existingManifest.map(item => [item.id, item]));

  const newManifest = videoFiles.map(file => {
    const nameWithoutExt = file.replace(/\.[^/.]+$/, "");
    const id = nameWithoutExt.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Check if item already exists
    if (existingMap.has(id)) {
      const existing = existingMap.get(id);
      // Ensure the video path is correct in case the file extension changed
      existing.video = `/works/${file}`;
      return existing;
    }

    // Scaffold new item
    return {
      id,
      slug: id,
      title: formatTitle(file),
      video: `/works/${file}`,
      thumbnail: "",
      description: "",
      category: determineCategory(file),
      technologies: [],
      featured: false,
      status: "completed",
      year: new Date().getFullYear(),
      displayOrder: 0,
      externalUrl: "https://github.com/Mr-Anonymous-Guy",
      buttonLabel: "View Project"
    };
  });

  // Sort alphabetically by title by default
  newManifest.sort((a, b) => a.title.localeCompare(b.title));

  // Write to disk
  fs.writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2));
  console.log(`Manifest generated successfully with ${newManifest.length} items at ${manifestPath}`);
}

generateManifest();
