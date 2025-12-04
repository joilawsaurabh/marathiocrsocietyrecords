
export interface OCRLine {
  text: string;
  alternatives: string[];
  box_2d?: number[]; // [ymin, xmin, ymax, xmax] normalized 0-1000
}

export interface OCRRecord {
  id?: string; // Unique ID for state management
  file_name: string;
  document_type: string;
  flat_number: OCRLine; // The Sr No. from the first column
  original_owner: OCRLine; // Line 1
  transfers: OCRLine[]; // Line 2 to Line 6
  estimated_cost?: number; // Cost in USD
}

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ExportRow {
  id: string;
  fileName: string;
  flatNumber: string;
  originalOwner: string;
  transfer1: string;
  transfer2: string;
  transfer3: string;
  transfer4: string;
  transfer5: string;
  transfer6: string;
  stillToday: string;
}
