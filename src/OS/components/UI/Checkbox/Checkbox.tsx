/**
 * Checkbox Component
 * Mac OS 8 styled checkbox with label and description
 */

'use client';

import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
}: CheckboxProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className={`${styles.checkboxContainer} ${disabled ? styles.disabled : ''}`}>
      <div
        className={styles.checkboxWrapper}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        aria-labelledby={id}
        tabIndex={disabled ? -1 : 0}
      >
        <div className={`${styles.checkbox} ${checked ? styles.checked : ''}`}>
          {checked && (
            <svg
              className={styles.checkmark}
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 6L5 9L10 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <div className={styles.labelWrapper}>
          <label
            className={styles.label}
            id={id}
            onClick={(e) => e.stopPropagation()}
          >
            {label}
          </label>
          {description && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
