import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} id="app-footer">
      <div className={styles.footerContent}>
        <span>ProofChain &copy; {new Date().getFullYear()} &mdash; Cryptographic Credential Verification Platform</span>
        <span className={styles.footerNote}>Deterministic Evidence Engine</span>
      </div>
    </footer>
  );
}
