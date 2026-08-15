import type { VerificationResult } from '../../types';
import styles from './ResultsPanel.module.css';

interface ResultsPanelProps {
  results: VerificationResult;
}

export default function ResultsPanel({ results }: ResultsPanelProps) {
  const { matchedCredential, ocrText, consistency, ...analysisResults } = results;
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

      {consistency && (
        <div className={styles.consistencyCard} id="document-consistency">
          <div className={styles.consistencyHeader}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className={styles.consistencyTitle}>Document Consistency</span>
          </div>
          <div className={styles.consistencyDetails}>
            <div className={styles.consistencyRow}>
              <span className={styles.consistencyLabel}>Credential ID</span>
              <span className={`${styles.statusChip} ${styles[consistency.credential_id.status]}`}>
                {consistency.credential_id.status.toUpperCase().replace('_', ' ')}
              </span>
            </div>
            <div className={styles.consistencyRow}>
              <span className={styles.consistencyLabel}>Holder</span>
              <span className={`${styles.statusChip} ${styles[consistency.holder_name.status]}`}>
                {consistency.holder_name.status.toUpperCase().replace('_', ' ')}
              </span>
            </div>
            <div className={styles.consistencyRow}>
              <span className={styles.consistencyLabel}>Issuer</span>
              <span className={`${styles.statusChip} ${styles[consistency.issuer_name.status]}`}>
                {consistency.issuer_name.status.toUpperCase().replace('_', ' ')}
              </span>
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

      {ocrText && (
        <div className={styles.ocrPreview} id="ocr-preview">
          <p className={styles.ocrPreviewTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Extracted Text Preview
          </p>
          <pre className={styles.ocrPreviewText}>{ocrText}</pre>
        </div>
      )}
    </section>
  );
}
