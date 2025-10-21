/**
 * MiniAppFilters Component
 * Filter controls for browsing Mini Apps
 */

'use client';

import { useState } from 'react';
import type { MiniAppFilters } from '../../utils/types/miniAppTypes';
import { MINI_APP_CATEGORIES, MINI_APP_NETWORKS, TIME_WINDOWS } from '../../utils/types/miniAppTypes';
import styles from './MiniAppFilters.module.css';

interface MiniAppFiltersProps {
  filters: MiniAppFilters;
  onChange: (filters: MiniAppFilters) => void;
  availableCategories?: string[];
  availableNetworks?: string[];
}

export default function MiniAppFilters({
  filters,
  onChange,
  availableCategories = [],
  availableNetworks = [],
}: MiniAppFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    onChange({ ...filters, searchQuery: value });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories: newCategories });
  };

  const handleNetworkToggle = (network: string) => {
    const newNetworks = filters.networks.includes(network)
      ? filters.networks.filter((n) => n !== network)
      : [...filters.networks, network];
    onChange({ ...filters, networks: newNetworks });
  };

  const handleTimeWindowChange = (timeWindow: MiniAppFilters['timeWindow']) => {
    onChange({ ...filters, timeWindow });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onChange({
      categories: [],
      networks: [],
      searchQuery: '',
      timeWindow: '7d',
    });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.networks.length > 0 ||
    filters.searchQuery.trim() !== '';

  return (
    <div className={styles.filters}>
      {/* Search Input */}
      <div className={styles.section}>
        <label className={styles.label}>Search</label>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search Mini Apps..."
          value={searchInput}
          onChange={handleSearchChange}
        />
      </div>

      {/* Time Window */}
      <div className={styles.section}>
        <label className={styles.label}>Trending</label>
        <div className={styles.buttonGroup}>
          {TIME_WINDOWS.map(({ value, label }) => (
            <button
              key={value}
              className={`${styles.filterButton} ${
                filters.timeWindow === value ? styles.active : ''
              }`}
              onClick={() => handleTimeWindowChange(value as MiniAppFilters['timeWindow'])}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className={styles.section}>
        <label className={styles.label}>Categories</label>
        <div className={styles.chipGroup}>
          {MINI_APP_CATEGORIES.map((category) => (
            <button
              key={category}
              className={`${styles.chip} ${
                filters.categories.includes(category) ? styles.chipActive : ''
              }`}
              onClick={() => handleCategoryToggle(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Networks */}
      <div className={styles.section}>
        <label className={styles.label}>Networks</label>
        <div className={styles.chipGroup}>
          {MINI_APP_NETWORKS.map((network) => (
            <button
              key={network}
              className={`${styles.chip} ${
                filters.networks.includes(network) ? styles.chipActive : ''
              }`}
              onClick={() => handleNetworkToggle(network)}
            >
              {network}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className={styles.section}>
          <button className={styles.clearButton} onClick={handleClearFilters}>
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

