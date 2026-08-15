import { useState, useCallback } from 'react';
import type { UploadedFile, VerificationStatus, VerificationResult } from './types';
import { createInitialResults } from './types';
import { computeSHA256 } from './utils/hash';
import { extractFileMetadata } from './utils/metadata';
import { formatFileSize } from './utils/fileHelpers';
import { runOcr, OCR_PREVIEW_LIMIT } from './utils/ocr';
import { checkOcrConsistency } from './utils/consistency';
import { supabase } from './lib/supabase';

import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import DropZone from './components/DropZone/DropZone';
import VerifyButton from './components/VerifyButton/VerifyButton';
import StatusPanel from './components/StatusPanel/StatusPanel';
import ResultsPanel from './components/ResultsPanel/ResultsPanel';
import Footer from './components/Footer/Footer';

import './App.css';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [status, setStatus] = useState<VerificationStatus>('ready');
  const [results, setResults] = useState<VerificationResult>(createInitialResults());
  const [showResults, setShowResults] = useState(false);

  const handleFileSelect = useCallback((file: UploadedFile) => {
    setSelectedFile(file);
    setStatus('ready');
    setResults(createInitialResults());
    setShowResults(false);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setStatus('ready');
    setResults(createInitialResults());
    setShowResults(false);
  }, []);

  const handleVerify = useCallback(async () => {
    if (!selectedFile) return;

    setStatus('processing');
    setShowResults(true);

    // Start fresh results
    const newResults = createInitialResults();

    // --- SHA-256 Hash ---
    newResults.sha256 = { ...newResults.sha256, status: 'running' };
    setResults({ ...newResults });

    let hashComputed = false;
    let computedHash = '';

    try {
      computedHash = await computeSHA256(selectedFile.file);
      hashComputed = true;
      newResults.sha256 = {
        ...newResults.sha256,
        status: 'running',
        value: computedHash,
        detail: 'Hash computed — querying trusted records…',
      };
    } catch {
      newResults.sha256 = {
        ...newResults.sha256,
        status: 'error',
        detail: 'Failed to compute hash',
      };
    }
    setResults({ ...newResults });

    // --- Supabase Hash Lookup ---
    if (hashComputed) {
      try {
        const { data, error } = await supabase
          .from('credentials')
          .select('credential_id, holder_name, issuer_name, file_hash')
          .eq('file_hash', computedHash)
          .limit(1);

        if (error) {
          newResults.sha256 = {
            ...newResults.sha256,
            status: 'error',
            detail: `Supabase query failed: ${error.message}`,
          };
        } else if (data && data.length > 0) {
          // Hash match found
          const matched = data[0];
          newResults.sha256 = {
            ...newResults.sha256,
            status: 'complete',
            value: computedHash,
            detail: 'Trusted Hash Found — credential verified against database',
          };
          newResults.matchedCredential = {
            credential_id: matched.credential_id,
            holder_name: matched.holder_name,
            issuer_name: matched.issuer_name,
          };
        } else {
          // No match
          newResults.sha256 = {
            ...newResults.sha256,
            status: 'error',
            value: computedHash,
            detail: 'Hash Mismatch — no trusted record found',
          };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        newResults.sha256 = {
          ...newResults.sha256,
          status: 'error',
          detail: `Failed to query credentials: ${message}`,
        };
      }
      setResults({ ...newResults });
    }

    // --- Metadata Analysis ---
    newResults.metadata = { ...newResults.metadata, status: 'running' };
    setResults({ ...newResults });

    try {
      const meta = extractFileMetadata(selectedFile.file);
      newResults.metadata = {
        ...newResults.metadata,
        status: 'complete',
        value: `${meta.name} · ${meta.type} · ${formatFileSize(meta.size)}`,
        detail: `Last modified: ${meta.lastModified}`,
      };
    } catch {
      newResults.metadata = {
        ...newResults.metadata,
        status: 'error',
        detail: 'Failed to extract metadata',
      };
    }
    setResults({ ...newResults });

    // --- OCR Analysis ---
    newResults.ocr = { ...newResults.ocr, status: 'running', detail: 'Extracting text…' };
    setResults({ ...newResults });

    try {
      const ocrResult = await runOcr(selectedFile.file);
      if (ocrResult.success && ocrResult.text.length > 0) {
        const preview = ocrResult.text.length > OCR_PREVIEW_LIMIT
          ? ocrResult.text.slice(0, OCR_PREVIEW_LIMIT) + '…'
          : ocrResult.text;
        newResults.ocr = {
          ...newResults.ocr,
          status: 'complete',
          value: preview,
          detail: `Extracted ${ocrResult.text.length} characters`,
        };
        newResults.ocrText = ocrResult.text;
      } else if (ocrResult.success && ocrResult.text.length === 0) {
        newResults.ocr = {
          ...newResults.ocr,
          status: 'complete',
          value: '(no text detected)',
          detail: 'OCR completed but no readable text was found',
        };
      } else {
        newResults.ocr = {
          ...newResults.ocr,
          status: 'error',
          detail: ocrResult.error || 'OCR extraction failed',
        };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown OCR error';
      newResults.ocr = {
        ...newResults.ocr,
        status: 'error',
        detail: message,
      };
    }

    // --- OCR Consistency Check ---
    if (newResults.matchedCredential && newResults.ocrText) {
      newResults.consistency = checkOcrConsistency(
        newResults.ocrText,
        newResults.matchedCredential
      );
    }
    setResults({ ...newResults });

    // --- Digital Signature — NOT IMPLEMENTED ---
    // Signature verification is not yet implemented.
    // Status remains 'not_implemented' from createInitialResults().

    // --- Determine final verification status ---
    const sha256Failed = newResults.sha256.status === 'error';
    const metadataFailed = newResults.metadata.status === 'error';
    const ocrFailed = newResults.ocr.status === 'error';
    const ocrHasMismatch = newResults.consistency?.hasMismatch === true;

    const hasUnavailable = [
      newResults.digitalSignature,
      newResults.blockchain,
      newResults.gemini,
    ].some((r) => r.status === 'unavailable' || r.status === 'not_implemented');

    if (sha256Failed || !newResults.matchedCredential) {
      // Hash mismatch or query error — suspicious
      setStatus('suspicious');
    } else if (ocrHasMismatch) {
      // OCR mismatch while hash matches — suspicious
      setStatus('suspicious');
    } else if (metadataFailed || ocrFailed) {
      // A core analysis layer failed
      setStatus('failed');
    } else if (hasUnavailable || newResults.consistency?.hasNotFound) {
      // Hash matched, but OCR has missing fields or other verification layers are not implemented yet
      setStatus('incomplete');
    } else {
      // All analyses complete — only reachable when all layers are implemented
      setStatus('verified');
    }
  }, [selectedFile]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <DropZone
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          onClear={handleClear}
          disabled={status === 'processing'}
        />
        <VerifyButton
          onClick={handleVerify}
          disabled={!selectedFile}
          loading={status === 'processing'}
        />
        <StatusPanel status={status} />
        {showResults && <ResultsPanel results={results} />}
      </main>
      <Footer />
    </>
  );
}