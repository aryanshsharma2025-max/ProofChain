import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header} id="app-header">
      <div className={styles.logo}>
        <div className={styles.logoIcon}>P</div>
        <span className={styles.logoText}>ProofChain</span>
      </div>
      <span className={styles.badge}>Credential Verifier</span>
    </header>
  );
}
