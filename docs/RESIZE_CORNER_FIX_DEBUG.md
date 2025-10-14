# Resize Corner and Window Positioning Fix - Debug Mode

## Summary

Implemented fixes to make the resize corner clickable and ensure windows open within viewport bounds. Added debug mode to verify resize corner interaction.

## Issues Addressed

1. ✅ **Resize corner not clickable** - Removed `position: relative` from content area to fix stacking context
2. ✅ **Windows opening below viewport** - Added dock height validation to ensure proper clamping
3. ✅ **Debug mode enabled** - Resize corner now visible in red for testing

## Changes Made

### 1. Fixed Content Area Positioning (`Window.module.css`)

**File**: `src/OS/components/Window/Window.module.css` (line 165-170)

**Problem**: The `.content` class had `position: relative` which created a new stacking context, potentially interfering with the resize handle's z-index.

**Change**:
```css
/* BEFORE */
.content {
  flex: 1;
  overflow: hidden;
  background: var(--theme-window-background, var(--mac-white));
  color: var(--theme-text, var(--mac-black));
  position: relative;  /* ← REMOVED */
}

/* AFTER */
.content {
  flex: 1;
  overflow: hidden;
  background: var(--theme-window-background, var(--mac-white));
  color: var(--theme-text, var(--mac-black));
}
```

**Why**: Removing `position: relative` eliminates the stacking context, allowing the resize handle (z-index: 100) to properly appear above all content.

### 2. Added Pointer Events to Window (`Window.module.css`)

**File**: `src/OS/components/Window/Window.module.css` (line 6-21)

**Change**:
```css
.window {
  position: absolute;
  background: var(--theme-window-background, var(--mac-white));
  border: 1px solid var(--theme-window-border, var(--mac-black));
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;  /* ← ADDED */
  /* ... rest of styles ... */
}
```

**Why**: Explicitly enabling pointer events ensures the window and all its children (including the resize handle) can receive mouse/pointer events.

### 3. Validated Dock Height Calculation (`systemStore.ts`)

**File**: `src/OS/store/systemStore.ts` (line 166-187)

**Problem**: Dock height query might return 0 or invalid values on subsequent window opens if DOM isn't fully rendered.

**Change**:
```typescript
// BEFORE
const dockElement = typeof document !== 'undefined' ? document.querySelector('[class*="dock"]') : null;
const dockHeight = dockElement ? dockElement.getBoundingClientRect().height : 80;

const clampedPosition = windowManager.clampWindowPosition(
  window.position,
  window.size,
  viewportWidth,
  viewportHeight,
  menuBarHeight,
  dockHeight  // Could be 0 or incorrect
);

// AFTER
const dockElement = typeof document !== 'undefined' ? document.querySelector('[class*="dock"]') : null;
const dockHeight = dockElement?.getBoundingClientRect().height || 80;

// CRITICAL: Ensure dock height is reasonable (between 60-120px typical range)
const validatedDockHeight = Math.max(60, Math.min(120, dockHeight));

const clampedPosition = windowManager.clampWindowPosition(
  window.position,
  window.size,
  viewportWidth,
  viewportHeight,
  menuBarHeight,
  validatedDockHeight  // Always between 60-120px
);
```

**Why**: 
- Validates dock height is within expected range (60-120px)
- Prevents windows from opening off-screen if dock height is incorrectly calculated
- Ensures consistent behavior across all window opens

### 4. Added Debug Mode to Resize Corner (`Window.tsx`)

**File**: `src/OS/components/Window/Window.tsx` (line 415-435)

**Change**:
```tsx
{/* Resize Handle (if resizable) */}
{window.isResizable && window.state === 'normal' && (
  <button
    className={styles.resizeHandle}
    onMouseDown={(e) => {
      console.log('Resize corner clicked!', e);  // ← DEBUG
      handleResizeStart(e);
    }}
    onPointerDown={(e) => {
      console.log('Pointer down on resize corner', e);  // ← DEBUG
    }}
    aria-label={`Resize ${window.title}`}
    title="Resize"
    tabIndex={0}
    style={{
      // Debug: Make it very visible
      background: 'red',    // ← DEBUG
      opacity: 1,           // ← DEBUG
    }}
  />
)}
```

