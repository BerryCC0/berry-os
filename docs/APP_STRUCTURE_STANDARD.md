# App Structure Standard for Berry OS

## The Problem

We discovered a **critical structural difference** between working apps (Finder, TextEditor, Tabs, MediaViewer) and problematic apps (Camp, Auction) that was causing the resize corner to be unclickable.

### Root Cause

The **ScrollBar component is rendered INSIDE the Window component**, not inside the App component. This means:

1. **Window.tsx structure:**
   ```tsx
   <div className={styles.window}>
     <div className={styles.titleBar}>...</div>
     
     <main className={styles.content}>
       <ScrollBar bottomOffset={20}>
         {/* App content goes HERE */}
         <YourApp windowId={windowId} />
       </ScrollBar>
     </main>
     
     {/* Resize handle is SIBLING to content */}
     <button className={styles.resizeHandle} />
   </div>
   ```

2. **The Window component controls scrolling**, not the app
3. Apps are rendered as **children of ScrollBar**, which wraps them
4. The resize handle is positioned **relative to the window container**, not the app content

### Why Camp & Auction Broke

Both Camp and Auction had **full-width/height root containers** that overlaid the entire ScrollBar area:

```css
/* ❌ PROBLEMATIC - This covers the resize corner */
.camp {
  width: 100%;      /* Covers entire window including resize corner */
  height: 100%;     /* Extends to bottom, blocking resize handle */
  /* ... */
}
```

This caused the app's content to completely cover the resize corner (which lives at `bottom: 0; right: 0` of the window container), making it unclickable even though it had `z-index: 100`.

### The Fix

We applied `pointer-events: none` to the app root and re-enabled events for children:

```css
.camp {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  pointer-events: none;  /* Let events pass through to resize corner */
}

.camp > * {
  pointer-events: auto;  /* Re-enable for actual content */
}
```

This allows clicks on the resize corner to pass through the app's root container.

---

## Standard App Structure

To prevent this issue in the future, **all Berry OS apps must follow this structure:**

### ✅ Correct Structure

```tsx
/**
 * YourApp.tsx
 */
export default function YourApp({ windowId }: { windowId: string }) {
  return (
    <div className={styles.yourApp}>
      {/* App content goes here */}
      <div className={styles.header}>...</div>
      <div className={styles.content}>...</div>
      <div className={styles.footer}>...</div>
    </div>
  );
}
```

```css
/**
 * YourApp.module.css
 */

/* Root container - MUST allow pointer events to pass through */
.yourApp {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--theme-window-background, #FFFFFF);
  color: var(--theme-text, #000000);
  font-family: var(--font-geneva);
  overflow: hidden;  /* Important - ScrollBar handles actual scrolling */
  
  /* CRITICAL: Allow resize corner to receive events */
  pointer-events: none;
}

/* Re-enable pointer events for all children */
.yourApp > * {
  pointer-events: auto;
}

/* Content sections */
.header {
  flex-shrink: 0;
  padding: 12px;
  border-bottom: 1px solid var(--theme-window-border);
}

.content {
  flex: 1;
  padding: 12px;
  /* DO NOT add overflow here - ScrollBar component handles it */
}

.footer {
  flex-shrink: 0;
  padding: 8px;
  border-top: 1px solid var(--theme-window-border);
}
```

---

## Key Requirements

### 1. Root Container Must:
- ✅ Be `width: 100%; height: 100%` (fills window content area)
- ✅ Use `overflow: hidden` (ScrollBar component handles scrolling)
- ✅ Have `pointer-events: none` (allows resize corner clicks)
- ✅ Use theme CSS variables for colors
- ❌ NOT use `position: relative` (creates stacking context issues)
- ❌ NOT handle its own scrolling (that's ScrollBar's job)

### 2. Direct Children Must:
- ✅ Re-enable `pointer-events: auto` via `.yourApp > *` selector
- ✅ Be interactive and receive user events normally

