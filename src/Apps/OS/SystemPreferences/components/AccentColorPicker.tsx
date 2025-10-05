/**
 * Accent Color Picker Component
 * Phase 7.1: Nouns-themed accent color customization
 */

'use client';

import { useState } from 'react';
import { NOUNS_ACCENT_COLORS, getAccentColorOptions } from '../../../../OS/lib/nounsThemes';
import styles from './AccentColorPicker.module.css';

interface AccentColorPickerProps {
  currentAccent: string | null;
  onAccentChange: (color: string | null) => void;
}

export default function AccentColorPicker({ currentAccent, onAccentChange }: AccentColorPickerProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customColor, setCustomColor] = useState(currentAccent || '#ff0000');
  
  const accentOptions = getAccentColorOptions();
  
  const handlePresetClick = (hex: string) => {
    onAccentChange(hex);
    setShowCustomPicker(false);
  };
  
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onAccentChange(color);
  };
  
  const handleReset = () => {
    onAccentChange(null);
    setShowCustomPicker(false);
  };
  
  return (
    <div className={styles.accentColorPicker}>
      <div className={styles.presetColors}>
        {accentOptions.map((option) => (
          <button
            key={option.id}
            className={`${styles.colorSwatch} ${currentAccent === option.hex ? styles.selected : ''}`}
            style={{ backgroundColor: option.hex }}
            onClick={() => handlePresetClick(option.hex)}
            title={option.name}
            aria-label={`${option.name} accent color`}
          >
            {currentAccent === option.hex && (
              <span className={styles.checkmark}>✓</span>
            )}
          </button>
        ))}
        
        {/* Custom Color Button */}
        <button
          className={`${styles.colorSwatch} ${styles.customButton} ${showCustomPicker ? styles.selected : ''}`}
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          title="Custom color"
          aria-label="Custom color picker"
        >
          <span className={styles.customIcon}>🎨</span>
        </button>
        
        {/* Reset Button */}
        {currentAccent && (
          <button
            className={`${styles.colorSwatch} ${styles.resetButton}`}
            onClick={handleReset}
            title="Reset to theme default"
            aria-label="Reset accent color"
          >
            <span className={styles.resetIcon}>↺</span>
          </button>
        )}
      </div>
      
      {/* Custom Color Picker */}
      {showCustomPicker && (
        <div className={styles.customPickerPanel}>
          <label htmlFor="custom-color-input" className={styles.customLabel}>
            Custom Accent Color
          </label>
          <div className={styles.customInputGroup}>
            <input
              id="custom-color-input"
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className={styles.colorInput}
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                  onAccentChange(e.target.value);
                }
              }}
              className={styles.hexInput}
              placeholder="#FF0000"
              maxLength={7}
            />
          </div>
          <p className={styles.hint}>
            Choose any color or enter a hex code
          </p>
        </div>
      )}
      
      {/* Current Accent Info */}
      {currentAccent && (
        <div className={styles.currentAccent}>
          <span className={styles.currentLabel}>Current accent:</span>
          <span className={styles.currentValue}>{currentAccent}</span>
        </div>
      )}
    </div>
  );
}

