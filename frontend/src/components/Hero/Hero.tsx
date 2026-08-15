import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero} id="hero-section">
      <h1 className={styles.title}>
        Verify Credentials with{' '}
        <span className={styles.titleAccent}>ProofChain</span>
      </h1>
      <p className={styles.subtitle}>
        Upload a digital credential and verify its integrity using cryptographic
        hashing, document analysis, and trusted records.
      </p>
    </section>
  );
}
