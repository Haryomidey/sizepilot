export type FileType = 'image' | 'video' | 'pdf' | 'other';

export interface ProcessedFile {
  id: string;
  name: string;
  type: FileType;
  originalSize: number;
  newSize: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  timestamp: number;
  format: string;
  quality?: number;
  resolution?: string;
  outputName?: string;
  outputDataUrl?: string;
  previewDataUrl?: string;
  mimeType?: string;
}

export interface AIIntention {
  action: string;
  targetSize?: number; // in bytes
  format?: string;
  quality?: number;
  resolution?: string;
  platform?: string;
  confidence: number;
  suggestions: string[];
}

export interface HistoryItem extends ProcessedFile {}

export interface AppSettings {
  defaultMode: 'smart' | 'exact' | 'quality' | 'size' | 'balanced';
  defaultFormat: string;
  autoDownload: boolean;
  privacyMode: boolean;
}