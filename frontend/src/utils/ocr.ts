import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/** OCR result returned by the service. */
export interface OcrResult {
  success: boolean;
  text: string;
  error?: string;
}

/** Maximum characters to preview in the UI. */
export const OCR_PREVIEW_LIMIT = 500;

/**
 * Run OCR on an image file (PNG / JPG / JPEG).
 * Sends the File blob directly to Tesseract.js.
 */
async function ocrImage(file: File): Promise<OcrResult> {
  const worker = await createWorker('eng');
  try {
    const { data: { text } } = await worker.recognize(file);
    return { success: true, text: text.trim() };
  } finally {
    await worker.terminate();
  }
}

/**
 * Run OCR on a PDF file.
 * Renders the first page to an off-screen canvas, then passes the
 * canvas to Tesseract.js for text extraction.
 */
async function ocrPdf(file: File): Promise<OcrResult> {
  // Load the PDF from an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  // Render the first page to a canvas at 2× scale for better OCR accuracy
  const page = await pdf.getPage(1);
  const scale = 2;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { success: false, text: '', error: 'Could not create canvas context' };
  }

  await page.render({ canvas, canvasContext: ctx, viewport }).promise;

  // Pass the rendered canvas to Tesseract
  const worker = await createWorker('eng');
  try {
    const { data: { text } } = await worker.recognize(canvas);
    return { success: true, text: text.trim() };
  } finally {
    await worker.terminate();
    // Clean up
    canvas.width = 0;
    canvas.height = 0;
  }
}

/**
 * Run OCR on a file. Dispatches to the correct handler based on MIME type.
 * Returns an OcrResult with the extracted text or an error message.
 */
export async function runOcr(file: File): Promise<OcrResult> {
  const type = file.type.toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  const isImage = type === 'image/png' || type === 'image/jpeg' || ['png', 'jpg', 'jpeg'].includes(ext);
  const isPdf = type === 'application/pdf' || ext === 'pdf';

  if (isImage) {
    return ocrImage(file);
  } else if (isPdf) {
    return ocrPdf(file);
  }

  return {
    success: false,
    text: '',
    error: `Unsupported file type for OCR: ${type || ext}`,
  };
}
