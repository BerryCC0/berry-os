/**
 * CandidateSignaturesList Component
 * Display list of signatures supporting a candidate
 */

'use client';

import type { CandidateSignature } from '../../../utils/types/camp';
import { useENS, formatAddressWithENS } from '../../../utils/hooks/useENS';
import { formatAbsoluteTime } from '../../../utils/helpers/candidateHelpers';
import styles from './CandidateSignaturesList.module.css';

interface SignatureItemProps {
  signature: CandidateSignature;
}

function SignatureItem({ signature }: SignatureItemProps) {
  const { ensName } = useENS(signature.signer);
  const signerDisplay = formatAddressWithENS(signature.signer, ensName);
  const timestamp = formatAbsoluteTime(signature.createdTimestamp);
  const expirationTime = formatAbsoluteTime(signature.expirationTimestamp);
  const isExpired = signature.expirationTimestamp < Date.now() / 1000;

  return (
    <div className={`${styles.signatureItem} ${isExpired ? styles.expired : ''}`}>
      <div className={styles.signatureHeader}>
        <span className={styles.signer} title={signature.signer}>
          {signerDisplay}
        </span>
        {isExpired && (
          <span className={styles.expiredBadge}>Expired</span>
        )}
      </div>
      
      {signature.reason && (
        <div className={styles.reason}>
          {signature.reason}
        </div>
      )}
      
      <div className={styles.metadata}>
        <span className={styles.timestamp}>Signed {timestamp}</span>
        {!isExpired && (
          <span className={styles.expiration}>Expires {expirationTime}</span>
        )}
      </div>
    </div>
  );
}

interface CandidateSignaturesListProps {
  signatures: CandidateSignature[];
  loading?: boolean;
  requiredSignatures?: number;
}

export default function CandidateSignaturesList({ 
  signatures, 
  loading = false,
  requiredSignatures = 0,
}: CandidateSignaturesListProps) {
  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading signatures...</p>
      </div>
    );
  }

  const validSignatures = signatures.filter(
    sig => sig.expirationTimestamp >= Date.now() / 1000
  );

  return (
    <div className={styles.container}>
      {requiredSignatures > 0 && (
        <div className={styles.progress}>
          <div className={styles.progressText}>
            {validSignatures.length} / {requiredSignatures} signatures
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{
                width: `${Math.min((validSignatures.length / requiredSignatures) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {signatures.length === 0 ? (
        <div className={styles.empty}>
          <p>No signatures yet</p>
          <p className={styles.emptyHint}>
            Signatures are required to promote this candidate to a full proposal
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {signatures.map((signature) => (
            <SignatureItem key={signature.id} signature={signature} />
          ))}
        </div>
      )}
    </div>
  );
}

