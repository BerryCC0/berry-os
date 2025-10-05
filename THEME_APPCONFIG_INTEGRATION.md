# Theme System & AppConfig Integration

## How Apps Inherit the Theme System

**Answer: Apps inherit themes automatically through CSS custom properties. No AppConfig changes needed!**

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ app/page.tsx                                                 │
│   └─ ThemeProvider (sets CSS vars on document.root)         │
│       └─ Desktop                                             │
│           └─ Window (themed chrome)                          │
│               └─ YourApp.tsx                                 │
│                   └─ YourApp.module.css (uses theme vars)    │
└─────────────────────────────────────────────────────────────┘
```

### How It Works

1. **User selects theme** in System Preferences (Classic, Platinum, Dark Mode)
2. **SystemStore updates** `userPreferences.theme.theme_id`
3. **ThemeProvider re-renders**, setting new CSS custom properties:
   ```typescript
   document.documentElement.style.setProperty('--theme-text', '#FFFFFF'); // Dark Mode
   document.documentElement.style.setProperty('--theme-window-background', '#333333');
   // ... etc
   ```
4. **All apps instantly update** because their CSS uses `var(--theme-text)`
5. **No page reload** required - pure CSS magic ✨

---

## No AppConfig Changes Required

### Why?

**AppConfig.ts** is the interface between the system and apps, but **theme inheritance happens at the CSS level**, not the component level.

```typescript
// AppConfig.ts - NO THEME PROPERTIES NEEDED!
{
  id: 'calculator',
  name: 'Calculator',
  component: Calculator,
  icon: '/icons/apps/calculator.svg',
  defaultWindowSize: { width: 280, height: 420 },
  // ... other properties
  // ❌ NO: themeId: 'classic'
  // ❌ NO: themePreferences: {...}
  // ✅ Apps inherit theme automatically!
}
```

### The Window Component Handles It

Every app is wrapped in the `Window` component, which:
- Provides themed window chrome (title bar, borders, buttons)
- Sets the themed background
- Passes themed content area to your app

Your app just needs to use theme variables in its CSS!

---

## How to Make Your App Theme-Aware

### Step 1: Update CSS Module

Change from legacy variables:
```css
/* ❌ OLD WAY */
.myApp {
  background: var(--mac-gray-1);
  color: var(--mac-black);
}
```

To theme variables with fallbacks:
```css
/* ✅ NEW WAY */
.myApp {
  background: var(--theme-window-background, var(--mac-gray-1));
  color: var(--theme-text, var(--mac-black));
}
```

### Step 2: That's It!

No changes to:
- ❌ AppConfig.ts
- ❌ Your component TypeScript code
- ❌ Window component
- ❌ System store

Just CSS updates!

---

## Complete Theme Variable Reference

### Most Common Variables

```css
/* Backgrounds */
--theme-window-background       /* Main app background */
--theme-button-face            /* Buttons, inputs, cards */

/* Text */
--theme-text                   /* Primary text */
--theme-text-secondary         /* Muted/secondary text */

/* Borders */
--theme-window-border          /* Borders, dividers */

