import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} id="app-footer">
      ProofChain &copy; {new Date().getFullYear()} &mdash; Credential Verification Platform
    </footer>
  );
}
