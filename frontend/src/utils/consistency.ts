import type { MatchedCredential } from '../types';

/** Result of comparing a single OCR field against the trusted credential. */
export type ConsistencyStatus = 'match' | 'mismatch' | 'not_found';

export interface FieldConsistencyResult {
  field: string;
  status: ConsistencyStatus;
  expected: string;
  found: string | null;
}

export interface ConsistencyReport {
  credential_id: FieldConsistencyResult;
  holder_name: FieldConsistencyResult;
  issuer_name: FieldConsistencyResult;
  /** True if every field matched. */
  allMatch: boolean;
  /** True if at least one field was a definite mismatch. */
  hasMismatch: boolean;
  /** True if at least one field was not found in the OCR text. */
  hasNotFound: boolean;
}

/**
 * Normalize a string for comparison:
 * - trim leading/trailing whitespace
 * - collapse internal runs of whitespace to a single space
 * - convert to lowercase
 */
function normalize(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Check whether `ocrText` contains the `expected` value.
 * Uses normalized, case-insensitive substring matching.
 * Also checks for alternative/mismatched patterns if labels or candidate formats exist.
 */
function checkField(
  field: string,
  expected: string,
  ocrText: string,
  mismatchRegex?: RegExp
): FieldConsistencyResult {
  const normalizedExpected = normalize(expected);
  const normalizedOcr = normalize(ocrText);

  // 1. Check for exact normalized match
  if (normalizedOcr.includes(normalizedExpected)) {
    return {
      field,
      status: 'match',
      expected,
      found: expected,
    };
  }

  // 2. If mismatch regex provided, check if a different value is present
  if (mismatchRegex) {
    const matches = ocrText.match(mismatchRegex);
    if (matches && matches.length > 0) {
      for (const match of matches) {
        if (normalize(match) !== normalizedExpected) {
          return {
            field,
            status: 'mismatch',
            expected,
            found: match.trim(),
          };
        }
      }
    }
  }

  // 3. Fallback to not_found
  return {
    field,
    status: 'not_found',
    expected,
    found: null,
  };
}

/**
 * Run deterministic OCR consistency checks by comparing each trusted
 * credential field against the OCR-extracted text.
 *
 * This does NOT decide authenticity — it produces evidence only.
 */
export function checkOcrConsistency(
  ocrText: string,
  credential: MatchedCredential,
): ConsistencyReport {
  // Pattern for credential ID format (e.g. PC-2026-000001 or labeled Credential ID)
  const credentialIdRegex = /PC-[A-Za-z0-9-]+|(?:credential\s*id|id)\s*[:|-]?\s*([A-Za-z0-9-]+)/gi;

  const credentialIdResult = checkField(
    'Credential ID',
    credential.credential_id,
    ocrText,
    credentialIdRegex
  );

  // Labeled search for Holder
  const holderRegex = /(?:holder|name|student)\s*[:|-]\s*([^\n\r,]+)/gi;
  const holderResult = checkField(
    'Holder',
    credential.holder_name,
    ocrText,
    holderRegex
  );

  // Labeled search for Issuer
  const issuerRegex = /(?:issuer|university|organization|institution)\s*[:|-]\s*([^\n\r,]+)/gi;
  const issuerResult = checkField(
    'Issuer',
    credential.issuer_name,
    ocrText,
    issuerRegex
  );

  const results = [credentialIdResult, holderResult, issuerResult];

  return {
    credential_id: credentialIdResult,
    holder_name: holderResult,
    issuer_name: issuerResult,
    allMatch: results.every((r) => r.status === 'match'),
    hasMismatch: results.some((r) => r.status === 'mismatch'),
    hasNotFound: results.some((r) => r.status === 'not_found'),
  };
}