### 3. Layout Pattern:
```
Flexbox column layout (most common):
├── Header (flex-shrink: 0)
├── Content (flex: 1) - this will scroll if overflow
└── Footer (flex-shrink: 0)
```

### 4. Scrolling Behavior:
- The **ScrollBar component** (inside Window) handles all scrolling
- Apps should **NOT** add `overflow-y: auto` to their content areas
- If content exceeds available height, ScrollBar automatically shows

---

## Working Examples

### Example 1: Simple Single-Section App

```tsx
// SimpleApp.tsx
export default function SimpleApp({ windowId }: { windowId: string }) {
  return (
    <div className={styles.app}>
      <h1>My Simple App</h1>
      <p>Content goes here...</p>
    </div>
  );
}
```

```css
/* SimpleApp.module.css */
.app {
  width: 100%;
  height: 100%;
  padding: 20px;
  background: var(--theme-window-background);
  color: var(--theme-text);
  overflow: hidden;
  pointer-events: none;
}

.app > * {
  pointer-events: auto;
}
```

### Example 2: Multi-Section Layout (Header + Content + Footer)

```tsx
// ComplexApp.tsx
export default function ComplexApp({ windowId }: { windowId: string }) {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>App Title</h1>
        <div className={styles.controls}>...</div>
      </header>
      
      <main className={styles.content}>
        {/* Long scrollable content */}
      </main>
      
      <footer className={styles.footer}>
        <div className={styles.status}>Ready</div>
      </footer>
    </div>
  );
}
```

```css
/* ComplexApp.module.css */
.app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--theme-window-background);
  color: var(--theme-text);
  overflow: hidden;
  pointer-events: none;
}

.app > * {
  pointer-events: auto;
}

.header {
  flex-shrink: 0;
  padding: 12px;
  border-bottom: 1px solid var(--theme-window-border);
}

.content {
  flex: 1;
  padding: 16px;
  /* This will scroll if content exceeds height */
}

.footer {
  flex-shrink: 0;
  padding: 8px;
  border-top: 1px solid var(--theme-window-border);
}
```

### Example 3: Tabbed Interface

```tsx
// TabbedApp.tsx
export default function TabbedApp({ windowId }: { windowId: string }) {
  const [activeTab, setActiveTab] = useState('tab1');
  
  return (
    <div className={styles.app}>
      <div className={styles.tabs}>
        <button onClick={() => setActiveTab('tab1')}>Tab 1</button>
        <button onClick={() => setActiveTab('tab2')}>Tab 2</button>
      </div>
      
      <div className={styles.tabContent}>
        {activeTab === 'tab1' && <Tab1Content />}
        {activeTab === 'tab2' && <Tab2Content />}
      </div>
    </div>
  );
}
```

```css
/* TabbedApp.module.css */
.app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--theme-window-background);
  overflow: hidden;
  pointer-events: none;
}

.app > * {
  pointer-events: auto;
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 8px 8px 0 8px;
  border-bottom: 1px solid var(--theme-window-border);
}

.tabContent {
  flex: 1;
  padding: 16px;
  /* ScrollBar handles overflow */
}
```

---

## Migration Checklist for Existing Apps

If you have an existing app that doesn't follow this structure:

### Step 1: Check Root Container CSS
- [ ] Root has `width: 100%; height: 100%`
- [ ] Root has `overflow: hidden`
- [ ] Root has `pointer-events: none`
- [ ] Children have `pointer-events: auto` (via `.app > *`)
- [ ] Root does NOT have `position: relative`

### Step 2: Remove Internal Scroll Handling
- [ ] Remove `overflow-y: auto` from content areas
- [ ] Remove custom scrollbar styling (unless specifically needed)
- [ ] Trust ScrollBar component to handle scrolling

### Step 3: Test Resize Corner
- [ ] Open app in Berry OS
- [ ] Verify resize corner is visible (20x20px, bottom-right)
- [ ] Verify resize corner is clickable
- [ ] Verify resizing works smoothly
- [ ] Check that app content doesn't overlap corner