/* Interactive */
--theme-button-highlight       /* Hover state */
--theme-button-shadow          /* Pressed state */
--theme-highlight              /* Selection background */
```

### Full List

See `docs/THEME_INTEGRATION_GUIDE.md` for complete variable reference.

---

## Theme Definitions

Defined in `/src/OS/components/ThemeProvider/ThemeProvider.tsx`:

### Classic Theme
```typescript
colors: {
  windowBackground: '#DDDDDD',
  windowBorder: '#000000',
  text: '#000000',
  titleBarActive: '#000000',
  // ... etc
}
```

### Platinum Theme
```typescript
colors: {
  windowBackground: '#E0E0E0',
  windowBorder: '#666666',
  text: '#000000',
  titleBarActive: '#C0C0C0',
  // ... etc
}
```

### Dark Mode Theme
```typescript
colors: {
  windowBackground: '#333333',
  windowBorder: '#AAAAAA',
  text: '#FFFFFF',           // ✅ WHITE TEXT!
  titleBarActive: '#555555',
  // ... etc
}
```

---

## How ThemeProvider Works

```typescript
// src/OS/components/ThemeProvider/ThemeProvider.tsx
export default function ThemeProvider({ children }: ThemeProviderProps) {
  const currentThemeId = useSystemStore(
    (state) => state.userPreferences?.theme?.theme_id || 'classic'
  );
  const theme = THEMES[currentThemeId] || THEMES.classic;

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply all theme colors as CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVarName = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, String(value));
    });
    
    // Set data attribute for theme-specific CSS
    root.setAttribute('data-theme', theme.id);
  }, [theme]);

  return <>{children}</>;
}
```

**Key Points:**
1. Reads current theme from system store
2. Converts theme object to CSS custom properties
3. Sets them on `document.documentElement` (`:root`)
4. All components inherit these variables
5. Updates instantly when theme changes

---

## App Migration Checklist

### For Each App CSS Module:

- [ ] **Main container:** Use `--theme-window-background` and `--theme-text`
- [ ] **All text elements:** Use `--theme-text` (h1, h2, h3, p, span, label)
- [ ] **Secondary text:** Use `--theme-text-secondary` (hints, descriptions)
- [ ] **Buttons:** Use `--theme-button-face`, `--theme-text`, `--theme-window-border`
- [ ] **Button hover:** Use `--theme-button-highlight`
- [ ] **Button active:** Use `--theme-button-shadow`
- [ ] **Inputs:** Use `--theme-button-face`, `--theme-text`, `--theme-window-border`
- [ ] **Borders:** Use `--theme-window-border`
- [ ] **Test:** Verify in Classic, Platinum, and Dark Mode

### Migration Resources:

1. **Complete Guide:** `docs/THEME_INTEGRATION_GUIDE.md`
2. **Quick Reference:** `docs/APP_THEME_MIGRATION.md`
3. **Example App:** `src/Apps/OS/Calculator/Calculator.module.css`

---

## Testing Your App's Theme Support

### Manual Test:
1. Open your app
2. Open System Preferences → Appearance
3. Click each theme card (Classic, Platinum, Dark)
4. Watch your app update instantly
5. Verify text is readable in all themes (especially Dark Mode!)

### Dark Mode Litmus Test:
- ✅ All text should be **white** or light colored
- ✅ All backgrounds should be **dark**
- ❌ If you see black text on dark backgrounds, theme variables are missing

---

## Advanced: Per-App Theme Overrides (Future)

**Not implemented yet**, but here's how it could work in Phase 6.5+:

```typescript
// AppConfig.ts (FUTURE)
interface AppConfig {
  // ... existing properties
  
  themePreferences?: {
    // Force this theme (ignores global theme)
    forceTheme?: 'classic' | 'platinum' | 'dark';
    
    // Allow user to switch theme just for this app
    allowThemeOverride?: boolean;
    
    // Custom colors that override theme
    customColors?: {
      primary?: string;
      accent?: string;
    };
    
    // Disable certain themes
    disabledThemes?: ('classic' | 'platinum' | 'dark')[];
  };
}
```

**Example:**
```typescript
{
  id: 'my-special-app',
  name: 'My Special App',
  component: MySpecialApp,
  themePreferences: {
    forceTheme: 'dark',           // Always dark mode
    customColors: {
      accent: '#FF6B00'           // Custom orange accent
    }
  }
}
```

**But for now:** All apps should respect the global theme.

---

## FAQ

**Q: Do I need to modify AppConfig.ts to use themes?**  
A: No! Themes work through CSS custom properties automatically.

**Q: Can I add theme properties to AppConfig?**  
A: Not yet. In Phase 6.5+ we may add per-app theme overrides, but for now all apps share the global theme.

**Q: How does Window component know the theme?**  
A: It uses the same CSS custom properties in `Window.module.css`.

**Q: What if I want a different theme per app?**  
A: Not supported yet. All apps use the global theme for consistency.

**Q: Can I use theme variables in inline styles?**  
A: No, inline styles can't access CSS custom properties reliably. Use CSS modules.

**Q: How do I add a new theme variable?**  
A: Add it to `ThemeProvider.tsx` in the theme definitions, then use it in your CSS.

**Q: Do theme variables work on mobile?**  
A: Yes! CSS custom properties work everywhere.

**Q: What about Web3 apps - do they get themed too?**  
A: Yes! Camp, Auction, and all Web3 apps inherit themes just like system apps.

---

## System Flow Diagram

```
User Action: Select "Dark Mode" in System Preferences
    ↓
