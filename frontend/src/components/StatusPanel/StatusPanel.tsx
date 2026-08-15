import type { VerificationStatus } from '../../types';
import styles from './StatusPanel.module.css';

interface StatusPanelProps {
  status: VerificationStatus;
}

const STATUS_LABELS: Record<VerificationStatus, string> = {
  ready: 'READY TO VERIFY',
  processing: 'VERIFICATION IN PROGRESS',
  incomplete: 'INCOMPLETE VERIFICATION',
  verified: 'VERIFIED CREDENTIAL',
  suspicious: 'SUSPICIOUS / EVIDENCE MISMATCH',
  failed: 'VERIFICATION FAILED',
};

const STATUS_DESCRIPTIONS: Record<VerificationStatus, string> = {
  ready: 'Upload a credential document to initiate automated cryptographic and OCR evidence verification.',
  processing: 'Computing SHA-256 hash, querying trusted database registry, extracting OCR text, and running consistency checks...',
  incomplete: 'Trusted database match confirmed, but complete verification is blocked by missing or non-implemented check layers.',
  verified: 'All deterministic verification layers passed without discrepancy against trusted records.',
  suspicious: 'Discrepancy detected between document evidence and trusted database records (e.g., hash or field mismatch).',
  failed: 'System encountered an unrecoverable failure during file processing or metadata extraction.',
};

export default function StatusPanel({ status }: StatusPanelProps) {
  return (
    <div className={`${styles.panel} ${styles[status]}`} id="status-panel">
      <div className={styles.headerRow}>
        <span className={styles.panelTitle}>Verification Status</span>
        <div className={`${styles.statusBadge} ${styles[`badge_${status}`]}`}>
          <span className={styles.statusDot} />
          {STATUS_LABELS[status]}
        </div>
      </div>
      <p className={styles.description}>{STATUS_DESCRIPTIONS[status]}</p>
    </div>
  );
}
