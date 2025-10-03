'use client';

/**
 * Calculator App
 * Classic Mac OS 8 calculator with state sharing
 */

import { useState, useEffect } from 'react';
import { 
  getStateFromURL, 
  setStateInURL, 
  generateShareableURL, 
  copyToClipboard 
} from '../../app/lib/utils/stateUtils';
import styles from './Calculator.module.css';

interface CalculatorProps {
  windowId: string;
}

type Operation = '+' | '-' | '×' | '÷' | null;

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: Operation;
  waitingForOperand: boolean;
  memory: number;
}

// Serializable state (what we save to URL)
interface SerializableState {
  display: string;
  previousValue: number | null;
  operation: Operation;
  memory: number;
}

export default function Calculator({ windowId }: CalculatorProps) {
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  
  // Initialize state from URL if available
  const getInitialState = (): CalculatorState => {
    const urlState = getStateFromURL<SerializableState>('calculator');
    
    if (urlState) {
      return {
        display: urlState.display || '0',
        previousValue: urlState.previousValue,
        operation: urlState.operation,
        waitingForOperand: false,
        memory: urlState.memory || 0,
      };
    }
    
    return {
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
      memory: 0,
    };
  };

  const [state, setState] = useState<CalculatorState>(getInitialState);

  // Handle number input
  const inputDigit = (digit: number) => {
    const { display, waitingForOperand } = state;

    if (waitingForOperand) {
      setState({
        ...state,
        display: String(digit),
        waitingForOperand: false,
      });
    } else {
      setState({
        ...state,
        display: display === '0' ? String(digit) : display + digit,
      });
    }
  };

  // Handle decimal point
  const inputDecimal = () => {
    const { display, waitingForOperand } = state;

    if (waitingForOperand) {
      setState({
        ...state,
        display: '0.',
        waitingForOperand: false,
      });
    } else if (display.indexOf('.') === -1) {
      setState({
        ...state,
        display: display + '.',
      });
    }
  };

  // Clear everything
  const clear = () => {
    setState({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
      memory: state.memory, // Keep memory
    });
  };

  // Clear entry (just the display)
  const clearEntry = () => {
    setState({
      ...state,
      display: '0',
    });
  };

  // Perform calculation
  const performOperation = (nextOperation: Operation) => {
    const { display, previousValue, operation } = state;
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setState({
        ...state,
        previousValue: inputValue,
        operation: nextOperation,
        waitingForOperand: true,
      });
    } else if (operation) {
      const currentValue = previousValue || 0;
      let newValue = currentValue;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = currentValue / inputValue;
          break;
      }

      setState({
        ...state,
        display: String(newValue),
        previousValue: newValue,
        operation: nextOperation,
        waitingForOperand: true,
      });
    }
  };

  // Calculate result
  const calculate = () => {
    const { display, previousValue, operation } = state;
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      let result = previousValue;

      switch (operation) {
        case '+':
          result = previousValue + inputValue;
          break;
        case '-':
          result = previousValue - inputValue;
          break;
        case '×':
          result = previousValue * inputValue;
          break;
        case '÷':
          result = previousValue / inputValue;
          break;
      }

      setState({
        ...state,
        display: String(result),
        previousValue: null,
        operation: null,
        waitingForOperand: true,
      });
    }
  };

  // Toggle sign
  const toggleSign = () => {
    const { display } = state;
    const value = parseFloat(display);
    setState({
      ...state,
      display: String(value * -1),
    });
  };

  // Percentage
  const inputPercent = () => {
    const { display } = state;
    const value = parseFloat(display);
    setState({
      ...state,
      display: String(value / 100),
    });
  };

  // Memory functions
  const memoryClear = () => {
    setState({ ...state, memory: 0 });
  };

  const memoryRecall = () => {
    setState({
      ...state,
      display: String(state.memory),
      waitingForOperand: true,
    });
  };

  const memoryAdd = () => {
    const value = parseFloat(state.display);
    setState({
      ...state,
      memory: state.memory + value,
      waitingForOperand: true,
    });
  };

  const memorySubtract = () => {
    const value = parseFloat(state.display);
    setState({
      ...state,
      memory: state.memory - value,
      waitingForOperand: true,
    });
  };

  // Sync state to URL when it changes
  useEffect(() => {
    const serializableState: SerializableState = {
      display: state.display,
      previousValue: state.previousValue,
      operation: state.operation,
      memory: state.memory,
    };
    
    setStateInURL('calculator', serializableState);
  }, [state]);

  // Share calculator state
  const handleShare = async () => {
    const serializableState: SerializableState = {
      display: state.display,
      previousValue: state.previousValue,
      operation: state.operation,
      memory: state.memory,
    };
    
    const shareURL = generateShareableURL('calculator', serializableState);
    const success = await copyToClipboard(shareURL);
    
    if (success) {
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 2000);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      
      // Numbers
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(parseInt(e.key));
      }
      // Operations
      else if (e.key === '+') performOperation('+');
      else if (e.key === '-') performOperation('-');
      else if (e.key === '*') performOperation('×');
      else if (e.key === '/') performOperation('÷');
      else if (e.key === 'Enter' || e.key === '=') calculate();
      else if (e.key === '.') inputDecimal();
      else if (e.key === 'Escape') clear();
      else if (e.key === 'c' || e.key === 'C') clearEntry();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state]);

  return (
    <div className={styles.calculator}>
      {/* Display */}
      <div className={styles.display}>
        <div className={styles.displayValue}>{state.display}</div>
      </div>

      {/* Memory Indicator */}
      {state.memory !== 0 && (
        <div className={styles.memoryIndicator}>M</div>
      )}

      {/* Button Grid */}
      <div className={styles.buttonGrid}>
        {/* Row 1: Memory & Clear */}
        <button className={styles.button} onClick={memoryClear}>MC</button>
        <button className={styles.button} onClick={memoryRecall}>MR</button>
        <button className={styles.button} onClick={memorySubtract}>M-</button>
        <button className={styles.button} onClick={memoryAdd}>M+</button>

        {/* Row 2: Clear & Operations */}
        <button className={`${styles.button} ${styles.buttonClear}`} onClick={clear}>C</button>
        <button className={styles.button} onClick={clearEntry}>CE</button>
        <button className={styles.button} onClick={toggleSign}>±</button>
        <button className={`${styles.button} ${styles.buttonOperation}`} onClick={() => performOperation('÷')}>÷</button>

        {/* Row 3: 7 8 9 × */}
        <button className={styles.button} onClick={() => inputDigit(7)}>7</button>
        <button className={styles.button} onClick={() => inputDigit(8)}>8</button>
        <button className={styles.button} onClick={() => inputDigit(9)}>9</button>
        <button className={`${styles.button} ${styles.buttonOperation}`} onClick={() => performOperation('×')}>×</button>

        {/* Row 4: 4 5 6 - */}
        <button className={styles.button} onClick={() => inputDigit(4)}>4</button>
        <button className={styles.button} onClick={() => inputDigit(5)}>5</button>
        <button className={styles.button} onClick={() => inputDigit(6)}>6</button>
        <button className={`${styles.button} ${styles.buttonOperation}`} onClick={() => performOperation('-')}>-</button>

        {/* Row 5: 1 2 3 + */}
        <button className={styles.button} onClick={() => inputDigit(1)}>1</button>
        <button className={styles.button} onClick={() => inputDigit(2)}>2</button>
        <button className={styles.button} onClick={() => inputDigit(3)}>3</button>
        <button className={`${styles.button} ${styles.buttonOperation}`} onClick={() => performOperation('+')}>+</button>

        {/* Row 6: 0 . = */}
        <button className={`${styles.button} ${styles.buttonZero}`} onClick={() => inputDigit(0)}>0</button>
        <button className={styles.button} onClick={inputDecimal}>.</button>
        <button className={`${styles.button} ${styles.buttonEquals}`} onClick={calculate}>=</button>
      </div>

      {/* Share Button */}
      <button className={styles.shareButton} onClick={handleShare}>
        Share State
      </button>

      {/* Copy Notification */}
      {showCopyNotification && (
        <div className={styles.notification}>
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}

