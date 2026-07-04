import manifest from './workManifest.json';

export interface WorkProject {
  id: string;
  slug: string;
  title: string;
  video: string;
  thumbnail: string;
  description: string;
  category: string;
  technologies: string[];
  featured: boolean;
  status: string;
  year: number;
  displayOrder: number;
  externalUrl: string;
  buttonLabel: string;
}

export const workManifest: WorkProject[] = manifest as WorkProject[];
