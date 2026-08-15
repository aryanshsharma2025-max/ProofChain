export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  lastModified: string;
}

/**
 * Extract basic metadata from a File object.
 */
export function extractFileMetadata(file: File): FileMetadata {
  return {
    name: file.name,
    type: file.type || 'unknown',
    size: file.size,
    lastModified: new Date(file.lastModified).toISOString(),
  };
}
