/**
 * SearchField Component
 * Global search, Finder search
 * Mac OS 8 Style: Rounded rectangle with magnifying glass icon
 */

import { useState, useRef } from 'react';
import styles from './SearchField.module.css';

export interface SearchFieldProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear: () => void;
  autoFocus?: boolean;
  className?: string;
}

export default function SearchField({
  placeholder = 'Search...',
  onSearch,
  onClear,
  autoFocus = false,
  className = '',
}: SearchFieldProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onClear();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`${styles.searchField} ${className}`}>
      <span className={styles.icon}>🔍</span>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={styles.input}
      />
      {query && (
        <button
          className={styles.clearButton}
          onClick={handleClear}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}

