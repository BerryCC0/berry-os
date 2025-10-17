/**
 * NounSelector Component
 * Visual grid selector for Nouns with SVG previews
 */

'use client';

import React from 'react';
import type { NounWithSVG } from '@/src/Apps/Nouns/Camp/utils/hooks/useNounSelector';
import { Spinner } from '@/src/OS/components/UI';
import styles from './NounSelector.module.css';

interface NounSelectorProps {
  nouns: NounWithSVG[];
  selectedId: string | null;
  onSelect: (nounId: string) => void;
  label: string;
  loading: boolean;
  disabled?: boolean;
}

export function NounSelector({
  nouns,
  selectedId,
  onSelect,
  label,
  loading,
  disabled = false,
}: NounSelectorProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.label}>{label}</div>
        <div className={styles.loadingContainer}>
          <Spinner size="small" />
          <span className={styles.loadingText}>Loading Nouns...</span>
        </div>
      </div>
    );
  }

  if (nouns.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.label}>{label}</div>
        <div className={styles.emptyState}>
          No Nouns found
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.label}>{label}</div>
      <div className={styles.grid}>
        {nouns.map((noun) => (
          <button
            key={noun.id}
            type="button"
            className={`${styles.nounCard} ${selectedId === noun.id ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
            onClick={() => !disabled && onSelect(noun.id)}
            disabled={disabled}
          >
            {noun.svgData ? (
              <div 
                className={styles.nounImage}
                dangerouslySetInnerHTML={{ __html: noun.svgData }}
              />
            ) : (
              <div className={styles.nounPlaceholder}>
                <span className={styles.nounId}>#{noun.id}</span>
              </div>
            )}
            <div className={styles.nounLabel}>
              Noun {noun.id}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

