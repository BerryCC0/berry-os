# Theme Integration Guide for Apps

**How to make your Berry OS apps fully theme-aware**

---

## Overview

All apps in Berry OS should inherit the active theme (Classic, Platinum, Dark Mode, etc.) automatically. This guide shows you how to properly integrate the theme system into your app.

## The Theme System Architecture

```
app/page.tsx
  └─ ThemeProvider (sets CSS custom properties)
      └─ Desktop
          └─ Window (themed chrome)
              └─ YourApp (should inherit theme)
```

### CSS Custom Properties (The Magic)

The `ThemeProvider` component dynamically sets CSS custom properties on `document.documentElement` based on the active theme:

```css
:root {
  --theme-window-background: #DDDDDD;  /* Light gray in Classic */
  --theme-text: #000000;                /* Black in Classic */
  --theme-window-border: #000000;       /* Black borders */
  /* ... and many more */
}
```

When the user switches themes, these variables update instantly, and all apps automatically re-style.

---

## Step-by-Step: Making Your App Theme-Aware

### Step 1: App CSS Module Structure

Every app should follow this pattern:

```css
/* YourApp.module.css */

.yourApp {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  /* ✅ USE THEME VARIABLES with fallbacks */
  background: var(--theme-window-background, var(--mac-gray-1));
  color: var(--theme-text, var(--mac-black));
  
  /* ❌ DON'T use only legacy variables */
  /* background: var(--mac-gray-1); */
  /* color: var(--mac-black); */
}
```

### Step 2: Common Theme Variables

Here are the most commonly used theme variables for apps:

#### Backgrounds
```css
--theme-window-background      /* Main app background */
--theme-button-face            /* Button backgrounds, input fields */
--theme-menu-background        /* Dropdown menus, popups */
```

#### Text
```css
--theme-text                   /* Primary text color */
--theme-text-secondary         /* Secondary/muted text */
--theme-title-bar-text         /* Title bar text (if custom) */
```

#### Borders & Structure
```css
--theme-window-border          /* Borders, dividers, outlines */
--theme-window-border-inactive /* Inactive/subtle borders */
```

#### Interactive Elements
```css
--theme-highlight              /* Selection/highlight background */
--theme-highlight-text         /* Text on highlighted background */
--theme-button-highlight       /* Button hover state */
--theme-button-shadow          /* Button shadow/pressed state */
```

#### Menus
```css
--theme-menu-background        /* Menu/dropdown background */
--theme-menu-text              /* Menu text */
--theme-menu-highlight         /* Menu hover/selection */
```

### Step 3: Fallback Pattern (Critical!)

Always provide fallbacks for robustness:

```css
.element {
  /* Pattern: var(--theme-*, var(--legacy-*, hardcoded)) */
  background: var(--theme-window-background, var(--mac-gray-1, #DDDDDD));
  color: var(--theme-text, var(--mac-black, #000000));
  border: 1px solid var(--theme-window-border, var(--mac-black, #000000));
}
```

**Why three levels?**
1. **Theme variable** - Primary, set by ThemeProvider
2. **Legacy variable** - Backup from globals.css
3. **Hardcoded** - Last resort fallback

### Step 4: Update All Text Elements

Ensure all text elements inherit theme color:

```css
.yourApp h1,
.yourApp h2,
.yourApp h3,
.yourApp h4,
.yourApp p,
.yourApp span,
.yourApp label {
  color: var(--theme-text, var(--mac-black));
}

/* Secondary text (descriptions, hints) */
.yourApp .description,
.yourApp .hint {
  color: var(--theme-text-secondary, var(--mac-gray-3));
}
```

### Step 5: Buttons & Interactive Elements

```css
.button {
  background: var(--theme-button-face, var(--mac-white));
  color: var(--theme-text, var(--mac-black));
  border: 1px solid var(--theme-window-border, var(--mac-black));
}

.button:hover {
  background: var(--theme-button-highlight, var(--mac-gray-5));
}

.button:active {
  background: var(--theme-button-shadow, var(--mac-gray-1));
  border-style: inset;
}
```

### Step 6: Input Fields

```css
.input,
.textarea,
.select {
  background: var(--theme-button-face, var(--mac-white));
  color: var(--theme-text, var(--mac-black));
  border: 1px solid var(--theme-window-border, var(--mac-black));
}

.input::placeholder {
  color: var(--theme-text-secondary, var(--mac-gray-3));
}

.input:focus {
  outline: 2px solid var(--theme-highlight, var(--mac-black));
}
```

---

## Complete Example: Calculator App

### Before (Legacy Variables Only)
```css
/* ❌ BAD: Only uses legacy variables */
.calculator {
  background: var(--mac-gray-1);
}

.display {
  background: var(--mac-white);
  color: var(--mac-black);
  border: 1px solid var(--mac-black);
}

.button {
  background: var(--mac-white);
  color: var(--mac-black);
  border: 1px solid var(--mac-black);
}
```

