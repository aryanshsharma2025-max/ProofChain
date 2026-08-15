import type { ConsistencyReport } from '../utils/consistency';

export type VerificationStatus =
  | 'ready'
  | 'processing'
  | 'incomplete'
  | 'verified'
  | 'suspicious'
  | 'failed';

export interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

export interface AnalysisResult {
  label: string;
  status: 'pending' | 'running' | 'complete' | 'error' | 'unavailable' | 'not_implemented';
  value?: string;
  detail?: string;
}

export interface MatchedCredential {
  credential_id: string;
  holder_name: string;
  issuer_name: string;
}

export interface VerificationResult {
  sha256: AnalysisResult;
  ocr: AnalysisResult;
  metadata: AnalysisResult;
  digitalSignature: AnalysisResult;
  blockchain: AnalysisResult;
  gemini: AnalysisResult;
  matchedCredential?: MatchedCredential;
  ocrText?: string;
  consistency?: ConsistencyReport;
}

export function createInitialResults(): VerificationResult {
  return {
    sha256: { label: 'SHA-256 Hash', status: 'pending' },
    ocr: { label: 'OCR Analysis', status: 'pending' },
    metadata: { label: 'Metadata Analysis', status: 'pending' },
    digitalSignature: { label: 'Signature Verification', status: 'not_implemented', detail: 'Not implemented' },
    blockchain: { label: 'Blockchain Proof', status: 'unavailable', detail: 'Not yet implemented' },
    gemini: { label: 'Gemini Analysis', status: 'unavailable', detail: 'Not yet implemented' },
  };
}
