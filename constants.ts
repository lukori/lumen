import { Project, Generation } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Ergonomic Mouse 2.0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=500&q=80',
    lastEdited: '2023-10-24T14:30:00Z',
    generations: [],
  },
  {
    id: 'p2',
    name: 'Ceramic Vase Series',
    thumbnailUrl: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=500&q=80',
    lastEdited: '2023-10-20T09:15:00Z',
    generations: [],
  },
  {
    id: 'p3',
    name: 'Audio Interface Concept',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598550476439-c913ac17b886?auto=format&fit=crop&w=500&q=80',
    lastEdited: '2023-10-18T16:45:00Z',
    generations: [],
  },
];

export const MOCK_METADATA_VARIATIONS = [
  {
    lighting: 'Softbox 45° Top-Left, Rim light right',
    camera: 'ISO 100, 85mm, f/2.8',
    environment: 'Minimalist concrete studio',
  },
  {
    lighting: 'Harsh sunlight simulation, diffused fill',
    camera: 'ISO 200, 50mm, f/8.0',
    environment: 'Warm architectural interior',
  },
  {
    lighting: 'Studio strobe key, blue gel backlight',
    camera: 'ISO 400, 35mm, f/4.0',
    environment: 'Dark void gradient',
  },
];