### Step 4: Test Scrolling
- [ ] Add enough content to exceed window height
- [ ] Verify ScrollBar appears automatically
- [ ] Verify scrolling works via ScrollBar arrows
- [ ] Verify scroll thumb dragging works
- [ ] Verify mousewheel scrolling works

---

## Why This Structure Works

### Window Component Hierarchy

```
Window Container (position: absolute)
├── Title Bar (position: relative)
├── Content Area (main, flex: 1)
│   └── ScrollBar Component (handles overflow)
│       └── YOUR APP (rendered as child)
└── Resize Handle (position: absolute, bottom: 0, right: 0, z-index: 100)
```

### Key Insights

1. **ScrollBar wraps your app** - Your app is rendered as a child of ScrollBar, not the other way around
2. **Window manages positioning** - Window component handles absolute positioning, z-index, and window chrome
3. **Resize handle is a sibling** - The resize corner is NOT inside your app's DOM tree
4. **Pointer events matter** - If your app's root covers 100% width/height, it will block the resize corner unless you use `pointer-events: none`

### The Stacking Context Issue (Resolved)

Previously, the Window's `.content` area had `position: relative`, which created a new stacking context. This meant:

❌ **Before:**
```
Window (position: absolute, z-index: X)
├── Content (position: relative) ← NEW stacking context
│   └── App (z-index: 1)
└── Resize Handle (z-index: 100) ← Stuck in Window's context, below Content
```

✅ **After (fixed):**
```
Window (position: absolute, z-index: X)
├── Content (NO position) ← No stacking context
│   └── App (z-index: auto)
└── Resize Handle (z-index: 100) ← Can stack above everything
```

By removing `position: relative` from `.content`, the resize handle can properly stack above app content.

---

## Integration with Window Management System

### AppConfig Requirements

When registering your app in `AppConfig.ts`:

```typescript
{
  id: 'your-app',
  name: 'Your App',
  component: YourApp,
  icon: getAppIconPath('your-app', 'svg'),
  defaultWindowSize: { width: 800, height: 600 },
  minWindowSize: { width: 400, height: 300 },
  // NO maxWindowSize - allow full screen resizing
  resizable: true,  // ← IMPORTANT for resize corner
  web3Required: false,
  mobileSupport: 'full',
  mobileLayout: 'fullscreen',
  category: 'utility',
  description: 'Your app description',
  version: '1.0.0',
}
```

### Window Positioning & Sizing

Your app doesn't need to worry about:
- ❌ Window dragging (handled by Window titlebar)
- ❌ Window resizing (handled by Window resize corner)
- ❌ Window z-index (handled by systemStore)
- ❌ Viewport bounds (handled by windowManager)
- ❌ Dock height calculations (handled by systemStore)
- ❌ MenuBar collision detection (handled by windowManager)

Your app DOES need to:
- ✅ Fill its container (`width: 100%; height: 100%`)
- ✅ Allow pointer events to pass through root
- ✅ Use flexbox for internal layout
- ✅ Trust ScrollBar to handle overflow

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Handling Scrolling Yourself
```css
/* DON'T DO THIS */
.myApp {
  overflow-y: auto;  /* ScrollBar component handles this */
}
```

### ❌ Mistake 2: Forgetting pointer-events
```css
/* DON'T DO THIS */
.myApp {
  width: 100%;
  height: 100%;
  /* Missing: pointer-events: none */
}
```

### ❌ Mistake 3: Creating Stacking Contexts
```css
/* DON'T DO THIS */
.myApp {
  position: relative;  /* Creates stacking context */
  z-index: 999;        /* Won't help with resize corner */
}
```

### ❌ Mistake 4: Absolute Positioning Root
```css
/* DON'T DO THIS */
.myApp {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* Use width/height 100% instead */
}
```

### ❌ Mistake 5: Fixed Heights
```css
/* DON'T DO THIS */
.myApp {
  height: 600px;  /* Use 100% to fill available space */
}
```

---

## Testing Your App

### Manual Testing Checklist