### After (Theme-Aware)
```css
/* ✅ GOOD: Uses theme variables with fallbacks */
.calculator {
  background: var(--theme-window-background, var(--mac-gray-1));
  color: var(--theme-text, var(--mac-black));
}

.display {
  background: var(--theme-button-face, var(--mac-white));
  color: var(--theme-text, var(--mac-black));
  border: 1px solid var(--theme-window-border, var(--mac-black));
  border-style: inset;
}

.displayValue {
  color: var(--theme-text, var(--mac-black));
}

.button {
  background: var(--theme-button-face, var(--mac-white));
  color: var(--theme-text, var(--mac-black));
  border: 1px solid var(--theme-window-border, var(--mac-black));
}

.button:hover {
  background: var(--theme-button-highlight, var(--mac-gray-5));
}

.button:active {
  background: var(--theme-button-shadow, var(--mac-gray-1));
}
```

---

## AppConfig Integration

### No Changes Needed in AppConfig.ts!

The beautiful thing: **AppConfig.ts doesn't need any theme-related properties**. The theme system works automatically through:

1. **ThemeProvider** wraps the entire app in `app/page.tsx`
2. **CSS custom properties** cascade down to all components
3. **Window component** provides themed chrome
4. **Apps** inherit theme through CSS variables

### Optional: Theme Preferences in AppConfig (Future)

If you want apps to override themes or specify preferences:

```typescript
interface AppConfig {
  // ... existing properties
  
  // Optional theme overrides (Phase 6.5+)
  themePreferences?: {
    preferredTheme?: 'classic' | 'platinum' | 'dark';
    allowThemeSwitch?: boolean;
    customColors?: {
      primary?: string;
      secondary?: string;
    };
  };
}
```

**But for now:** All apps should respect the global theme, no overrides needed.

---

## Testing Your Theme Integration

### Manual Testing Checklist

1. **Open your app**
2. **Open System Preferences** (Berry menu → System Preferences)
3. **Switch to each theme:**
   - Classic
   - Platinum  
   - Dark Mode
4. **Verify for EACH theme:**
   - [ ] Text is readable (not black on black)
   - [ ] Backgrounds use theme colors
   - [ ] Buttons are visible and themed
   - [ ] Borders use theme colors
   - [ ] Input fields are readable
   - [ ] No hardcoded colors that clash

### Dark Mode Specific Tests

**Critical:** Dark Mode uses `--theme-text: #FFFFFF` (white)

Check your app in Dark Mode:
- [ ] All text is white or light colored
- [ ] All backgrounds are dark
- [ ] No black text on dark backgrounds
- [ ] Buttons are visible with proper contrast
- [ ] Input fields have light text

### Quick Test Component

Create a test div to see theme variables:

```tsx
<div style={{
  background: 'var(--theme-window-background)',
  color: 'var(--theme-text)',
  padding: '20px',
  border: '1px solid var(--theme-window-border)'
}}>
  <h3>Theme Test</h3>
  <p>If you can read this in all themes, your app is properly themed!</p>
  <button style={{
    background: 'var(--theme-button-face)',
    color: 'var(--theme-text)',
    border: '1px solid var(--theme-window-border)',
    padding: '8px 16px'
  }}>
    Test Button
  </button>
</div>
```

If this looks good in all three themes, your app will too!

---

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Hardcoded Colors
```css
.element {
  background: #DDDDDD;  /* ❌ Will never change with theme */
  color: #000000;       /* ❌ Black text in Dark Mode = invisible */
}
```

✅ **Solution:**
```css
.element {
  background: var(--theme-window-background, #DDDDDD);
  color: var(--theme-text, #000000);
}
```

---

### ❌ Pitfall 2: Only Legacy Variables
```css
.element {
  background: var(--mac-white);  /* ❌ Doesn't change with theme */
  color: var(--mac-black);       /* ❌ Same in all themes */
}
```

✅ **Solution:**
```css
.element {
  background: var(--theme-button-face, var(--mac-white));
  color: var(--theme-text, var(--mac-black));
}
```

---

### ❌ Pitfall 3: Missing Text Color Inheritance
```css
.container {
  background: var(--theme-window-background);
  /* ❌ Forgot to set text color */
}

.container h3 {
  /* ❌ Will inherit from parent, might be wrong */
}
```

✅ **Solution:**
```css
.container {
  background: var(--theme-window-background);
  color: var(--theme-text);  /* ✅ Explicitly set */
}

.container h3 {
  /* ✅ Now inherits correct color */
}

/* Or be explicit: */
.container h3 {
  color: var(--theme-text);
}
```

---

### ❌ Pitfall 4: Inline Styles
```tsx
<div style={{ color: '#000000' }}>  {/* ❌ Inline styles can't use theme */}
  Text
</div>
```

