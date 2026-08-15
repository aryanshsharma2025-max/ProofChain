import { useCallback, useRef, useState } from 'react';
import type { UploadedFile } from '../../types';
import { isAcceptedFile, formatFileSize, ACCEPT_STRING } from '../../utils/fileHelpers';
import styles from './DropZone.module.css';

interface DropZoneProps {
  onFileSelect: (file: UploadedFile) => void;
  selectedFile: UploadedFile | null;
  onClear: () => void;
  disabled?: boolean;
}

export default function DropZone({ onFileSelect, selectedFile, onClear, disabled }: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!isAcceptedFile(file)) {
        alert('Unsupported file type. Please upload a PDF, PNG, or JPG file.');
        return;
      }
      onFileSelect({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    },
    [onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile, disabled],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setDragActive(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(() => setDragActive(false), []);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so re-selecting the same file works
    e.target.value = '';
  };

  return (
    <div>
      <div
        id="dropzone"
        className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Upload credential file"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick();
        }}
      >
        <div className={styles.dropzoneIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <p className={styles.dropzoneTitle}>
          {dragActive ? 'Drop your file here' : 'Drag & drop your credential here'}
        </p>
        <p className={styles.dropzoneHint}>or click to browse · PDF, PNG, JPG</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_STRING}
          className={styles.hiddenInput}
          onChange={handleInputChange}
          id="file-input"
        />
      </div>

      {selectedFile && (
        <div className={styles.filePreview} id="file-preview">
          <div className={styles.fileIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <div className={styles.fileInfo}>
            <div className={styles.fileName}>{selectedFile.name}</div>
            <div className={styles.fileSize}>{formatFileSize(selectedFile.size)}</div>
          </div>
          <button
            className={styles.removeBtn}
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            aria-label="Remove file"
            id="remove-file-btn"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
