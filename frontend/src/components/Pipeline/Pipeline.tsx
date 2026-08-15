import type { VerificationResult } from '../../types';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './Pipeline.module.css';

interface PipelineProps {
  results: VerificationResult;
}

type PipelineStepState = 'pending' | 'processing' | 'complete' | 'error';

interface StepItem {
  id: string;
  label: string;
  icon: string;
  state: PipelineStepState;
}

export default function Pipeline({ results }: PipelineProps) {
  const { sha256, ocr, metadata, gemini, matchedCredential, consistency } = results;
  const sectionRef = useScrollReveal<HTMLDivElement>();

  const fileIntegrityState: PipelineStepState =
    sha256.status === 'complete' ? 'complete' : (sha256.status === 'error' ? 'error' : (sha256.status === 'running' ? 'processing' : 'pending'));

  const trustedRecordState: PipelineStepState =
    matchedCredential
      ? 'complete'
      : (sha256.status === 'error'
          ? 'error'
          : (sha256.status === 'running' ? 'processing' : 'pending'));

  const ocrState: PipelineStepState =
    ocr.status === 'complete' ? 'complete' : (ocr.status === 'error' ? 'error' : (ocr.status === 'running' ? 'processing' : 'pending'));

  const consistencyState: PipelineStepState =
    consistency
      ? (consistency.hasMismatch ? 'error' : 'complete')
      : (ocr.status === 'running' || sha256.status === 'running' ? 'processing' : 'pending');

  const metadataState: PipelineStepState =
    metadata.status === 'complete' ? 'complete' : (metadata.status === 'error' ? 'error' : (metadata.status === 'running' ? 'processing' : 'pending'));

  const aiState: PipelineStepState =
    gemini.status === 'complete' ? 'complete' : (gemini.status === 'error' ? 'error' : (gemini.status === 'running' ? 'processing' : 'pending'));

  const steps: StepItem[] = [
    { id: 'file-integrity', label: 'Hash', icon: '#', state: fileIntegrityState },
    { id: 'trusted-record', label: 'Trusted Record', icon: '⛁', state: trustedRecordState },
    { id: 'ocr-analysis', label: 'OCR', icon: 'T', state: ocrState },
    { id: 'doc-consistency', label: 'Consistency', icon: '≡', state: consistencyState },
    { id: 'metadata', label: 'Metadata', icon: 'i', state: metadataState },
    { id: 'ai-analysis', label: 'Gemini', icon: '✦', state: aiState },
  ];

  return (
    <div
      className={`${styles.container} reveal`}
      id="verification-pipeline"
      ref={sectionRef}
    >
      <div className={styles.header}>
        <span className={styles.title}>Verification Pipeline</span>
        <span className={styles.subtitle}>Sequential Evidence Verification</span>
      </div>

      <div className={styles.track}>
        {steps.map((step, idx) => (
          <div key={step.id} className={styles.stepWrapper}>
            {/* Connector line */}
            {idx > 0 && (
              <div className={`${styles.connector} ${styles[`conn_${step.state}`]}`} />
            )}

            <div className={`${styles.stepCard} ${styles[step.state]}`}>
              <div className={`${styles.stepIcon} ${styles[`icon_${step.state}`]}`}>
                <span>{step.icon}</span>
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
              <span className={`${styles.stepStateText} ${styles[`state_${step.state}`]}`}>
                {step.state.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
