/**
 * TextArea Component
 * Multi-line text editing
 * Mac OS 8 Style: Inset border, white background
 */

import { forwardRef } from 'react';
import styles from './TextArea.module.css';

export interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
  autoFocus?: boolean;
  resize?: boolean;
  className?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      value,
      onChange,
      onKeyDown,
      onFocus,
      onBlur,
      placeholder,
      disabled = false,
      maxLength,
      rows = 4,
      autoFocus = false,
      resize = true,
      className = '',
    },
    ref
  ) => {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        autoFocus={autoFocus}
        className={`${styles.textArea} ${disabled ? styles.disabled : ''} ${!resize ? styles.noResize : ''} ${className}`}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;