**Why**: 
- Red background makes resize corner highly visible for testing
- Console logs verify when corner receives click/pointer events
- Helps diagnose if issue is rendering or event handling

## Testing Instructions

### Test 1: Resize Corner Visibility
1. Open Auction app
2. Look for bright red square in bottom-right corner (20x20px)
3. If visible → Rendering is working
4. If not visible → Check browser inspector for element

### Test 2: Resize Corner Clickability
1. Click on the red resize corner
2. Check browser console for: `"Resize corner clicked!"`
3. Check console for: `"Pointer down on resize corner"`
4. If logs appear → Event handling is working
5. If no logs → z-index or pointer-events issue remains

### Test 3: Window Opening Position
1. Open Auction (first instance)
2. Note its position - should be within viewport
3. Open Auction (second instance)
4. Note its position - should also be within viewport, above dock
5. Check console for dock height value (should be 60-120)

### Test 4: Resize Functionality
1. Click and hold red corner
2. Drag mouse to resize window
3. Window should resize smoothly
4. Release mouse
5. Window should maintain new size

## Debug Console Output

Expected console messages when interacting with resize corner:

```
Resize corner clicked! MouseEvent {isTrusted: true, ...}
Pointer down on resize corner PointerEvent {isTrusted: true, ...}
```

If you see these messages, the resize corner is receiving events correctly.

## Dock Height Validation Logic

```typescript
const validatedDockHeight = Math.max(60, Math.min(120, dockHeight));
```

**Validation ranges**:
- Minimum: 60px (smallest reasonable dock)
- Maximum: 120px (largest reasonable dock)
- Default: 80px (if dock element not found)

**Examples**:
- Measured 0px → Clamped to 60px
- Measured 45px → Clamped to 60px
- Measured 75px → Used as-is (75px)
- Measured 150px → Clamped to 120px

## Z-Index Hierarchy After Fix

```
Desktop: 0
Windows: 1-1000+
  ├─ Window Container: pointer-events: auto
  ├─ Title Bar: z-index: auto
  ├─ Content: (no position: relative)  ← FIXED
  │   └─ ScrollBar: z-index: 10
  └─ Resize Corner: z-index: 100 ✓ (now properly layered)
MenuBar: 900
Dock: 900
```

## Next Steps

### If Resize Corner Works
1. Remove debug styles from `Window.tsx`:
   - Remove `background: 'red'`
   - Remove `opacity: 1`
   - Remove console.log statements
2. Verify resize works smoothly
3. Test with multiple windows

### If Resize Corner Still Doesn't Work
1. Check browser inspector:
   - Verify resize handle element exists
   - Check computed z-index value
   - Check pointer-events value
   - Look for any overlaying elements
2. Check if ScrollBar is creating overlay issues
3. Try temporarily setting resize handle z-index to 9999

## Files Modified

1. `/src/OS/components/Window/Window.module.css` - Removed position: relative from content, added pointer-events to window
2. `/src/OS/store/systemStore.ts` - Added dock height validation
3. `/src/OS/components/Window/Window.tsx` - Added debug logging and visible red corner

## Rollback Instructions

If debug mode needs to be removed:

**Window.tsx** - Remove debug code:
```tsx
// REMOVE the style prop and console.logs
<button
  className={styles.resizeHandle}
  onMouseDown={handleResizeStart}  // Back to simple handler
  aria-label={`Resize ${window.title}`}
  title="Resize"
  tabIndex={0}
  // NO style prop
/>
```

## Status

✅ **DEBUG MODE ACTIVE** - Resize corner should now be visible in red and clickable
⏳ **TESTING REQUIRED** - Need to verify resize corner works in browser
🔍 **INVESTIGATION MODE** - Debug logs will help identify remaining issues

