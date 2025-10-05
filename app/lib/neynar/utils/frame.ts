/**
 * Neynar SDK - Frame Utilities
 * 
 * Pure business logic for handling Farcaster Frames.
 * No React dependencies - can be used in any context.
 * 
 * @module app/lib/neynar/utils/frame
 */

import type {
  Frame,
  FrameButton,
} from './types';

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates a frame URL
 * 
 * @param url - Frame URL to validate
 * @returns True if valid HTTPS URL
 * 
 * @example
 * ```typescript
 * isValidFrameUrl('https://example.com/frame') // true
 * isValidFrameUrl('http://example.com') // false
 * ```
 */
export function isValidFrameUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates frame aspect ratio
 * 
 * @param ratio - Aspect ratio string
 * @returns True if valid
 * 
 * @example
 * ```typescript
 * isValidAspectRatio('1.91:1') // true
 * isValidAspectRatio('1:1') // true
 * isValidAspectRatio('invalid') // false
 * ```
 */
export function isValidAspectRatio(ratio: string): boolean {
  const validRatios = ['1.91:1', '1:1'];
  return validRatios.includes(ratio);
}

/**
 * Validates button action type
 * 
 * @param action - Button action
 * @returns True if valid
 * 
 * @example
 * ```typescript
 * isValidButtonAction('post') // true
 * isValidButtonAction('invalid') // false
 * ```
 */
export function isValidButtonAction(action: string): boolean {
  const validActions = ['post', 'post_redirect', 'link', 'mint', 'tx'];
  return validActions.includes(action);
}

// ============================================================================
// Frame Properties
// ============================================================================

/**
 * Gets frame version
 * 
 * @param frame - Frame object
 * @returns Frame version
 * 
 * @example
 * ```typescript
 * getFrameVersion(frame) // 'vNext'
 * ```
 */
export function getFrameVersion(frame: Frame): string {
  return frame.version || 'unknown';
}

/**
 * Gets frame image URL
 * 
 * @param frame - Frame object
 * @returns Image URL
 * 
 * @example
 * ```typescript
 * getFrameImage(frame) // 'https://example.com/image.png'
 * ```
 */
export function getFrameImage(frame: Frame): string {
  return frame.image || '';
}

/**
 * Checks if frame has image
 * 
 * @param frame - Frame object
 * @returns True if has image
 * 
 * @example
 * ```typescript
 * hasImage(frame) // true
 * ```
 */
export function hasImage(frame: Frame): boolean {
  return Boolean(frame.image && frame.image.trim().length > 0);
}

/**
 * Gets frame button count
 * 
 * @param frame - Frame object
 * @returns Number of buttons
 * 
 * @example
 * ```typescript
 * getButtonCount(frame) // 3
 * ```
 */
export function getButtonCount(frame: Frame): number {
  return frame.buttons?.length || 0;
}

/**
 * Checks if frame has buttons
 * 
 * @param frame - Frame object
 * @returns True if has buttons
 * 
 * @example
 * ```typescript
 * hasButtons(frame) // true
 * ```
 */
export function hasButtons(frame: Frame): boolean {
  return getButtonCount(frame) > 0;
}

// ============================================================================
// Button Utilities
// ============================================================================

/**
 * Gets button by index
 * 
 * @param frame - Frame object
 * @param index - Button index (1-based)
 * @returns Button or null
 * 
 * @example
 * ```typescript
 * const button = getButton(frame, 1)
 * ```
 */
export function getButton(frame: Frame, index: number): FrameButton | null {
  if (!frame.buttons || index < 1 || index > frame.buttons.length) {
    return null;
  }
  return frame.buttons[index - 1];
}

/**
 * Gets button title
 * 
 * @param button - Button object
 * @returns Button title
 * 
 * @example
 * ```typescript
 * getButtonTitle(button) // 'Click Me'
 * ```
 */
export function getButtonTitle(button: FrameButton): string {
  return button.title || 'Button';
}

/**
 * Gets button action type
 * 
 * @param button - Button object
 * @returns Action type
 * 
 * @example
 * ```typescript
 * getButtonAction(button) // 'post'
 * ```
 */
export function getButtonAction(button: FrameButton): string {
  return button.actionType || 'post';
}

/**
 * Checks if button is link type
 * 
 * @param button - Button object
 * @returns True if link button
 * 
 * @example
 * ```typescript
 * isLinkButton(button) // false
 * ```
 */
export function isLinkButton(button: FrameButton): boolean {
  return getButtonAction(button) === 'link';
}

/**
 * Checks if button is post type
 * 
 * @param button - Button object
 * @returns True if post button
 * 
 * @example
 * ```typescript
 * isPostButton(button) // true
 * ```
 */
export function isPostButton(button: FrameButton): boolean {
  const action = getButtonAction(button);
  return action === 'post' || action === 'post_redirect';
}

/**
 * Checks if button is transaction type
 * 
 * @param button - Button object
 * @returns True if transaction button
 * 
 * @example
 * ```typescript
 * isTxButton(button) // false
 * ```
 */
export function isTxButton(button: FrameButton): boolean {
  return getButtonAction(button) === 'tx';
}

// ============================================================================
// Frame Type Detection
// ============================================================================

/**
 * Checks if frame is interactive
 * 
 * @param frame - Frame object
 * @returns True if has buttons or input
 * 
 * @example
 * ```typescript
 * isInteractive(frame) // true
 * ```
 */
export function isInteractive(frame: Frame): boolean {
  return hasButtons(frame) || hasInput(frame);
}

/**
 * Checks if frame has input field
 * 
 * @param frame - Frame object
 * @returns True if has input
 * 
 * @example
 * ```typescript
 * hasInput(frame) // true
 * ```
 */
export function hasInput(frame: Frame): boolean {
  return Boolean(frame.inputText);
}

/**
 * Gets input placeholder text
 * 
 * @param frame - Frame object
 * @returns Placeholder text
 * 
 * @example
 * ```typescript
 * getInputText(frame) // 'Enter your name'
 * ```
 */
export function getInputText(frame: Frame): string {
  return frame.inputText || '';
}

// ============================================================================
// Frame Metadata
// ============================================================================


// ============================================================================
// Formatting
// ============================================================================

/**
 * Gets frame summary text
 * 
 * @param frame - Frame object
 * @returns Summary text
 * 
 * @example
 * ```typescript
 * getFrameSummary(frame)
 * // 'Frame v1 • 3 buttons • Interactive'
 * ```
 */
export function getFrameSummary(frame: Frame): string {
  const version = getFrameVersion(frame);
  const buttonCount = getButtonCount(frame);
  const interactive = isInteractive(frame) ? 'Interactive' : 'Static';
  
  return `Frame ${version} • ${buttonCount} ${buttonCount === 1 ? 'button' : 'buttons'} • ${interactive}`;
}

/**
 * Formats frame URL for display (truncated)
 * 
 * @param url - Frame URL
 * @param maxLength - Maximum length
 * @returns Formatted string
 * 
 * @example
 * ```typescript
 * formatFrameUrl('https://example.com/frame/path', 20)
 * // 'example.com/frame...'
 * ```
 */
export function formatFrameUrl(url: string, maxLength: number = 40): string {
  try {
    const parsed = new URL(url);
    const display = `${parsed.hostname}${parsed.pathname}`;
    
    if (display.length <= maxLength) {
      return display;
    }
    
    return `${display.slice(0, maxLength - 3)}...`;
  } catch {
    return url;
  }
}

