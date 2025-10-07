/**
 * MobileKeyboard Component
 * Custom Mac OS 8-styled soft keyboard for mobile
 * Multi-language support (English, Spanish, French, German, Japanese)
 */

import { useState, useEffect } from 'react';
import styles from './MobileKeyboard.module.css';

export type KeyboardLayout = 'english' | 'spanish' | 'french' | 'german' | 'japanese';
export type KeyboardMode = 'lowercase' | 'uppercase' | 'symbols' | 'numbers';

export interface MobileKeyboardProps {
  onKeyPress: (key: string) => void;
  onClose: () => void;
  layout?: KeyboardLayout;
  autoCapitalize?: boolean;
  className?: string;
}

const LAYOUTS: Record<KeyboardLayout, Record<KeyboardMode, string[][]>> = {
  english: {
    lowercase: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
      ['123', 'space', 'return'],
    ],
    uppercase: [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'backspace'],
      ['123', 'space', 'return'],
    ],
    symbols: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
      ['#+=', '.', ',', '?', '!', "'", 'backspace'],
      ['ABC', 'space', 'return'],
    ],
    numbers: [
      ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
      ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
      ['123', '.', ',', '?', '!', "'", 'backspace'],
      ['ABC', 'space', 'return'],
    ],
  },
  spanish: {
    lowercase: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
      ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
      ['123', 'space', 'return'],
    ],
    uppercase: [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
      ['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'backspace'],
      ['123', 'space', 'return'],
    ],
    symbols: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
      ['#+=', '¿', '¡', '?', '!', "'", 'backspace'],
      ['ABC', 'space', 'return'],
    ],
    numbers: [
      ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
      ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
      ['123', 'á', 'é', 'í', 'ó', 'ú', 'backspace'],
      ['ABC', 'space', 'return'],
    ],
  },
  french: {
    lowercase: [
      ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
      ['shift', 'w', 'x', 'c', 'v', 'b', 'n', 'backspace'],
      ['123', 'space', 'return'],
    ],
    uppercase: [
      ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
      ['shift', 'W', 'X', 'C', 'V', 'B', 'N', 'backspace'],
      ['123', 'space', 'return'],
    ],
    symbols: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
      ['#+=', '.', ',', '?', '!', "'", 'backspace'],
      ['ABC', 'space', 'return'],
    ],
    numbers: [
      ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
      ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
      ['123', 'à', 'è', 'é', 'ù', 'ç', 'backspace'],
      ['ABC', 'space', 'return'],
    ],
  },
  german: {
    lowercase: [
      ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
      ['shift', 'y', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
      ['123', 'space', 'return'],
    ],
    uppercase: [
      ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ü'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä'],
      ['shift', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'backspace'],
      ['123', 'space', 'return'],
    ],
    symbols: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
      ['#+=', '.', ',', '?', '!', "'", 'backspace'],
      ['ABC', 'space', 'return'],
    ],
    numbers: [
      ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
      ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
      ['123', 'ß', '.', ',', '?', '!', 'backspace'],
      ['ABC', 'space', 'return'],
    ],
  },
  japanese: {
    lowercase: [
      ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'],
      ['い', 'き', 'し', 'ち', 'に', 'ひ', 'み', 'ゆ', 'り', 'を'],
      ['う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'よ', 'る', 'ん'],
      ['shift', 'え', 'け', 'せ', 'て', 'ね', 'へ', 'め', 'れ', 'backspace'],
      ['ABC', 'space', 'return'],
    ],
    uppercase: [
      ['ア', 'カ', 'サ', 'タ', 'ナ', 'ハ', 'マ', 'ヤ', 'ラ', 'ワ'],
      ['イ', 'キ', 'シ', 'チ', 'ニ', 'ヒ', 'ミ', 'ユ', 'リ', 'ヲ'],
      ['ウ', 'ク', 'ス', 'ツ', 'ヌ', 'フ', 'ム', 'ヨ', 'ル', 'ン'],
      ['shift', 'エ', 'ケ', 'セ', 'テ', 'ネ', 'ヘ', 'メ', 'レ', 'backspace'],
      ['ABC', 'space', 'return'],
    ],
    symbols: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['-', '/', ':', ';', '(', ')', '¥', '&', '@', '"'],
      ['#+=', '。', '、', '？', '！', "'", 'backspace'],
      ['ABC', 'space', 'return'],
    ],
    numbers: [
      ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
      ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
      ['123', '。', '、', '？', '！', "'", 'backspace'],
      ['ABC', 'space', 'return'],
    ],
  },
};

