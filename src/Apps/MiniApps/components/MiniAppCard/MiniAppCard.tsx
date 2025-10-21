/**
 * MiniAppCard Component
 * Individual Mini App display card
 */

'use client';

import type { MiniAppCatalogItem } from '../../utils/types/miniAppTypes';
import {
  getMiniAppName,
  getMiniAppDescription,
  getMiniAppIcon,
  getMiniAppCategory,
  formatMiniAppAuthor,
  hasVerificationBadge,
  getMiniAppNetworks,
} from '../../utils/helpers/catalogHelpers';
import styles from './MiniAppCard.module.css';

interface MiniAppCardProps {
  miniApp: MiniAppCatalogItem;
  onLaunch: (miniApp: MiniAppCatalogItem) => void;
}

export default function MiniAppCard({ miniApp, onLaunch }: MiniAppCardProps) {
  const name = getMiniAppName(miniApp);
  const description = getMiniAppDescription(miniApp);
  const icon = getMiniAppIcon(miniApp);
  const category = getMiniAppCategory(miniApp);
  const authorName = formatMiniAppAuthor(miniApp.author);
  const hasVerified = hasVerificationBadge(miniApp.author);
  const networks = getMiniAppNetworks(miniApp);

  return (
    <div className={styles.card}>
      {/* Mini App Icon */}
      <div className={styles.iconWrapper}>
        <img
          src={icon}
          alt={name}
          className={styles.icon}
          onError={(e) => {
            // Fallback to placeholder on error
            e.currentTarget.src = '/icons/system/placeholder.svg';
          }}
        />
      </div>

      {/* Mini App Info */}
      <div className={styles.info}>
        <h3 className={styles.name} title={name}>
          {name}
        </h3>

        {description && (
          <p className={styles.description} title={description}>
            {description}
          </p>
        )}

        {/* Author */}
        <div className={styles.author}>
          {miniApp.author.pfp_url && (
            <img
              src={miniApp.author.pfp_url}
              alt={authorName}
              className={styles.authorPfp}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <span className={styles.authorName}>
            {authorName}
            {hasVerified && <span className={styles.badge}>✓</span>}
          </span>
        </div>

        {/* Metadata */}
        <div className={styles.metadata}>
          {category && (
            <span className={styles.category} title={`Category: ${category}`}>
              {category}
            </span>
          )}

          {networks.length > 0 && (
            <div className={styles.networks} title={`Networks: ${networks.join(', ')}`}>
              {networks.slice(0, 3).map((network) => (
                <span key={network} className={styles.network}>
                  {network}
                </span>
              ))}
              {networks.length > 3 && (
                <span className={styles.networkMore}>+{networks.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Launch Button */}
      <button
        className={styles.launchButton}
        onClick={() => onLaunch(miniApp)}
        title={`Launch ${name}`}
      >
        Launch
      </button>
    </div>
  );
}

