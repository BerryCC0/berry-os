/**
 * RadioGroup Component
 * Mac OS 8 styled radio button group
 */

'use client';

import styles from './RadioGroup.module.css';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  name?: string;
}

export default function RadioGroup({
  options,
  value,
  onChange,
  direction = 'vertical',
  disabled = false,
  name = 'radio-group',
}: RadioGroupProps) {
  const handleClick = (optionValue: string, optionDisabled?: boolean) => {
    if (!disabled && !optionDisabled && optionValue !== value) {
      onChange(optionValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, optionValue: string, optionDisabled?: boolean) => {
    if (disabled || optionDisabled) return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(optionValue);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const currentIndex = options.findIndex(opt => opt.value === value);
      const nextIndex = (currentIndex + 1) % options.length;
      const nextOption = options[nextIndex];
      if (!nextOption.disabled) {
        onChange(nextOption.value);
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentIndex = options.findIndex(opt => opt.value === value);
      const prevIndex = (currentIndex - 1 + options.length) % options.length;
      const prevOption = options[prevIndex];
      if (!prevOption.disabled) {
        onChange(prevOption.value);
      }
    }
  };

  return (
    <div
      className={`${styles.radioGroup} ${styles[direction]} ${disabled ? styles.disabled : ''}`}
      role="radiogroup"
    >
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const isDisabled = disabled || option.disabled;

        return (
          <div
            key={option.value}
            className={`${styles.radioOption} ${isDisabled ? styles.optionDisabled : ''}`}
            onClick={() => handleClick(option.value, option.disabled)}
            onKeyDown={(e) => handleKeyDown(e, option.value, option.disabled)}
            role="radio"
            aria-checked={isSelected}
            aria-disabled={isDisabled}
            tabIndex={isDisabled ? -1 : isSelected ? 0 : -1}
          >
            <div className={`${styles.radio} ${isSelected ? styles.selected : ''}`}>
              {isSelected && <div className={styles.radioDot} />}
            </div>
            <label
              className={styles.label}
              htmlFor={`${name}-${option.value}`}
              onClick={(e) => e.stopPropagation()}
            >
              {option.label}
            </label>
          </div>
        );
      })}
    </div>
  );
}