1. **Open App**
   - [ ] App opens with default size from AppConfig
   - [ ] App content is fully visible
   - [ ] No parts of app extend outside window

2. **Resize Corner**
   - [ ] Resize corner (20x20px) is visible at bottom-right
   - [ ] Corner has themed diagonal grip pattern
   - [ ] Corner is clickable (cursor changes to `nwse-resize`)
   - [ ] Dragging corner smoothly resizes window
   - [ ] App content reflows correctly during resize

3. **Scrolling**
   - [ ] If content exceeds height, ScrollBar appears
   - [ ] ScrollBar respects 20px gap at bottom (for resize corner)
   - [ ] Scroll arrows work
   - [ ] Scroll thumb dragging works
   - [ ] Mousewheel scrolling works
   - [ ] Content doesn't appear underneath resize corner

4. **Window Controls**
   - [ ] Close button closes app
   - [ ] Minimize button minimizes window
   - [ ] Zoom button maximizes to available space (between menubar and dock)
   - [ ] Titlebar dragging moves window
   - [ ] Window focus changes z-index correctly

5. **Interaction**
   - [ ] All buttons/inputs in app are clickable
   - [ ] Text is selectable
   - [ ] Links work
   - [ ] Forms submit correctly
   - [ ] No dead zones where clicks don't register

### Browser DevTools Inspection

```javascript
// Check if resize corner exists and is positioned correctly
const resizeHandle = document.querySelector('[class*="resizeHandle"]');
console.log({
  exists: !!resizeHandle,
  styles: window.getComputedStyle(resizeHandle),
  bounds: resizeHandle?.getBoundingClientRect()
});

// Check pointer-events on app root
const appRoot = document.querySelector('[class*="yourApp"]');
console.log({
  pointerEvents: window.getComputedStyle(appRoot).pointerEvents,
  zIndex: window.getComputedStyle(appRoot).zIndex
});
```

---

## Theme Integration

All apps should use theme CSS variables:

```css
.yourApp {
  /* Colors */
  background: var(--theme-window-background, #FFFFFF);
  color: var(--theme-text, #000000);
  border: 1px solid var(--theme-window-border, #000000);
  
  /* Fonts */
  font-family: var(--font-geneva);
  
  /* Spacing (from globals.css) */
  padding: var(--spacing-md);
  gap: var(--spacing-sm);
}

/* Buttons */
.button {
  background: var(--theme-button-background);
  color: var(--theme-button-text);
  border: 1px solid var(--theme-button-border);
}

.button:hover {
  background: var(--theme-button-background-hover);
}

/* Inputs */
.input {
  background: var(--theme-input-background);
  color: var(--theme-input-text);
  border: 1px solid var(--theme-input-border);
}

.input:focus {
  border-color: var(--theme-input-border-focused);
  outline: 2px solid var(--theme-focus-outline);
}
```

---

## Summary: The Golden Rules

1. **Root container:** `width: 100%; height: 100%; overflow: hidden; pointer-events: none;`
2. **Re-enable events:** `.app > * { pointer-events: auto; }`
3. **No position: relative** on root (creates stacking context)
4. **Let ScrollBar handle scrolling** (don't add `overflow-y: auto`)
5. **Use flexbox column** for layout (header/content/footer pattern)
6. **Use theme variables** for all colors
7. **Trust the Window component** to handle chrome, resizing, dragging, z-index

Follow this structure, and your app will integrate seamlessly with Berry OS's window management system. The resize corner will be clickable, scrolling will work correctly, and windows will position themselves properly accounting for the menubar and dock.

---

## Questions or Issues?

If you encounter problems:

1. Check that your app follows the structure above
2. Inspect with DevTools to verify `pointer-events` and positioning
3. Ensure Window.module.css doesn't have `position: relative` on `.content`
4. Verify resize handle has `z-index: 100` and is a sibling to content
5. Test with Debug app first (it follows the standard structure)

Remember: **The Window component controls the chrome, your app controls the content.** Keep that separation clean, and everything works beautifully.

