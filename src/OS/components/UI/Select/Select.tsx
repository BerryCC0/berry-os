/**
 * Select Component
 * System Preferences, app settings
 * Mac OS 8 Style: Popup menu with border and shadow
 */

import { useState, useRef, useEffect } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function Select({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select...',
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div
      ref={selectRef}
      className={`${styles.select} ${disabled ? styles.disabled : ''} ${className}`}
    >
      <button
        className={styles.selectButton}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
      >
        {selectedOption ? (
          <>
            {selectedOption.icon && (
              <img src={selectedOption.icon} alt="" className={styles.icon} />
            )}
            <span>{selectedOption.label}</span>
          </>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        <span className={styles.arrow}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {options.map((option) => (
            <div
              key={option.value}
              className={`${styles.option} ${option.value === value ? styles.selected : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option.icon && (
                <img src={option.icon} alt="" className={styles.icon} />
              )}
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

