/**
 * Calculator Business Logic
 * Pure functions for calculator operations - fully testable
 */

export type Operation = '+' | '-' | '×' | '÷' | null;

export interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: Operation;
  waitingForOperand: boolean;
  memory: number;
}

/**
 * Handle digit input
 */
export function inputDigit(state: CalculatorState, digit: number): CalculatorState {
  const { display, waitingForOperand } = state;

  if (waitingForOperand) {
    return {
      ...state,
      display: String(digit),
      waitingForOperand: false,
    };
  }

  return {
    ...state,
    display: display === '0' ? String(digit) : display + digit,
  };
}

/**
 * Handle decimal point input
 */
export function inputDecimal(state: CalculatorState): CalculatorState {
  const { display, waitingForOperand } = state;

  if (waitingForOperand) {
    return {
      ...state,
      display: '0.',
      waitingForOperand: false,
    };
  }

  if (display.indexOf('.') === -1) {
    return {
      ...state,
      display: display + '.',
    };
  }

  return state;
}

/**
 * Clear all (except memory)
 */
export function clear(state: CalculatorState): CalculatorState {
  return {
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
    memory: state.memory, // Keep memory
  };
}

/**
 * Clear entry (just the display)
 */
export function clearEntry(state: CalculatorState): CalculatorState {
  return {
    ...state,
    display: '0',
  };
}

/**
 * Execute arithmetic operation
 */
function executeOperation(operation: Operation, left: number, right: number): number {
  switch (operation) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      return left / right;
    default:
      return right;
  }
}

/**
 * Perform operation (chaining calculations)
 */
export function performOperation(
  state: CalculatorState,
  nextOperation: Operation
): CalculatorState {
  const { display, previousValue, operation } = state;
  const inputValue = parseFloat(display);

  // First operation - just store the value
  if (previousValue === null) {
    return {
      ...state,
      previousValue: inputValue,
      operation: nextOperation,
      waitingForOperand: true,
    };
  }

  // Subsequent operation - calculate result first
  if (operation) {
    const currentValue = previousValue || 0;
    const newValue = executeOperation(operation, currentValue, inputValue);

    return {
      ...state,
      display: String(newValue),
      previousValue: newValue,
      operation: nextOperation,
      waitingForOperand: true,
    };
  }

  return state;
}

/**
 * Calculate final result (equals button)
 */
export function calculate(state: CalculatorState): CalculatorState {
  const { display, previousValue, operation } = state;
  const inputValue = parseFloat(display);

  if (previousValue !== null && operation) {
    const result = executeOperation(operation, previousValue, inputValue);

    return {
      ...state,
      display: String(result),
      previousValue: null,
      operation: null,
      waitingForOperand: true,
    };
  }

  return state;
}

/**
 * Toggle sign (+/-)
 */
export function toggleSign(state: CalculatorState): CalculatorState {
  const value = parseFloat(state.display);
  return {
    ...state,
    display: String(value * -1),
  };
}

/**
 * Input percentage
 */
export function inputPercent(state: CalculatorState): CalculatorState {
  const value = parseFloat(state.display);
  return {
    ...state,
    display: String(value / 100),
  };
}

/**
 * Clear memory
 */
export function memoryClear(state: CalculatorState): CalculatorState {
  return {
    ...state,
    memory: 0,
  };
}

/**
 * Recall memory
 */
export function memoryRecall(state: CalculatorState): CalculatorState {
  return {
    ...state,
    display: String(state.memory),
    waitingForOperand: true,
  };
}

/**
 * Add to memory
 */
export function memoryAdd(state: CalculatorState): CalculatorState {
  const value = parseFloat(state.display);
  return {
    ...state,
    memory: state.memory + value,
    waitingForOperand: true,
  };
}

/**
 * Subtract from memory
 */
export function memorySubtract(state: CalculatorState): CalculatorState {
  const value = parseFloat(state.display);
  return {
    ...state,
    memory: state.memory - value,
    waitingForOperand: true,
  };
}

