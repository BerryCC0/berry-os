/**
 * NounImage Component
 * Displays a Noun with SVG generation from traits
 */

'use client';

import { useMemo } from 'react';
import { generateNounSVG, generatePlaceholderSVG, getNounTraits } from '../utils/helpers/nounImageHelper';
import type { Noun } from '@/app/lib/Nouns/Goldsky/utils/types';
import styles from './NounImage.module.css';

interface NounImageProps {
  noun: Noun | null;
  svgData?: string | null; // NEW: SVG data from database
  width?: number;
  height?: number;
  className?: string;
}

export default function NounImage({ 
  noun,
  svgData,
  width = 320, 
  height = 320, 
  className = '' 
}: NounImageProps) {
  const svgDataURL = useMemo(() => {
    // Priority 1: Use database SVG if available
    if (svgData) {
      return `data:image/svg+xml,${encodeURIComponent(svgData)}`;
    }

    // Priority 2: Generate from Noun traits (fallback)
    if (!noun) {
      const placeholder = generatePlaceholderSVG();
      return `data:image/svg+xml,${encodeURIComponent(placeholder)}`;
    }

    const traits = getNounTraits(noun);
    if (!traits) {
      const placeholder = generatePlaceholderSVG();
      return `data:image/svg+xml,${encodeURIComponent(placeholder)}`;
    }

    const svg = generateNounSVG(traits);
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }, [noun, svgData]);

  return (
    <img
      src={svgDataURL}
      alt={noun ? `Noun ${noun.id}` : 'Loading Noun'}
      width={width}
      height={height}
      className={`${styles.nounImage} ${className}`}
    />
  );
}

