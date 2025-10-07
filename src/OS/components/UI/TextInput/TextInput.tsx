/**
 * TextInput Component
 * Search fields, rename dialogs, text editing
 * Mac OS 8 Style: Inset border, white background
 */

import { forwardRef } from 'react';
import styles from './TextInput.module.css';

export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'search';
  disabled?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  className?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      value,
      onChange,
      onKeyDown,
      onFocus,
      onBlur,
      placeholder,
      type = 'text',
      disabled = false,
      maxLength,
      autoFocus = false,
      className = '',
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className={`${styles.textInput} ${disabled ? styles.disabled : ''} ${className}`}
      />
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;