✅ **Solution:**
```tsx
<div className={styles.text}>  {/* ✅ Use CSS modules */}
  Text
</div>
```
```css
.text {
  color: var(--theme-text);
}
```

---

## Migration Checklist

Converting an existing app to be theme-aware:

### Phase 1: Find & Replace
- [ ] Find all `var(--mac-white)` → Replace with `var(--theme-button-face, var(--mac-white))`
- [ ] Find all `var(--mac-black)` in colors → Replace with `var(--theme-text, var(--mac-black))`
- [ ] Find all `var(--mac-black)` in borders → Replace with `var(--theme-window-border, var(--mac-black))`
- [ ] Find all `var(--mac-gray-1)` → Replace with `var(--theme-window-background, var(--mac-gray-1))`

### Phase 2: Add Explicit Text Colors
- [ ] Add `color: var(--theme-text)` to main container
- [ ] Add color to all h1, h2, h3, h4, p, span, label elements
- [ ] Add `color: var(--theme-text-secondary)` to description/hint text

### Phase 3: Update Interactive Elements
- [ ] Buttons: background, color, hover states
- [ ] Inputs: background, color, border, placeholder, focus
- [ ] Selects/dropdowns: background, color, border
- [ ] Links: color, hover states

### Phase 4: Test
- [ ] Test in Classic theme
- [ ] Test in Platinum theme
- [ ] Test in Dark Mode (especially text readability)
- [ ] Test theme switching (should update instantly)
- [ ] Test on mobile if applicable

---

## Advanced: Theme-Specific Styles

Sometimes you need theme-specific behavior (like title bar patterns):

```css
/* Base style */
.element {
  background: var(--theme-window-background);
}

/* Classic-specific pinstripes */
[data-theme="classic"] .element {
  background: repeating-linear-gradient(
    90deg,
    #000 0px,
    #000 1px,
    #fff 1px,
    #fff 2px
  );
}

/* Platinum-specific gradient */
[data-theme="platinum"] .element {
  background: linear-gradient(180deg, #CCCCCC 0%, #999999 100%);
}

/* Dark mode specific */
[data-theme="dark"] .element {
  background: #1A1A1A;
}
```

The `data-theme` attribute is set by `ThemeProvider` on `document.documentElement`.

---

## Complete Theme Variable Reference

### Backgrounds
```css
--theme-window-background       /* Main window/app background */
--theme-button-face            /* Buttons, inputs, cards */
--theme-menu-background        /* Menus, dropdowns, popovers */
--theme-desktop-background     /* Desktop background (rarely needed in apps) */
```

### Text
```css
--theme-text                   /* Primary text */
--theme-text-secondary         /* Muted/secondary text */
--theme-title-bar-text         /* Active title bar text */
--theme-title-bar-text-inactive /* Inactive title bar text */
--theme-menu-text              /* Menu text */
--theme-highlight-text         /* Text on highlighted background */
```

### Borders & Lines
```css
--theme-window-border          /* Primary borders */
--theme-window-border-inactive /* Subtle/inactive borders */
```

### Title Bars (rarely needed in app content)
```css
--theme-title-bar-active       /* Active window title bar */
--theme-title-bar-inactive     /* Inactive window title bar */
```

### Interactive States
```css
--theme-highlight              /* Selection background */
--theme-button-highlight       /* Button hover background */
--theme-button-shadow          /* Button pressed/shadow */
--theme-shadow                 /* General shadows */
--theme-menu-highlight         /* Menu hover/selection */
```

---

## FAQ

**Q: Do I need to modify AppConfig.ts to use themes?**  
A: No! Themes work automatically through CSS custom properties.

**Q: Can my app override the global theme?**  
A: Not currently. All apps should respect the user's chosen theme. (Future: per-app overrides in Phase 6.5+)

**Q: What if I need a color that's not in the theme?**  
A: Use theme variables for structure (backgrounds, text, borders), but you can add accent colors for branding. Example: A green "success" button can be green, but its text should still use `--theme-text`.

**Q: Do inline styles work with themes?**  
A: No. Use CSS modules with theme variables.

**Q: How do I test theme integration?**  
A: Open System Preferences → Appearance → Switch between Classic, Platinum, and Dark Mode. Your app should look good in all three.

**Q: My text is invisible in Dark Mode!**  
A: You're using hardcoded `#000000` or `var(--mac-black)` instead of `var(--theme-text)`. Update all text colors.

---

## Next Steps

1. **Update existing apps** to use theme variables (see Migration Checklist)
2. **Test each app** in all three themes
3. **Document theme usage** in your app's README
4. **Report issues** if theme system doesn't cover your use case

---

**Last Updated:** Phase 6.5 - Theme System  
**Status:** Theme system fully operational ✅  
**Related Docs:** `THEME_FIX_SUMMARY.md`, `THEME_TESTING_GUIDE.md`