export default function MobileKeyboard({
  onKeyPress,
  onClose,
  layout = 'english',
  autoCapitalize = true,
  className = '',
}: MobileKeyboardProps) {
  const [mode, setMode] = useState<KeyboardMode>(autoCapitalize ? 'uppercase' : 'lowercase');
  const [currentLayout, setCurrentLayout] = useState<KeyboardLayout>(layout);
  const [shiftLocked, setShiftLocked] = useState(false);

  const keys = LAYOUTS[currentLayout][mode];

  const handleKeyPress = (key: string) => {
    switch (key) {
      case 'shift':
        if (mode === 'lowercase') {
          setMode('uppercase');
        } else if (mode === 'uppercase' && !shiftLocked) {
          setMode('lowercase');
        }
        break;

      case 'backspace':
        onKeyPress('\b'); // Backspace character
        break;

      case 'return':
        onKeyPress('\n'); // Newline character
        break;

      case 'space':
        onKeyPress(' ');
        // Auto-capitalize after space if enabled
        if (autoCapitalize && mode === 'lowercase' && !shiftLocked) {
          setMode('uppercase');
        }
        break;

      case '123':
        setMode('symbols');
        break;

      case '#+=':
        setMode('numbers');
        break;

      case 'ABC':
        setMode(autoCapitalize ? 'uppercase' : 'lowercase');
        break;

      default:
        onKeyPress(key);
        // Auto-lowercase after typing if not shift-locked
        if ((mode === 'uppercase' || mode === 'lowercase') && !shiftLocked) {
          setMode('lowercase');
        }
        break;
    }
  };

  const handleShiftLongPress = () => {
    setShiftLocked(!shiftLocked);
    setMode(shiftLocked ? 'lowercase' : 'uppercase');
  };

  const getKeyLabel = (key: string) => {
    switch (key) {
      case 'shift':
        return '⇧';
      case 'backspace':
        return '⌫';
      case 'return':
        return '↵';
      case 'space':
        return 'space';
      case '123':
        return '123';
      case '#+=':
        return '#+=';
      case 'ABC':
        return 'ABC';
      default:
        return key;
    }
  };

  const getKeyClass = (key: string) => {
    const classes = [styles.key];

    if (key === 'space') classes.push(styles.space);
    if (key === 'return') classes.push(styles.return);
    if (key === 'backspace') classes.push(styles.backspace);
    if (key === 'shift') {
      classes.push(styles.shift);
      if (shiftLocked) classes.push(styles.shiftLocked);
    }
    if (['123', '#+=', 'ABC'].includes(key)) classes.push(styles.mode);

    return classes.join(' ');
  };

  return (
    <div className={`${styles.keyboard} ${className}`}>
      {/* Language Selector */}
      <div className={styles.header}>
        <select
          value={currentLayout}
          onChange={(e) => setCurrentLayout(e.target.value as KeyboardLayout)}
          className={styles.languageSelector}
        >
          <option value="english">English</option>
          <option value="spanish">Español</option>
          <option value="french">Français</option>
          <option value="german">Deutsch</option>
          <option value="japanese">日本語</option>
        </select>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>

      {/* Keys */}
      <div className={styles.keys}>
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map((key, keyIndex) => (
              <button
                key={`${key}-${keyIndex}`}
                className={getKeyClass(key)}
                onClick={() => handleKeyPress(key)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (key === 'shift') {
                    handleShiftLongPress();
                  }
                }}
              >
                {getKeyLabel(key)}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

