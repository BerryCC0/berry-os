/**
 * GroupedSelect Component
 * Extends Select with optgroup support for categorized options
 * Mac OS 8 Style: Popup menu with grouped sections
 */

import { useState, useRef, useEffect } from 'react';
import styles from './GroupedSelect.module.css';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface GroupedSelectProps {
  groups: SelectOptionGroup[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function GroupedSelect({
  groups,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select...',
  className = '',
}: GroupedSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Find selected option across all groups
  const selectedOption = groups
    .flatMap(group => group.options)
    .find(opt => opt.value === value);

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
          {groups.map((group, groupIndex) => (
            <div key={group.label} className={styles.group}>
              <div className={styles.groupLabel}>{group.label}</div>
              {group.options.map((option) => (
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
              {groupIndex < groups.length - 1 && <div className={styles.divider} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

