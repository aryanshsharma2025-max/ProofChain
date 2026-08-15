import type { VerificationResult } from '../../types';
import styles from './ResultsPanel.module.css';

interface ResultsPanelProps {
  results: VerificationResult;
}

export default function ResultsPanel({ results }: ResultsPanelProps) {
  const { matchedCredential, ...analysisResults } = results;
  const entries = Object.values(analysisResults);

  return (
    <section className={styles.section} id="results-panel">
      <p className={styles.sectionTitle}>Evidence &amp; Results</p>

      {matchedCredential && (
        <div className={styles.credentialCard} id="matched-credential">
          <div className={styles.credentialHeader}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className={styles.credentialTitle}>Trusted Credential Match</span>
          </div>
          <div className={styles.credentialDetails}>
            <div className={styles.credentialRow}>
              <span className={styles.credentialLabel}>Credential ID</span>
              <span className={styles.credentialValue}>{matchedCredential.credential_id}</span>
            </div>
            <div className={styles.credentialRow}>
              <span className={styles.credentialLabel}>Holder</span>
              <span className={styles.credentialValue}>{matchedCredential.holder_name}</span>
            </div>
            <div className={styles.credentialRow}>
              <span className={styles.credentialLabel}>Issuer</span>
              <span className={styles.credentialValue}>{matchedCredential.issuer_name}</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {entries.map((item) => (
          <div className={styles.card} key={item.label}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>{item.label}</span>
              <span className={`${styles.cardStatus} ${styles[item.status]}`}>
                {item.status}
              </span>
            </div>
            {item.value && (
              <div className={styles.cardValue}>{item.value}</div>
            )}
            {item.detail && (
              <div className={styles.cardDetail}>{item.detail}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
