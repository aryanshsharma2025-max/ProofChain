import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero} id="hero-section">
      <h1 className={styles.title}>
        Verify Credentials with{' '}
        <span className={styles.titleAccent}>ProofChain</span>
      </h1>
      <p className={styles.subtitle}>
        Upload any credential document and verify its authenticity using
        cryptographic hashing, metadata analysis, and digital signature checks.
      </p>
    </section>
  );
}
