declare module 'pdfjs-dist/legacy/build/pdf.mjs' {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  
  export function getDocument(params: { data: Buffer }): {
    promise: Promise<PDFDocument>;
  };
  
  export interface PDFDocument {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPage>;
  }
  
  export interface PDFPage {
    getViewport(params: { scale: number }): Viewport;
    render(params: {
      canvasContext: any;
      viewport: Viewport;
    }): {
      promise: Promise<void>;
    };
  }
  
  export interface Viewport {
    width: number;
    height: number;
  }
}

declare module 'pdfjs-dist/legacy/build/pdf.worker.mjs' {
  const worker: string;
  export default worker;
}

