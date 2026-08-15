export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
];

const ACCEPTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];

export function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return ACCEPTED_EXTENSIONS.includes(ext);
}

export function isFileSizeValid(file: File): boolean {
  return file.size <= MAX_FILE_SIZE_BYTES;
}

export function getFileValidationError(file: File): string | null {
  if (!isAcceptedFile(file)) {
    return 'Unsupported file type. Please upload a PDF, PNG, or JPG file.';
  }
  if (!isFileSizeValid(file)) {
    return 'File size exceeds maximum limit of 15 MB.';
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0);
  return `${size} ${units[i]}`;
}

export const ACCEPT_STRING = '.pdf,.png,.jpg,.jpeg';
