export interface Project {
  id: string;
  name: string;
  thumbnailUrl: string;
  lastEdited: string; // ISO date string
  generations: Generation[];
}

export interface Generation {
  id: string;
  imageUrl: string;
  timestamp: number;
  prompt: string;
  aspectRatio: AspectRatioMode;
  metadata: TechnicalMetadata;
}

export interface TechnicalMetadata {
  lighting: string;
  camera: string;
  environment: string;
}

export type AspectRatioMode = 'portrait' | 'square' | 'landscape';

export interface UploadedFile {
  file: File;
  previewUrl: string;
  type: 'product' | 'lighting' | 'environment';
}