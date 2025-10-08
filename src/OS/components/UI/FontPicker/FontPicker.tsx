/**
 * FontPicker Component
 * Allows users to select system and interface fonts
 * Presentation layer - uses fontManager for business logic
 */

import { useState, useEffect } from 'react';
import { getAllFonts, getFontsByCategory, getFontById, loadWebFont, getFontStack, type FontDefinition } from '../../../lib/fontManager';
import Select from '../Select/Select';
import styles from './FontPicker.module.css';

export interface FontPickerProps {
  category: 'system' | 'interface' | 'monospace';
  value: string;  // Font ID
  onChange: (fontId: string) => void;
  label?: string;
  showPreview?: boolean;
  className?: string;
}

export default function FontPicker({
  category,
  value,
  onChange,
  label,
  showPreview = true,
  className = '',
}: FontPickerProps) {
  const [fonts, setFonts] = useState<FontDefinition[]>([]);
  const [selectedFont, setSelectedFont] = useState<FontDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const availableFonts = getFontsByCategory(category);
    setFonts(availableFonts);
    
    const current = availableFonts.find(f => f.id === value) || getFontById(value);
    if (current) {
      setSelectedFont(current);
      
      // Load web font if needed
      if (current.isWebFont) {
        loadWebFont(current).catch(err => {
          console.error('Failed to load font:', err);
          setError(`Failed to load ${current.name}`);
        });
      }
    }
  }, [category, value]);

  const handleChange = async (fontId: string) => {
    const font = fonts.find(f => f.id === fontId);
    if (!font) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Load web font if needed
      if (font.isWebFont) {
        await loadWebFont(font);
      }
      
      setSelectedFont(font);
      onChange(fontId);
    } catch (err) {
      console.error('Failed to load font:', err);
      setError(`Failed to load ${font.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  const options = fonts.map(font => ({
    value: font.id,
    label: `${font.name}${font.isWebFont ? ' (Web Font)' : ''}`,
  }));

  return (
    <div className={`${styles.fontPicker} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      
      <Select
        options={options}
        value={value}
        onChange={handleChange}
        disabled={isLoading}
      />
      
      {showPreview && selectedFont && (
        <div 
          className={styles.preview}
          style={{ 
            fontFamily: getFontStack(selectedFont),
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          {selectedFont.preview || 'The quick brown fox jumps over the lazy dog'}
        </div>
      )}
      
      {isLoading && (
        <div className={styles.loading}>Loading font...</div>
      )}
      
      {error && (
        <div className={styles.error}>{error}</div>
      )}
    </div>
  );
}

