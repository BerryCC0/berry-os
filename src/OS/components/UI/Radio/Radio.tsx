/**
 * Radio Component
 * System Preferences, dialogs
 */

import styles from './Radio.module.css';

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  disabled?: boolean;
  className?: string;
}

export default function Radio({
  options,
  value,
  onChange,
  name,
  disabled = false,
  className = '',
}: RadioProps) {
  return (
    <div className={`${styles.radioGroup} ${className}`}>
      {options.map((option) => (
        <label
          key={option.value}
          className={`${styles.radioLabel} ${disabled ? styles.disabled : ''}`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={styles.radioInput}
          />
          <span className={styles.radio}>
            {value === option.value && <span className={styles.dot} />}
          </span>
          <span className={styles.labelText}>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

