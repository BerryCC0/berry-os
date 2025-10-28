/**
 * RichTextContent Component
 * Renders text content with embedded GIFs and media
 */

'use client';

import { useState } from 'react';
import { parseTextForGifs } from '../../../utils/helpers/gifHelper';
import styles from './RichTextContent.module.css';

interface RichTextContentProps {
  content: string;
  className?: string;
}

export default function RichTextContent({ content, className = '' }: RichTextContentProps) {
  const parsedContent = parseTextForGifs(content);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (url: string) => {
    setLoadingImages(prev => {
      const next = new Set(prev);
      next.delete(url);
      return next;
    });
  };

  const handleImageError = (url: string) => {
    setFailedImages(prev => new Set(prev).add(url));
    setLoadingImages(prev => {
      const next = new Set(prev);
      next.delete(url);
      return next;
    });
  };

  const handleImageLoadStart = (url: string) => {
    setLoadingImages(prev => new Set(prev).add(url));
  };

  return (
    <div className={`${styles.richTextContent} ${className}`}>
      {parsedContent.map((block, index) => {
        if (block.type === 'text') {
          return (
            <p key={index} className={styles.textBlock}>
              {block.content}
            </p>
          );
        }

        if (block.type === 'gif' && block.gifUrl) {
          const hasFailed = failedImages.has(block.gifUrl);
          const isLoading = loadingImages.has(block.gifUrl);

          if (hasFailed) {
            // Show as link if image failed to load
            return (
              <div key={index} className={styles.gifBlock}>
                <a
                  href={block.gifUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.gifLink}
                >
                  🖼️ {block.gifUrl}
                </a>
              </div>
            );
          }

          return (
            <div key={index} className={styles.gifBlock}>
              {isLoading && (
                <div className={styles.gifLoading}>Loading GIF...</div>
              )}
              <img
                src={block.gifUrl}
                alt="GIF"
                className={`${styles.gifImage} ${isLoading ? styles.loading : ''}`}
                onLoad={() => handleImageLoad(block.gifUrl!)}
                onError={() => handleImageError(block.gifUrl!)}
                onLoadStart={() => handleImageLoadStart(block.gifUrl!)}
                loading="lazy"
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

