# App Theme Migration Guide

**Quick reference for updating apps to be theme-aware**

---

## Find & Replace Patterns

Use these patterns to quickly update your app's CSS module to support themes:

### Pattern 1: Backgrounds

**Find:**
```css
background: var(--mac-white);
```

**Replace:**
```css
background: var(--theme-button-face, var(--mac-white));
```

---

**Find:**
```css
background: var(--mac-gray-1);
```

**Replace:**
```css
background: var(--theme-window-background, var(--mac-gray-1));
```

---

### Pattern 2: Text Colors

**Find:**
```css
color: var(--mac-black);
```

**Replace:**
```css
color: var(--theme-text, var(--mac-black));
```

---

**Find:**
```css
color: var(--mac-gray-3);
```

**Replace:**
```css
color: var(--theme-text-secondary, var(--mac-gray-3));
```

---

### Pattern 3: Borders

**Find:**
```css
border: 1px solid var(--mac-black);
```

**Replace:**
```css
border: 1px solid var(--theme-window-border, var(--mac-black));
```

---

### Pattern 4: Hover States

**Find:**
```css
.button:hover {
  background: var(--mac-gray-5);
}
```

**Replace:**
```css
.button:hover {
  background: var(--theme-button-highlight, var(--mac-gray-5));
}
```

---

### Pattern 5: Active/Pressed States

**Find:**
```css
.button:active {
  background: var(--mac-gray-1);
}
```

**Replace:**
```css
.button:active {
  background: var(--theme-button-shadow, var(--mac-gray-1));
}
```

---

## Complete Examples

### Calculator Button Migration

**Before:**
```css
.button {
  background: var(--mac-white);
  border: 1px solid var(--mac-black);
  color: var(--mac-black);
}

.button:hover {
  background: var(--mac-gray-5);
}

.button:active {
  background: var(--mac-gray-1);
}
```

**After:**
```css
.button {
  background: var(--theme-button-face, var(--mac-white));
  border: 1px solid var(--theme-window-border, var(--mac-black));
  color: var(--theme-text, var(--mac-black));
}

.button:hover {
  background: var(--theme-button-highlight, var(--mac-gray-5));
}

.button:active {
  background: var(--theme-button-shadow, var(--mac-gray-1));
}
```

---

### Form Input Migration

**Before:**
```css
.input {
  background: var(--mac-white);
  border: 1px solid var(--mac-black);
  color: var(--mac-black);
}

.input::placeholder {
  color: var(--mac-gray-3);
}

.input:focus {
  outline: 2px solid var(--mac-black);
}
```

**After:**
```css
.input {
  background: var(--theme-button-face, var(--mac-white));
  border: 1px solid var(--theme-window-border, var(--mac-black));
  color: var(--theme-text, var(--mac-black));
}

.input::placeholder {
  color: var(--theme-text-secondary, var(--mac-gray-3));
}

.input:focus {
  outline: 2px solid var(--theme-highlight, var(--mac-black));
}
```

---

### App Container Migration

**Before:**
```css
.myApp {
  width: 100%;
  height: 100%;
  background: var(--mac-gray-1);
}

.myApp h3 {
  /* No explicit color */
}

.myApp p {
  /* No explicit color */
}
```

**After:**
```css
.myApp {
  width: 100%;
  height: 100%;
  background: var(--theme-window-background, var(--mac-gray-1));
  color: var(--theme-text, var(--mac-black));
}

.myApp h3 {
  color: var(--theme-text, var(--mac-black));
}

.myApp p {
  color: var(--theme-text, var(--mac-black));
}
```

---

## Variable Mapping Quick Reference

| Legacy Variable | Theme Variable | Use Case |
|----------------|----------------|----------|
| `--mac-white` | `--theme-button-face` | Buttons, inputs, cards |
| `--mac-gray-1` | `--theme-window-background` | App container, window background |
| `--mac-gray-5` | `--theme-button-highlight` | Hover states |
| `--mac-black` (text) | `--theme-text` | Primary text |
| `--mac-black` (border) | `--theme-window-border` | Borders, dividers |
| `--mac-gray-3` | `--theme-text-secondary` | Secondary/muted text |
| No equivalent | `--theme-highlight` | Selection background |
| No equivalent | `--theme-menu-background` | Menu/dropdown background |
| No equivalent | `--theme-menu-text` | Menu text |
| No equivalent | `--theme-menu-highlight` | Menu hover |

---

## Testing After Migration

1. **Start dev server:** `npm run dev`
2. **Open your app**
3. **Open System Preferences** → Appearance tab
4. **Test each theme:**
   - Classic
   - Platinum
   - Dark Mode
5. **Verify:**
   - [ ] Text is readable in all themes
   - [ ] Backgrounds use theme colors
   - [ ] Buttons are visible and themed
   - [ ] Input fields work in all themes
   - [ ] No visual glitches when switching themes

---

## Automated Migration Script (Future)

Coming soon: A Node.js script to automatically migrate CSS files:

```bash
npm run migrate:theme -- src/Apps/MyApp/MyApp.module.css
```

This will:
- Find all legacy variables
- Replace with theme variables
- Add fallbacks
- Generate a migration report

---

## Apps Updated So Far

- [x] Window component
- [x] MenuBar component
- [x] SystemPreferences app
- [x] Calculator app (example)
- [ ] Finder app
- [ ] MediaViewer app
- [ ] TextEditor app
- [ ] Berry app
- [ ] Debug app
- [ ] Camp app
- [ ] Auction app

---

## Need Help?

1. Check `THEME_INTEGRATION_GUIDE.md` for comprehensive docs
2. Look at `Calculator.module.css` as a reference implementation
3. Test in Dark Mode first - it reveals missing theme variables
4. Use browser DevTools to inspect computed CSS variables

---

**Status:** In Progress  
**Goal:** All apps fully theme-aware by end of Phase 6.5

