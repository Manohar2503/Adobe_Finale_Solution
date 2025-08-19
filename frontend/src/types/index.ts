export interface PdfDoc {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  title?: string;
  pages: number;
  sections: any[];
  dateISO: string;
  blob: File | null;
  status: 'processing' | 'ready' | 'error';
}
export interface DocumentSelection {
  text: string;
  page: number;
  rect?: DOMRect;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  page: number;
  match: number;
  pdf_url: string;
}

export interface Insights {
  keyInsights: string[];
  didYouKnow: string[];
  contradictions: string[];
  connections: string[];
}

export interface PodcastAudio {
  blob: Blob;
  duration: number;
  url: string;
}