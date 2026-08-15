import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero} id="hero-section">
      {/* Animated ambient orb */}
      <div className={styles.orbContainer} aria-hidden="true">
        <div className={styles.orb} />
        <div className={styles.orbSecondary} />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>
          Verify credentials with{' '}
          <span className={styles.titleAccent}>ProofChain</span>
        </h1>
        <p className={styles.subtitle}>
          Verify document integrity, extracted identity data, and trusted registry evidence.
        </p>
      </div>
    </section>
  );
}
