/**
 * Checkbox Component
 * System Preferences, dialogs
 */

import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: CheckboxProps) {
  return (
    <label className={`${styles.checkboxLabel} ${disabled ? styles.disabled : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={styles.checkboxInput}
      />
      <span className={styles.checkbox}>
        {checked && <span className={styles.check}>✓</span>}
      </span>
      {label && <span className={styles.labelText}>{label}</span>}
    </label>
  );
}

