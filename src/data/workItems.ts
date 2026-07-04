export interface WorkItem {
  id: string;
  title: string;
  subtitle: string;
  videoPath: string;
  githubUrl: string;
  category: string;
  year?: string;
  featured?: boolean;
}

// Define the human-readable formats for each folder
const FOLDER_TITLES: Record<string, string> = {
  C_Projects: 'C Projects',
  Cpp_Projects: 'C++ Projects',
  DataScience: 'Data Science',
  SIH: 'Smart India Hackathon',
  WebDev: 'Web Development',
  Wether: 'Weather Applications',
  Certificates: 'Certificates',
  Java: 'Java Projects',
  Python: 'Python Projects',
};

const FOLDER_SUBTITLES: Record<string, string> = {
  C_Projects: 'Systems Programming & Fundamentals',
  Cpp_Projects: 'Advanced Object-Oriented Systems',
  DataScience: 'Machine Learning & Analytics',
  SIH: 'Innovation Challenge Projects',
  WebDev: 'Modern Full Stack Applications',
  Wether: 'Real-Time Weather Experiences',
  Certificates: 'Professional Learning Journey',
  Java: 'Object-Oriented Applications',
  Python: 'Automation, AI & Utilities',
};

// Use Vite's glob import to automatically discover all supported videos in the public folder.
// This is executed at build time. The keys are the file paths (e.g., '/public/works/C_Projects/video.mp4')
// and the values are the resolved URLs string (because of { query: '?url', eager: true, import: 'default' })
const rawVideos = import.meta.glob('/public/works/**/*.{mp4,webm,mov,m4v}', { query: '?url', eager: true, import: 'default' });

export const workItems: WorkItem[] = Object.keys(rawVideos).map((key, index) => {
  // key is e.g. "/public/works/Employee_Management_CPP.mp4"
  const filename = key.split('/').pop() || '';
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  // Clean up the name for a better title
  const cleanTitle = nameWithoutExt.replace(/_/g, ' ').replace(/-/g, ' ');
  
  let category = 'WebDev';
  let subtitle = 'Portfolio Project';

  if (nameWithoutExt.toLowerCase().includes('cpp') || nameWithoutExt.toLowerCase().includes('c_')) {
    category = 'Cpp_Projects';
    subtitle = 'Systems Programming & Fundamentals';
  } else if (nameWithoutExt.toLowerCase().includes('java')) {
    category = 'Java';
    subtitle = 'Object-Oriented Applications';
  } else if (nameWithoutExt.toLowerCase().includes('python') || nameWithoutExt.toLowerCase().includes('data')) {
    category = 'Python';
    subtitle = 'Automation, AI & Utilities';
  } else {
    subtitle = 'Modern Full Stack Applications';
  }
  
  const videoPath = (rawVideos[key] as string) || key.replace('/public', '');
  
  return {
    id: `work-${nameWithoutExt}-${index}`,
    title: cleanTitle,
    subtitle,
    videoPath,
    githubUrl: 'https://github.com/Mr-Anonymous-Guy',
    category
  };
});
