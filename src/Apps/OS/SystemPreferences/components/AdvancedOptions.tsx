/**
 * Advanced Theme Options Component
 * Phase 7.2: Fine-grained theme customization
 */

'use client';

import styles from './AdvancedOptions.module.css';

interface AdvancedOptionsProps {
  customization: {
    titleBarStyle?: 'pinstripe' | 'gradient' | 'solid';
    windowOpacity?: number;
    cornerStyle?: 'sharp' | 'rounded';
    menuBarStyle?: 'opaque' | 'translucent';
    fontSize?: 'small' | 'medium' | 'large';
  };
  onCustomizationChange: (customization: any) => void;
}

export default function AdvancedOptions({ customization, onCustomizationChange }: AdvancedOptionsProps) {
  const updateOption = (key: string, value: any) => {
    onCustomizationChange({
      ...customization,
      [key]: value,
    });
  };

  return (
    <div className={styles.advancedOptions}>
      {/* Title Bar Style */}
      <div className={styles.optionGroup}>
        <label className={styles.optionLabel}>
          Title Bar Style
          <span className={styles.optionHint}>Choose window title bar appearance</span>
        </label>
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.optionButton} ${(!customization.titleBarStyle || customization.titleBarStyle === 'pinstripe') ? styles.active : ''}`}
            onClick={() => updateOption('titleBarStyle', 'pinstripe')}
          >
            <div className={styles.titleBarPreview} data-style="pinstripe" />
            <span>Pinstripe</span>
            <span className={styles.buttonHint}>Classic Mac OS 8</span>
          </button>
          <button
            className={`${styles.optionButton} ${customization.titleBarStyle === 'gradient' ? styles.active : ''}`}
            onClick={() => updateOption('titleBarStyle', 'gradient')}
          >
            <div className={styles.titleBarPreview} data-style="gradient" />
            <span>Gradient</span>
            <span className={styles.buttonHint}>Smooth & modern</span>
          </button>
          <button
            className={`${styles.optionButton} ${customization.titleBarStyle === 'solid' ? styles.active : ''}`}
            onClick={() => updateOption('titleBarStyle', 'solid')}
          >
            <div className={styles.titleBarPreview} data-style="solid" />
            <span>Solid</span>
            <span className={styles.buttonHint}>Minimal & clean</span>
          </button>
        </div>
      </div>

      {/* Window Opacity Slider */}
      <div className={styles.optionGroup}>
        <label className={styles.optionLabel}>
          Window Opacity
          <span className={styles.optionHint}>Adjust window transparency</span>
        </label>
        <div className={styles.sliderGroup}>
          <input
            type="range"
            min="85"
            max="100"
            value={(customization.windowOpacity || 1.0) * 100}
            onChange={(e) => updateOption('windowOpacity', parseInt(e.target.value) / 100)}
            className={styles.slider}
          />
          <span className={styles.sliderValue}>
            {Math.round((customization.windowOpacity || 1.0) * 100)}%
          </span>
        </div>
        <div className={styles.opacityPreview}>
          <div 
            className={styles.previewWindow}
            style={{ opacity: customization.windowOpacity || 1.0 }}
          >
            <div className={styles.previewTitleBar}>Window Preview</div>
            <div className={styles.previewContent}>
              Preview window at {Math.round((customization.windowOpacity || 1.0) * 100)}% opacity
            </div>
          </div>
        </div>
      </div>

      {/* Corner Style Toggle */}
      <div className={styles.optionGroup}>
        <label className={styles.optionLabel}>
          Corner Style
          <span className={styles.optionHint}>Window and button corner shape</span>
        </label>
        <div className={styles.toggleGroup}>
          <button
            className={`${styles.toggleButton} ${(!customization.cornerStyle || customization.cornerStyle === 'sharp') ? styles.active : ''}`}
            onClick={() => updateOption('cornerStyle', 'sharp')}
          >
            <div className={styles.cornerPreview} data-style="sharp" />
            <span>Sharp</span>
            <span className={styles.buttonHint}>Authentic Mac OS 8</span>
          </button>
          <button
            className={`${styles.toggleButton} ${customization.cornerStyle === 'rounded' ? styles.active : ''}`}
            onClick={() => updateOption('cornerStyle', 'rounded')}
          >
            <div className={styles.cornerPreview} data-style="rounded" />
            <span>Rounded</span>
            <span className={styles.buttonHint}>Modern macOS style</span>
          </button>
        </div>
      </div>

      {/* Menu Bar Style Toggle */}
      <div className={styles.optionGroup}>
        <label className={styles.optionLabel}>
          Menu Bar Style
          <span className={styles.optionHint}>Menu bar transparency</span>
        </label>
        <div className={styles.toggleGroup}>
          <button
            className={`${styles.toggleButton} ${(!customization.menuBarStyle || customization.menuBarStyle === 'opaque') ? styles.active : ''}`}
            onClick={() => updateOption('menuBarStyle', 'opaque')}
          >
            <div className={styles.menuBarPreview} data-style="opaque" />
            <span>Opaque</span>
            <span className={styles.buttonHint}>Solid, classic</span>
          </button>
          <button
            className={`${styles.toggleButton} ${customization.menuBarStyle === 'translucent' ? styles.active : ''}`}
            onClick={() => updateOption('menuBarStyle', 'translucent')}
          >
            <div className={styles.menuBarPreview} data-style="translucent" />
            <span>Translucent</span>
            <span className={styles.buttonHint}>Modern, subtle</span>
          </button>
        </div>
      </div>

      {/* Font Size Selector */}
      <div className={styles.optionGroup}>
        <label className={styles.optionLabel}>
          Font Size
          <span className={styles.optionHint}>Adjust system text size</span>
        </label>
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.optionButton} ${customization.fontSize === 'small' ? styles.active : ''}`}
            onClick={() => updateOption('fontSize', 'small')}
          >
            <span style={{ fontSize: '10px' }}>Aa</span>
            <span>Small</span>
            <span className={styles.buttonHint}>10px</span>
          </button>
          <button
            className={`${styles.optionButton} ${(!customization.fontSize || customization.fontSize === 'medium') ? styles.active : ''}`}
            onClick={() => updateOption('fontSize', 'medium')}
          >
            <span style={{ fontSize: '12px' }}>Aa</span>
            <span>Medium</span>
            <span className={styles.buttonHint}>12px (default)</span>
          </button>
          <button
            className={`${styles.optionButton} ${customization.fontSize === 'large' ? styles.active : ''}`}
            onClick={() => updateOption('fontSize', 'large')}
          >
            <span style={{ fontSize: '14px' }}>Aa</span>
            <span>Large</span>
            <span className={styles.buttonHint}>14px</span>
          </button>
        </div>
      </div>

      {/* Reset Button */}
      <div className={styles.resetSection}>
        <button
          className={styles.resetButton}
          onClick={() => onCustomizationChange({})}
        >
          ↺ Reset All Advanced Options
        </button>
        <p className={styles.resetHint}>
          Restore default settings for all advanced options
        </p>
      </div>
    </div>
  );
}

