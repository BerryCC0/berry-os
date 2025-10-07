/**
 * ColorPicker Component
 * Theme customization (Phase 7)
 * Mac OS 8 Style: Grid of color swatches + custom picker
 */

import { useState } from 'react';
import styles from './ColorPicker.module.css';

export interface ColorPickerProps {
  value: string; // Hex color
  onChange: (color: string) => void;
  presets?: string[]; // Nouns palette or other presets
  showCustom?: boolean; // Show custom color input
  className?: string;
}

// Default Nouns palette
const DEFAULT_PRESETS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#D53E4F', // Red
  '#FC8D62', // Orange
  '#FEE08B', // Yellow
  '#E6F598', // Light Green
  '#99D594', // Green
  '#3288BD', // Blue
  '#5E4FA2', // Purple
  '#DDDDDD', // Gray 1
  '#888888', // Gray 2
  '#555555', // Gray 3
];

export default function ColorPicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  showCustom = true,
  className = '',
}: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value);

  const handlePresetClick = (color: string) => {
    onChange(color);
    setCustomColor(color);
  };

  const handleCustomChange = (color: string) => {
    setCustomColor(color);
    onChange(color);
  };

  return (
    <div className={`${styles.colorPicker} ${className}`}>
      {/* Preset Colors */}
      <div className={styles.presets}>
        {presets.map((preset) => (
          <button
            key={preset}
            className={`${styles.swatch} ${preset === value ? styles.selected : ''}`}
            style={{ backgroundColor: preset }}
            onClick={() => handlePresetClick(preset)}
            aria-label={`Color ${preset}`}
            title={preset}
          >
            {preset === value && <span className={styles.checkmark}>✓</span>}
          </button>
        ))}
      </div>

      {/* Custom Color Input */}
      {showCustom && (
        <div className={styles.custom}>
          <label className={styles.customLabel}>
            Custom Color:
            <input
              type="color"
              value={customColor}
              onChange={(e) => handleCustomChange(e.target.value)}
              className={styles.customInput}
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="#000000"
              maxLength={7}
              className={styles.hexInput}
            />
          </label>
        </div>
      )}
    </div>
  );
}

