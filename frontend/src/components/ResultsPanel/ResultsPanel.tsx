import { useState, useRef, useCallback } from 'react';
import type { VerificationResult } from '../../types';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './ResultsPanel.module.css';

interface ResultsPanelProps {
  results: VerificationResult;
}

/** Lightweight per-card tilt (max ~2deg). Disabled on touch / reduced motion. */
function useCardTilt(maxDeg = 2) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(800px) rotateX(${-y * maxDeg}deg) rotateY(${x * maxDeg}deg) translateY(-2px)`;
    });
  }, [maxDeg]);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.transform = '';
  }, []);

  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

function TiltCard({ children, className, id }: { children: React.ReactNode; className: string; id?: string }) {
  const tilt = useCardTilt(2);
  return (
    <div
      ref={tilt.ref}
      className={className}
      id={id}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
    >
      {children}
    </div>
  );
}

export default function ResultsPanel({ results }: ResultsPanelProps) {
  const { matchedCredential, ocrText, consistency, gemini, sha256, ocr, metadata, digitalSignature, blockchain } = results;
  const sectionRef = useScrollReveal<HTMLElement>();
  const [ocrOpen, setOcrOpen] = useState(false);

  const analysisItems = [sha256, ocr, metadata, digitalSignature, blockchain];

  return (
    <section className={`${styles.section} reveal`} id="results-panel" ref={sectionRef}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Evidence &amp; Analysis Dashboard</h2>
        <span className={styles.sectionSubtitle}>Cryptographic Proofs &amp; Extracted Artifacts</span>
      </div>

      {/* Trusted Credential Card */}
      {matchedCredential && (
        <TiltCard className={styles.credentialCard} id="matched-credential">
          <div className={styles.credentialHeader}>
            <div className={styles.credentialIconWrap}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <span className={styles.credentialTitle}>Trusted Credential Registry Match</span>
          </div>
          <div className={styles.credentialGrid}>
            <div className={styles.credentialItem}>
              <span className={styles.credentialLabel}>Credential ID</span>
              <code className={styles.credentialValue}>{matchedCredential.credential_id}</code>
            </div>
            <div className={styles.credentialItem}>
              <span className={styles.credentialLabel}>Holder Name</span>
              <span className={styles.credentialValueText}>{matchedCredential.holder_name}</span>
            </div>
            <div className={styles.credentialItem}>
              <span className={styles.credentialLabel}>Issuer Institution</span>
              <span className={styles.credentialValueText}>{matchedCredential.issuer_name}</span>
            </div>
          </div>
        </TiltCard>
      )}

      {/* Document Field Consistency Card */}
      {consistency && (
        <TiltCard className={styles.consistencyCard} id="document-consistency">
          <div className={styles.consistencyHeader}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className={styles.consistencyTitle}>Document Field Consistency</span>
          </div>
          <div className={styles.consistencyRows}>
            {[
              { label: 'Credential ID', result: consistency.credential_id },
              { label: 'Holder Name', result: consistency.holder_name },
              { label: 'Issuer Name', result: consistency.issuer_name },
            ].map((row) => (
              <div className={styles.consistencyRow} key={row.label}>
                <span className={styles.consistencyLabel}>{row.label}</span>
                <span className={`${styles.statusChip} ${styles[row.result.status]}`}>
                  {row.result.status.toUpperCase().replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </TiltCard>
      )}

      {/* Analysis Cards Grid */}
      <div className={styles.grid}>
        {analysisItems.map((item, idx) => {
          const isTamperedHash = item.label === 'SHA-256 Hash' && item.status === 'error';
          return (
            <TiltCard
              className={`${styles.card} ${isTamperedHash ? styles.cardTampered : ''}`}
              key={item.label}
            >
              <div className={styles.cardInner} style={{ animationDelay: `${idx * 60}ms` }}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardLabel}>{item.label}</span>
                  <span className={`${styles.cardStatus} ${styles[item.status]}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {item.value && (
                  <div className={styles.cardValue}>
                    {item.label.includes('Hash') ? (
                      <code className={styles.monoValue}>{item.value}</code>
                    ) : (
                      item.value
                    )}
                  </div>
                )}

                {item.detail && (
                  <div className={`${styles.cardDetail} ${isTamperedHash ? styles.detailTampered : ''}`}>
                    {item.detail}
                  </div>
                )}

                {isTamperedHash && (
                  <div className={styles.tamperAlert}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span>HASH MISMATCH — DOCUMENT UNTRUSTED OR ALTERED</span>
                  </div>
                )}
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* Unified AI Evidence Analysis */}
      <TiltCard className={styles.geminiCard} id="gemini-explanation">
        <div className={styles.geminiHeader}>
          <div className={styles.geminiHeaderTitle}>
            <div className={styles.geminiIconWrap}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
              </svg>
            </div>
            <span className={styles.geminiTitle}>AI Evidence Analysis</span>
          </div>
          <span className={`${styles.cardStatus} ${styles[gemini.status]}`}>
            {gemini.status}
          </span>
        </div>

        <div className={styles.geminiBody}>
          {gemini.status === 'complete' && gemini.detail ? (
            <p className={styles.geminiExplanationText}>{gemini.detail}</p>
          ) : gemini.status === 'running' ? (
            <div className={styles.geminiLoadingRow}>
              <span className={styles.geminiSpinner} />
              <p className={styles.geminiPendingText}>Synthesizing computed evidence with Gemini AI...</p>
            </div>
          ) : gemini.status === 'error' ? (
            <p className={styles.geminiErrorText}>{gemini.detail || 'Failed to generate AI evidence analysis.'}</p>
          ) : (
            <p className={styles.geminiPendingText}>Awaiting verification pipeline completion...</p>
          )}
        </div>

        <div className={styles.geminiFooterLabel}>
          AI explains computed evidence; it does not determine authenticity.
        </div>
      </TiltCard>

      {/* Collapsible OCR Text */}
      {ocrText && (
        <div className={styles.ocrPreviewSection} id="ocr-preview">
          <button
            className={styles.ocrToggleBtn}
            onClick={() => setOcrOpen(!ocrOpen)}
            type="button"
            aria-expanded={ocrOpen}
          >
            <div className={styles.ocrToggleTitle}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <span>Extracted OCR Text</span>
              <span className={styles.ocrCharCount}>{ocrText.length.toLocaleString()} chars</span>
            </div>
            <span className={`${styles.ocrChevron} ${ocrOpen ? styles.ocrChevronOpen : ''}`}>
              ▼
            </span>
          </button>

          <div className={`${styles.ocrContentWrapper} ${ocrOpen ? styles.ocrContentOpen : ''}`}>
            <pre className={styles.ocrPreviewText}>{ocrText}</pre>
          </div>
        </div>
      )}
    </section>
  );
}
