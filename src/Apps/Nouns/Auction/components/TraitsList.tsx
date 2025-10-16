/**
 * TraitsList Component
 * Displays Noun traits in a list
 */

'use client';

import { getTraitName } from '@/app/lib/Nouns/utils/trait-name-utils';
import type { Noun } from '@/app/lib/Nouns/Goldsky/utils/types';
import styles from './TraitsList.module.css';

interface TraitsListProps {
  noun: Noun | null;
  loading?: boolean;
}

export default function TraitsList({ noun, loading = false }: TraitsListProps) {
  if (loading) {
    return (
      <div className={styles.traitsList}>
        {['Head', 'Glasses', 'Accessory', 'Body', 'Background'].map((label) => (
          <div key={label} className={styles.traitItem}>
            <span className={styles.traitLabel}>{label}</span>
            <span className={styles.traitValue}>Loading...</span>
          </div>
        ))}
      </div>
    );
  }

  if (!noun || !noun.seed) {
    return (
      <div className={styles.traitsList}>
        <div className={styles.traitItem}>
          <span className={styles.traitLabel}>No trait data</span>
        </div>
      </div>
    );
  }

  const { seed } = noun;

  return (
    <div className={styles.traitsList}>
      <div className={styles.traitItem}>
        <span className={styles.traitLabel}>Head</span>
        <span className={styles.traitValue}>
          {getTraitName('head', Number(seed.head))}
        </span>
      </div>
      <div className={styles.traitItem}>
        <span className={styles.traitLabel}>Glasses</span>
        <span className={styles.traitValue}>
          {getTraitName('glasses', Number(seed.glasses))}
        </span>
      </div>
      <div className={styles.traitItem}>
        <span className={styles.traitLabel}>Accessory</span>
        <span className={styles.traitValue}>
          {getTraitName('accessory', Number(seed.accessory))}
        </span>
      </div>
      <div className={styles.traitItem}>
        <span className={styles.traitLabel}>Body</span>
        <span className={styles.traitValue}>
          {getTraitName('body', Number(seed.body))}
        </span>
      </div>
      <div className={styles.traitItem}>
        <span className={styles.traitLabel}>Background</span>
        <span className={styles.traitValue}>
          {getTraitName('background', Number(seed.background))}
        </span>
      </div>
    </div>
  );
}