SystemStore updates: userPreferences.theme.theme_id = 'dark'
    ↓
ThemeProvider re-renders (watches systemStore)
    ↓
ThemeProvider applies CSS properties to document.root:
  - document.documentElement.style.setProperty('--theme-text', '#FFFFFF')
  - document.documentElement.style.setProperty('--theme-window-background', '#333333')
  - document.documentElement.setAttribute('data-theme', 'dark')
    ↓
All components using theme variables update instantly:
  - Window.module.css: background: var(--theme-window-background) → #333333
  - Calculator.module.css: color: var(--theme-text) → #FFFFFF
  - Finder.module.css: border: 1px solid var(--theme-window-border) → #AAAAAA
    ↓
Browser repaints with new colors (no page reload!)
    ↓
User sees entire OS in Dark Mode ✨
```

---

## Real-World Example: Calculator App

### Before Theme Integration
```css
/* Calculator.module.css - OLD */
.calculator {
  background: var(--mac-gray-1);  /* Always #DDDDDD */
}

.display {
  background: var(--mac-white);   /* Always #FFFFFF */
  color: var(--mac-black);        /* Always #000000 - invisible in Dark Mode! */
}

.button {
  background: var(--mac-white);
  color: var(--mac-black);
}
```

**Result:** Calculator looks the same in all themes. Dark Mode has black text on dark backgrounds = unreadable.

### After Theme Integration
```css
/* Calculator.module.css - NEW */
.calculator {
  background: var(--theme-window-background, var(--mac-gray-1));
  /* Classic: #DDDDDD, Dark: #333333 */
}

.display {
  background: var(--theme-button-face, var(--mac-white));
  color: var(--theme-text, var(--mac-black));
  /* Classic: black text, Dark: white text */
}

.button {
  background: var(--theme-button-face, var(--mac-white));
  color: var(--theme-text, var(--mac-black));
}
```

**Result:** Calculator adapts to all themes. Dark Mode has white text on dark backgrounds = perfectly readable! ✅

---

## Conclusion

### Apps Inherit Themes Through:
1. ✅ **CSS custom properties** set by ThemeProvider
2. ✅ **Window component** providing themed chrome
3. ✅ **Cascade** - all descendant elements inherit variables

### Apps Do NOT Need:
1. ❌ AppConfig theme properties
2. ❌ Theme-aware TypeScript code
3. ❌ Theme state in component
4. ❌ Manual theme detection

### Your Responsibility:
1. ✅ Use `--theme-*` variables in your CSS modules
2. ✅ Provide fallbacks for robustness
3. ✅ Test in all three themes

---

**The beauty of CSS custom properties: Change once at the root, update everywhere instantly.** 🎨

---

## Related Documentation

- **Complete Guide:** `docs/THEME_INTEGRATION_GUIDE.md`
- **Migration Help:** `docs/APP_THEME_MIGRATION.md`
- **Testing:** `THEME_TESTING_GUIDE.md`
- **Technical Details:** `THEME_FIX_SUMMARY.md`

---

**Status:** ✅ Theme system fully operational  
**Phase:** 6.5 - Advanced Customization  
**Last Updated:** Theme AppConfig Integration Documentation

