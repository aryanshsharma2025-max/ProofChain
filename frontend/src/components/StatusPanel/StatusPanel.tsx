import type { VerificationStatus } from '../../types';
import styles from './StatusPanel.module.css';

interface StatusPanelProps {
  status: VerificationStatus;
}

const STATUS_LABELS: Record<VerificationStatus, string> = {
  ready: 'Ready',
  processing: 'Processing',
  incomplete: 'Incomplete',
  verified: 'Verified',
  suspicious: 'Suspicious',
  failed: 'Failed',
};

export default function StatusPanel({ status }: StatusPanelProps) {
  return (
    <div className={styles.panel} id="status-panel">
      <p className={styles.panelTitle}>Verification Status</p>
      <div className={`${styles.statusBadge} ${styles[status]}`}>
        <span className={styles.statusDot} />
        {STATUS_LABELS[status]}
      </div>
    </div>
  );
}
