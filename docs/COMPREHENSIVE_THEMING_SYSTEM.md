# Comprehensive Theming System - Design & Implementation Plan

## Executive Summary

This document outlines a complete overhaul of Berry OS's theming system to make **every UI element** customizable through theme selection and color pickers. The goal is to provide Mac OS-level customization with wallet-based persistence.

---

## Current State Analysis

### ✅ What's Working Well

1. **Foundation Architecture**
   - Zustand-based state management (`systemStore` + `preferencesStore`)
   - CSS custom properties (`--theme-*` variables) in `globals.css`
   - Wallet-based persistence via Neon Postgres
   - Instant theme switching (synchronous updates)
   - ThemeProvider applying theme colors to `:root`

2. **Existing Theme Coverage**
   - Window backgrounds, borders, title bars
   - Text colors (primary, secondary)
   - Highlight/selection colors
   - Button face, highlight, shadow
   - Menu background, text, highlight
   - Desktop background

3. **UI Components Using Themes**
   - Window chrome (title bar, borders, controls)
   - MenuBar
   - Button (default, primary, cancel variants)
   - ScrollBar (track, thumb, arrows)
   - Select/TextInput (partial)

### ❌ Gaps & Issues

1. **Incomplete Theme Type Definitions**
   - Current `Theme` interface in `/src/OS/types/theme.ts` has only 19 color properties
   - Missing colors for: checkboxes, radios, sliders, progress bars, dialogs, tooltips, badges, status bars, context menus, tabs, dividers, icons, focus states, disabled states
   - No support for interactive state colors (hover, active, pressed, focused)

2. **Inconsistent CSS Variable Usage**
   - Some components use theme vars: `var(--theme-window-background)`
   - Others use legacy vars: `var(--mac-white)`, `var(--mac-gray-1)`
   - Many use hardcoded colors: `#DDDDDD`, `#888888`, `#000000`
   - Example: `Select.module.css` line 22 has hardcoded `#888888` borders

3. **Limited ThemeBuilder UI**
   - Current `ThemeBuilder` only exposes 7 colors:
     - windowBackground, windowBorder, titleBarActive, titleBarInactive, text, highlight, shadow
   - Missing controls for: inputs, buttons, scrollbars, dialogs, badges, notifications, etc.

4. **Database Schema Limitations**
   - `theme_preferences` table only stores:
     - `theme_id`, `wallpaper_url`, `accent_color`
     - Basic customization: `title_bar_style`, `window_opacity`, `corner_style`, `font_size`
   - No storage for per-color customization (e.g., custom button colors, custom input backgrounds)

5. **Components Not Using Theme Variables**
   - **Select**: Uses hardcoded borders (`#888888`) and grays
   - **TextInput**: Uses hardcoded borders and backgrounds
   - **Checkbox**: Not reviewed yet
   - **Radio**: Not reviewed yet
   - **Slider**: Not reviewed yet
   - **ProgressBar**: Not reviewed yet
   - **Dialog**: Not reviewed yet
   - **Tooltip**: Not reviewed yet
   - **Badge**: Not reviewed yet
   - **ContextMenu**: Not reviewed yet
   - **Alert**: Not reviewed yet
   - **StatusBar**: Not reviewed yet
   - **Dock**: Not reviewed yet
   - **Desktop**: Partially themed

---

## Design Goals

### 1. Complete Themeability
Every visual element should be customizable:
- **Colors**: Background, foreground, borders, shadows, gradients
- **Interactive States**: Default, hover, active, focus, disabled
- **Typography**: Font families, sizes, weights (already partially done)
- **Effects**: Opacity, corner radius, patterns (already partially done)

### 2. Mac OS Fidelity
- Maintain authentic Mac OS 8 aesthetic by default
- Allow users to modernize (rounded corners, translucency) or personalize (Nouns themes, custom colors)
- Ensure themes respect Mac OS design principles (contrast, readability, affordance)

### 3. User Experience
- **Instant Feedback**: Theme changes apply immediately without flicker
- **Intuitive Controls**: Color pickers grouped logically (Windows, Text, Buttons, etc.)
- **Presets**: Built-in themes (Classic, Platinum, Dark, Nounish, Tangerine, etc.)
- **Persistence**: All customizations save to database, restore on login

### 4. Developer Experience
- **Single Source of Truth**: All colors defined in theme type
- **CSS Variables**: Every component uses `var(--theme-*)` consistently
- **No Hardcoded Colors**: Zero hex codes or RGB values in component styles
- **Backward Compatibility**: Legacy `--mac-*` variables map to theme vars

---

## Comprehensive Theme Schema

### Theme Type Definition

```typescript
// /src/OS/types/theme.ts

export interface ThemeColors {
  // ==================== Windows ====================
  windowBackground: string;
  windowBorder: string;
  windowBorderInactive: string;
  windowShadow: string;
  
  // ==================== Title Bars ====================
  titleBarActive: string;
  titleBarInactive: string;
  titleBarText: string;
  titleBarTextInactive: string;
  titleBarShadow: string;
  
  // ==================== Text ====================
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverted: string; // For dark backgrounds
  
  // ==================== Highlights & Selection ====================
  highlight: string;
  highlightText: string;
  highlightHover: string;
  selectionBackground: string;
  selectionText: string;
  
  // ==================== Buttons ====================
  buttonBackground: string;
  buttonBackgroundHover: string;
  buttonBackgroundActive: string;
  buttonBackgroundDisabled: string;
  buttonBorder: string;
  buttonBorderHover: string;
  buttonText: string;
  buttonTextDisabled: string;
  buttonShadow: string;
  buttonHighlight: string; // For 3D effect
  
  // Primary buttons (OK, Save, etc.)
  buttonPrimaryBackground: string;
  buttonPrimaryBackgroundHover: string;
  buttonPrimaryBackgroundActive: string;
  buttonPrimaryText: string;
  buttonPrimaryBorder: string;
  
  // Cancel buttons
  buttonCancelBackground: string;
  buttonCancelBackgroundHover: string;
  buttonCancelText: string;
  
  // ==================== Inputs ====================
  inputBackground: string;
  inputBackgroundFocused: string;
  inputBackgroundDisabled: string;
  inputBorder: string;
  inputBorderFocused: string;
  inputBorderDisabled: string;
  inputText: string;
  inputTextDisabled: string;
  inputPlaceholder: string;
  inputShadow: string; // Inset shadow for depth
  
  // ==================== Menus ====================
  menuBackground: string;
  menuBorder: string;
  menuText: string;
  menuTextDisabled: string;
  menuHighlight: string;
  menuHighlightText: string;
  menuSeparator: string;
  menuShadow: string;
  
  // Menu bar specific
  menuBarBackground: string;
  menuBarBorder: string;
  menuBarText: string;
  menuBarHighlight: string;
  
  // ==================== Scrollbars ====================
  scrollbarBackground: string;
  scrollbarBorder: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
  scrollbarThumbActive: string;
  scrollbarArrowBackground: string;
  scrollbarArrowBackgroundHover: string;
  scrollbarArrowBackgroundActive: string;
  scrollbarArrowIcon: string;
  
  // ==================== Checkboxes & Radios ====================
  checkboxBackground: string;
  checkboxBackgroundChecked: string;
  checkboxBackgroundDisabled: string;
  checkboxBorder: string;
  checkboxBorderChecked: string;
  checkboxBorderFocused: string;
  checkboxCheck: string; // Checkmark color
  
  radioBackground: string;
  radioBackgroundChecked: string;
  radioBackgroundDisabled: string;
  radioBorder: string;
  radioBorderChecked: string;
  radioBorderFocused: string;
  radioDot: string; // Inner dot color
  
  // ==================== Sliders ====================
  sliderTrack: string;
  sliderTrackFilled: string;
  sliderThumb: string;
  sliderThumbHover: string;
  sliderThumbActive: string;
  sliderBorder: string;
  
  // ==================== Progress Bars ====================
  progressBackground: string;
  progressFill: string;
  progressBorder: string;
  progressStripe: string; // For striped pattern
  
  // ==================== Dialogs & Alerts ====================
  dialogBackground: string;
  dialogBorder: string;
  dialogShadow: string;
  dialogHeaderBackground: string;
  dialogHeaderText: string;
  
  alertInfoBackground: string;
  alertInfoBorder: string;
  alertInfoText: string;
  
  alertWarningBackground: string;
  alertWarningBorder: string;
  alertWarningText: string;
  
  alertErrorBackground: string;
  alertErrorBorder: string;
  alertErrorText: string;
  
  alertSuccessBackground: string;
  alertSuccessBorder: string;
  alertSuccessText: string;
  
  // ==================== Tooltips ====================
  tooltipBackground: string;
  tooltipBorder: string;
  tooltipText: string;
  tooltipShadow: string;
  
  // ==================== Badges & Notifications ====================
  badgeBackground: string;
  badgeBorder: string;
  badgeText: string;
  
  notificationBackground: string;
  notificationBorder: string;
  notificationText: string;
  notificationIconInfo: string;
  notificationIconWarning: string;
  notificationIconError: string;
  notificationIconSuccess: string;
  
  // ==================== Context Menus ====================
  contextMenuBackground: string;
  contextMenuBorder: string;
  contextMenuText: string;
  contextMenuTextDisabled: string;
  contextMenuHighlight: string;
  contextMenuHighlightText: string;
  contextMenuSeparator: string;
  
  // ==================== Status Bar ====================
  statusBarBackground: string;
  statusBarBorder: string;
  statusBarText: string;
  statusBarIconDefault: string;
  statusBarIconActive: string;
  
  // ==================== Dock ====================
  dockBackground: string;
  dockBorder: string;
  dockShadow: string;
  dockIconBorder: string;
  dockIconBorderHover: string;
  dockIconBorderActive: string;
  dockIndicator: string; // Running app indicator
  
  // ==================== Desktop ====================
  desktopBackground: string;
  desktopPattern: string; // Pattern overlay color
  desktopIconText: string;
  desktopIconTextBackground: string;
  desktopIconTextBackgroundSelected: string;
  desktopIconBorder: string;
  desktopIconBorderSelected: string;
  
  // ==================== Tabs ====================
  tabBackground: string;
  tabBackgroundHover: string;
  tabBackgroundActive: string;
  tabBorder: string;
  tabText: string;
  tabTextActive: string;
  
  // ==================== Dividers ====================
  dividerColor: string;
  
  // ==================== Focus States ====================
  focusOutline: string;
  focusOutlineOffset: string;
  
  // ==================== Shadows ====================
  shadowLight: string;
  shadowMedium: string;
  shadowHeavy: string;
  
  // ==================== Miscellaneous ====================
  overlayBackground: string; // For modals, dropdowns
  loadingSpinnerPrimary: string;
  loadingSpinnerSecondary: string;
  errorColor: string;
  warningColor: string;
  successColor: string;
  infoColor: string;
}

export interface ThemePatterns {
  titleBarActive: 'pinstripe' | 'gradient' | 'solid' | 'gradient-light';
  titleBarInactive: 'pinstripe' | 'gradient' | 'solid' | 'gradient-light';
  windowTexture: 'none' | 'subtle' | 'strong';
  desktopPattern: 'stippled' | 'none' | 'custom';
  scrollbarStyle: 'classic' | 'modern' | 'minimal';
}

export interface ThemeCustomization {
  cornerStyle: 'sharp' | 'rounded';
  windowOpacity: number; // 0.85 - 1.0
  menuBarStyle: 'opaque' | 'translucent';
  fontSize: 'small' | 'medium' | 'large';
  scrollbarWidth: 'thin' | 'normal' | 'thick';
  scrollbarArrowStyle: 'classic' | 'modern' | 'none';
  scrollbarAutoHide: boolean;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  patterns: ThemePatterns;
  // Customization defaults (user can override)
  defaultCustomization?: Partial<ThemeCustomization>;
}

export type ThemeId = 'classic' | 'platinum' | 'dark' | 'nounish' | 'tangerine' | 'custom' | string;
```

### Built-in Themes

We'll ship with 5 polished themes:

1. **Classic** - Authentic Mac OS 8 (black/white, pinstripes)
2. **Platinum** - Mac OS 8.5+ (gradient blues, modern)
3. **Dark Mode** - Easy on the eyes (grays, blue accents)
4. **Nounish** - Nouns DAO colors (red, black, cream)
5. **Tangerine** - Vibrant and playful (oranges, yellows)

---

## Implementation Plan

### Phase 1: Type Definitions & CSS Variables ✅

**Goal**: Establish the comprehensive type system and CSS variable infrastructure.

#### Tasks

1. **Update `/src/OS/types/theme.ts`**
   - Replace current `Theme` interface with comprehensive `ThemeColors` (150+ properties)
   - Add `ThemePatterns`, `ThemeCustomization` interfaces
   - Export complete `Theme` type

2. **Update `/app/styles/globals.css`**
   - Add all new `--theme-*` CSS variables (150+ vars)
   - Group by category (windows, buttons, inputs, menus, etc.)
   - Map legacy `--mac-*` vars to theme vars for backward compatibility:
     ```css
     --mac-white: var(--theme-window-background);
     --mac-black: var(--theme-window-border);
     --mac-gray-1: var(--theme-button-background);
     /* etc. */
     ```

3. **Create 5 Built-in Theme Objects**
   - Define complete color palettes in `ThemeProvider.tsx` or separate file
   - Ensure each theme has all 150+ color properties
   - Test themes for contrast/readability

#### Deliverables
- ✅ `theme.ts` with complete type definitions
- ✅ `globals.css` with 150+ CSS custom properties
- ✅ 5 complete theme definitions (Classic, Platinum, Dark, Nounish, Tangerine)

---

### Phase 2: ThemeProvider Updates ✅

**Goal**: Make ThemeProvider apply all theme properties to CSS custom properties.

#### Tasks

1. **Update `/src/OS/components/Theme/ThemeProvider/ThemeProvider.tsx`**
   - Import comprehensive `Theme` type
   - Import all 5 built-in themes
   - In `useEffect`, iterate through ALL theme colors and apply to `:root`:
     ```typescript
     Object.entries(theme.colors).forEach(([key, value]) => {
       const cssVarName = `--theme-${camelToKebab(key)}`;
       root.style.setProperty(cssVarName, value);
     });
     ```
   - Apply pattern data attributes:
     ```typescript
     root.setAttribute('data-theme', theme.id);
     root.setAttribute('data-titlebar-pattern', theme.patterns.titleBarActive);
     root.setAttribute('data-desktop-pattern', theme.patterns.desktopPattern);
     root.setAttribute('data-scrollbar-style', theme.patterns.scrollbarStyle);
     ```

2. **Handle Accent Color Overrides**
   - If `accentColor` is set, override specific vars:
     ```typescript
     if (accentColor) {
       root.style.setProperty('--theme-highlight', accentColor);
       root.style.setProperty('--theme-menu-highlight', accentColor);
       root.style.setProperty('--theme-button-primary-background', accentColor);
       // Generate hover/active variations
       root.style.setProperty('--theme-highlight-hover', lighten(accentColor, 10));
       root.style.setProperty('--theme-highlight-active', darken(accentColor, 10));
     }
     ```

3. **Handle Theme Customization Overrides**
   - Apply `themeCustomization` values:
     ```typescript
     if (themeCustomization.cornerStyle) {
       const radius = themeCustomization.cornerStyle === 'rounded' ? '4px' : '0px';
       root.style.setProperty('--theme-corner-radius', radius);
       root.style.setProperty('--theme-window-corner-radius', radius === '0px' ? '0px' : '6px');
     }
     if (themeCustomization.windowOpacity !== undefined) {
       root.style.setProperty('--theme-window-opacity', String(themeCustomization.windowOpacity));
     }
     // etc. for all customization options
     ```

#### Deliverables
- ✅ `ThemeProvider.tsx` applying all theme properties synchronously
- ✅ Helper functions for color manipulation (`lighten`, `darken`, `hexToRgb`)
- ✅ Tested instant theme switching with no flicker

---

### Phase 3: Component Migration ✅

**Goal**: Update ALL UI components to use theme CSS variables exclusively.

#### Priority Order (by visibility & usage)

1. **High Priority** (user-facing, frequently used)
   - Window chrome (already mostly done ✅)
   - MenuBar (already mostly done ✅)
   - Button (already mostly done ✅)
   - ScrollBar (already mostly done ✅)
   - TextInput ⚠️ (uses hardcoded borders)
   - Select ⚠️ (uses hardcoded borders)
   - Checkbox ❌
   - Radio ❌
   - Dialog ❌
   - Desktop ⚠️ (partially themed)

2. **Medium Priority**
   - Slider ❌
   - ProgressBar ❌
   - Alert ❌
   - Tooltip ❌
   - ContextMenu ⚠️
   - StatusBar ❌
   - Divider ⚠️

3. **Low Priority** (less visible, less used)
   - Badge ❌
   - NotificationCenter ❌
   - Dock ⚠️
   - AboutDialog ❌
   - GetInfo ❌
   - Screensaver ❌
   - LoadingScreen ❌
   - Spinner ❌

#### Migration Checklist (Per Component)

For each component's CSS module:

1. **Identify Hardcoded Colors**
   - Search for hex codes: `#[0-9A-F]{3,6}`
   - Search for RGB/RGBA: `rgb\(`, `rgba\(`
   - Search for legacy vars: `var\(--mac-`

2. **Replace with Theme Variables**
   - Background → `var(--theme-[element]-background)`
   - Border → `var(--theme-[element]-border)`
   - Text → `var(--theme-[element]-text)`
   - Hover → `var(--theme-[element]-background-hover)`
   - Active → `var(--theme-[element]-background-active)`
   - Disabled → `var(--theme-[element]-background-disabled)`

3. **Test in All Themes**
   - Switch to Classic → verify colors
   - Switch to Platinum → verify colors
   - Switch to Dark Mode → verify contrast
   - Switch to Nounish → verify colors
   - Switch to Tangerine → verify colors

4. **Verify Interactive States**
   - Hover effects work
   - Active/pressed states work
   - Focus outlines work
   - Disabled states work

#### Example Migration (TextInput)

**Before** (`TextInput.module.css`):
```css
.textInput {
  background: var(--mac-white, #FFFFFF);
  border: 1px solid var(--mac-black, #000000);
  border-top: 2px solid #888888; /* ❌ Hardcoded */
  border-left: 2px solid #888888; /* ❌ Hardcoded */
}

.textInput:focus {
  border: 2px solid var(--mac-black, #000000);
}

.textInput.disabled {
  background: var(--mac-gray-1, #DDDDDD); /* ❌ Legacy var */
  color: #888888; /* ❌ Hardcoded */
}
```

**After**:
```css
.textInput {
  background: var(--theme-input-background);
  border: 1px solid var(--theme-input-border);
  border-top: 2px solid var(--theme-input-shadow); /* ✅ Themed */
  border-left: 2px solid var(--theme-input-shadow); /* ✅ Themed */
}

.textInput:focus {
  border: 2px solid var(--theme-input-border-focused);
}

.textInput.disabled {
  background: var(--theme-input-background-disabled); /* ✅ Themed */
  color: var(--theme-input-text-disabled); /* ✅ Themed */
}
```

#### Deliverables
- ✅ All 33 UI components migrated to theme variables
- ✅ Zero hardcoded colors remaining in CSS modules
- ✅ All components tested in all 5 themes
- ✅ Interactive states (hover, active, focus, disabled) working

---

### Phase 4: ThemeBuilder UI Expansion ✅

**Goal**: Expose ALL themeable colors in the ThemeBuilder interface.

#### Current State
`ThemeBuilder.tsx` has 4 tabs:
- **Colors** (7 color pickers)
- **Patterns** (3 options)
- **Fonts** (2 options)
- **Effects** (2 checkboxes)

#### Redesign

Expand to **8 tabs** with **grouped color controls**:

1. **Colors: Windows & Chrome** (10 colors)
   - Window Background
   - Window Border
   - Window Border (Inactive)
   - Window Shadow
   - Title Bar (Active)
   - Title Bar (Inactive)
   - Title Bar Text
   - Title Bar Text (Inactive)
   - Title Bar Shadow
   - Focus Outline

2. **Colors: Text & Highlights** (10 colors)
   - Text Primary
   - Text Secondary
   - Text Tertiary
   - Text Disabled
   - Text Inverted
   - Highlight
   - Highlight Text
   - Highlight Hover
   - Selection Background
   - Selection Text

3. **Colors: Buttons** (15 colors)
   - Default Button Background
   - Default Button Hover
   - Default Button Active
   - Default Button Disabled
   - Default Button Border
   - Default Button Text
   - Primary Button Background
   - Primary Button Hover
   - Primary Button Active
   - Primary Button Text
   - Primary Button Border
   - Cancel Button Background
   - Cancel Button Hover
   - Cancel Button Text
   - Button Shadow

4. **Colors: Inputs & Forms** (10 colors)
   - Input Background
   - Input Background (Focused)
   - Input Background (Disabled)
   - Input Border
   - Input Border (Focused)
   - Input Text
   - Input Text (Disabled)
   - Input Placeholder
   - Input Shadow
   - Checkbox/Radio Check Color

5. **Colors: Menus & Navigation** (12 colors)
   - Menu Background
   - Menu Border
   - Menu Text
   - Menu Text (Disabled)
   - Menu Highlight
   - Menu Highlight Text
   - Menu Separator
   - Menu Bar Background
   - Menu Bar Text
   - Menu Bar Highlight
   - Context Menu Highlight
   - Status Bar Background

6. **Colors: Scrollbars & Controls** (10 colors)
   - Scrollbar Background
   - Scrollbar Border
   - Scrollbar Thumb
   - Scrollbar Thumb (Hover)
   - Scrollbar Thumb (Active)
   - Scrollbar Arrow Background
   - Scrollbar Arrow (Hover)
   - Slider Track
   - Slider Track (Filled)
   - Slider Thumb

7. **Colors: Dialogs & Feedback** (16 colors)
   - Dialog Background
   - Dialog Border
   - Dialog Header Background
   - Dialog Header Text
   - Alert Info (Background, Border, Text)
   - Alert Warning (Background, Border, Text)
   - Alert Error (Background, Border, Text)
   - Alert Success (Background, Border, Text)
   - Tooltip Background
   - Tooltip Border
   - Tooltip Text
   - Badge Background

8. **Patterns & Effects** (existing + new)
   - Title Bar Pattern (pinstripe, gradient, solid)
   - Window Opacity slider
   - Corner Style (sharp, rounded)
   - Menu Bar Style (opaque, translucent)
   - Font Size (small, medium, large)
   - Scrollbar Width (thin, normal, thick)
   - Scrollbar Arrow Style (classic, modern, none)
   - Scrollbar Auto-hide checkbox
   - Desktop Pattern (stippled, none, custom)
   - Scrollbar Style (classic, modern, minimal)

#### UI Design

```
┌─────────────────────────────────────────────────────────┐
│ Theme Builder                                           │
├─────────────────────────────────────────────────────────┤
│ Tabs: [Windows] [Text] [Buttons] [Inputs] [Menus]      │
│       [Scrollbars] [Dialogs] [Patterns]                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Windows & Chrome Tab]                                 │
│                                                         │
│  Window Background:    [████████] #DDDDDD              │
│  Window Border:        [████████] #000000              │
│  Window Border (Inact):[████████] #888888              │
│  Window Shadow:        [████████] rgba(0,0,0,0.3)      │
│  Title Bar (Active):   [████████] #000000              │
│  Title Bar (Inactive): [████████] #CCCCCC              │
│  Title Bar Text:       [████████] #FFFFFF              │
│  Title Bar Text (Inac):[████████] #666666              │
│  Title Bar Shadow:     [████████] #888888              │
│  Focus Outline:        [████████] #000080              │
│                                                         │
│  [Reset to Theme Default]                               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│              [Cancel]  [Save Custom Theme]              │
└─────────────────────────────────────────────────────────┘
```

#### Features

1. **Color Pickers**
   - Use existing `ColorPicker` component
   - Support hex, RGB, RGBA input
   - Live preview (debounced updates)
   - "Reset" button per color

2. **Preset Themes**
   - Dropdown at top: "Based on: [Classic ▼]"
   - Loads preset colors, user can tweak
   - "Save as Custom Theme" button

3. **Export/Import**
   - "Export Theme" → Download JSON file
   - "Import Theme" → Upload JSON file
   - Share themes with others

4. **Live Preview**
   - As user adjusts colors, UI updates immediately
   - Show sample components (button, input, menu) in ThemeBuilder

#### Deliverables
- ✅ `ThemeBuilder.tsx` redesigned with 8 tabs
- ✅ 80+ color pickers organized logically
- ✅ "Reset to Default" per color or per tab
- ✅ "Save Custom Theme" saves to database
- ✅ "Export/Import Theme" functionality
- ✅ Live preview of changes

---

### Phase 5: Database Schema Updates ✅

**Goal**: Store comprehensive theme customizations in the database.

#### Current Schema
`theme_preferences` table has:
- `theme_id` (VARCHAR 50) - e.g., 'classic', 'platinum'
- `wallpaper_url` (VARCHAR 500)
- `accent_color` (VARCHAR 7) - Single hex color
- Basic customization: `title_bar_style`, `window_opacity`, `corner_style`, `font_size`

#### Proposed Schema

**Option 1: Flat Columns (Simple, Fast)**
Add 150+ columns to `theme_preferences` table:
```sql
ALTER TABLE theme_preferences ADD COLUMN color_window_background VARCHAR(20);
ALTER TABLE theme_preferences ADD COLUMN color_window_border VARCHAR(20);
ALTER TABLE theme_preferences ADD COLUMN color_title_bar_active VARCHAR(20);
-- ... 147 more columns
```

**Pros**: Fast queries, direct column access  
**Cons**: Wide table, schema changes require migrations

**Option 2: JSONB Column (Flexible, Clean)**
Store all custom colors in a single JSONB column:
```sql
ALTER TABLE theme_preferences ADD COLUMN custom_colors JSONB DEFAULT '{}'::JSONB;
```

Example data:
```json
{
  "windowBackground": "#DDDDDD",
  "windowBorder": "#000000",
  "titleBarActive": "#000000",
  ...
}
```

**Pros**: Flexible, no schema changes for new colors, clean  
**Cons**: Slightly slower queries, requires JSON parsing

**Recommendation**: **Option 2 (JSONB)** for flexibility

#### Updated Schema

```sql
-- Add custom colors storage
ALTER TABLE theme_preferences ADD COLUMN custom_colors JSONB DEFAULT '{}'::JSONB;

-- Add custom patterns storage
ALTER TABLE theme_preferences ADD COLUMN custom_patterns JSONB DEFAULT '{}'::JSONB;

-- Example custom_colors:
{
  "windowBackground": "#DDDDDD",
  "windowBorder": "#000000",
  "titleBarActive": "#FF0000",
  ...
}

-- Example custom_patterns:
{
  "titleBarActive": "gradient",
  "desktopPattern": "stippled",
  "scrollbarStyle": "modern"
}
```

#### Persistence Logic

1. **Loading Preferences**
   ```typescript
   // persistence.ts
   export async function loadUserPreferences(walletAddress: string) {
     const themeResult = await sql`
       SELECT theme_id, wallpaper_url, accent_color,
              custom_colors, custom_patterns,
              title_bar_style, window_opacity, corner_style, ...
       FROM theme_preferences
       WHERE wallet_address = ${walletAddress}
     `;
     
     // Merge theme colors with custom overrides
     const baseTheme = THEMES[themeResult[0].theme_id];
     const customColors = themeResult[0].custom_colors || {};
     
     return {
       theme: {
         ...baseTheme,
         colors: {
           ...baseTheme.colors,
           ...customColors, // Custom colors override theme colors
         },
       },
       ...
     };
   }
   ```

2. **Saving Custom Theme**
   ```typescript
   export async function saveCustomTheme(
     walletAddress: string,
     customColors: Partial<ThemeColors>
   ) {
     await sql`
       UPDATE theme_preferences
       SET custom_colors = ${JSON.stringify(customColors)},
           updated_at = NOW()
       WHERE wallet_address = ${walletAddress}
     `;
   }
   ```

3. **Presets vs Custom**
   - If user selects a preset theme → clear `custom_colors`, set `theme_id`
   - If user tweaks colors → keep `theme_id`, populate `custom_colors` with overrides
   - Display: "Theme: Classic (Customized)" if `custom_colors` is not empty

#### Deliverables
- ✅ `custom_colors` and `custom_patterns` JSONB columns added
- ✅ Migration script: `migrations/002_add_custom_theme_colors.sql`
- ✅ `persistence.ts` updated to load/save custom colors
- ✅ `preferencesStore.ts` updated to handle custom themes
- ✅ Tested: Load custom theme, modify, save, reload → colors persist

---

### Phase 6: System Preferences Integration ✅

**Goal**: Integrate expanded ThemeBuilder into System Preferences UI.

#### Current State
`SystemPreferences` app has "Appearance" tab with:
- Theme selector (Classic, Platinum, Dark, Nounish, Tangerine)
- Wallpaper selector
- Accent color picker (single color)
- Customization sliders (opacity, corner style, etc.)

#### Redesign

**Appearance Tab Layout**:

```
┌─────────────────────────────────────────────────────────┐
│ Appearance                                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Theme Presets                                    │  │
│  ├─────────────────────────────────────────────────┤  │
│  │ ○ Classic     ● Platinum    ○ Dark Mode         │  │
│  │ ○ Nounish     ○ Tangerine   ○ Custom            │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Wallpaper                                        │  │
│  ├─────────────────────────────────────────────────┤  │
│  │ [Classic] [Platinum] [Nouns] [Tangerine] [Cust]│  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Accent Color                                     │  │
│  ├─────────────────────────────────────────────────┤  │
│  │ [████████] #000080 (System Default)             │  │
│  │ [Reset to Theme Default]                         │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Advanced Customization                           │  │
│  ├─────────────────────────────────────────────────┤  │
│  │ [Customize Colors...] → Opens ThemeBuilder       │  │
│  │                                                  │  │
│  │ Title Bar Style:  [Pinstripe ▼]                 │  │
│  │ Window Opacity:   [████████░░] 100%             │  │
│  │ Corner Style:     [Sharp ▼]                     │  │
│  │ Font Size:        [Medium ▼]                    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  Status: ✅ Theme saved (2 seconds ago)                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**"Customize Colors..." Button**:
- Opens `ThemeBuilder` in a modal dialog
- User can tweak all 150+ colors
- "Save" applies changes, closes modal
- "Cancel" discards changes

**Theme Indicator**:
- Show "Platinum" if using preset
- Show "Platinum (Customized)" if preset + custom colors
- Show "Custom Theme" if fully custom

#### Deliverables
- ✅ `AppearanceTab.tsx` redesigned with "Customize Colors..." button
- ✅ ThemeBuilder opens in Dialog when clicked
- ✅ Theme indicator shows customization status
- ✅ All changes save immediately (debounced)
- ✅ Wallet status notice if not connected

---

### Phase 7: Testing & Polish ✅

**Goal**: Ensure theme system works flawlessly across all scenarios.

#### Test Cases

1. **Preset Themes**
   - ✅ Switch between all 5 presets
   - ✅ Verify all UI elements update correctly
   - ✅ Check contrast/readability in each theme
   - ✅ Test dark mode on OLED screens

2. **Custom Colors**
   - ✅ Customize single color → verify it updates
   - ✅ Customize multiple colors → verify all update
   - ✅ Reset single color → verify it reverts
   - ✅ Reset all colors → verify theme reverts to preset

3. **Persistence**
   - ✅ Connect wallet → load theme
   - ✅ Customize colors → disconnect → reconnect → colors persist
   - ✅ Switch themes → save → reload page → theme persists
   - ✅ Multiple tabs → change theme in one → other tabs sync (BroadcastChannel)

4. **Performance**
   - ✅ Theme switch is instant (< 50ms)
   - ✅ No flicker during theme change
   - ✅ Color picker updates are debounced (no lag)
   - ✅ Database saves are debounced (no spam)

5. **Edge Cases**
   - ✅ No wallet connected → changes persist in session
   - ✅ Database error → graceful fallback to defaults
   - ✅ Invalid custom colors → sanitize or ignore
   - ✅ Empty custom_colors JSON → use theme defaults

6. **Mobile**
   - ✅ ThemeBuilder works on mobile (tabs, pickers)
   - ✅ Color pickers are touch-friendly
   - ✅ Theme changes apply to mobile UI elements

7. **Accessibility**
   - ✅ All themes meet WCAG AA contrast ratios
   - ✅ Focus outlines visible in all themes
   - ✅ Screen reader announces theme changes
   - ✅ Keyboard navigation works in ThemeBuilder

#### Deliverables
- ✅ Test suite covering all scenarios
- ✅ Manual QA checklist completed
- ✅ Performance benchmarks (theme switch < 50ms)
- ✅ Accessibility audit passed
- ✅ Mobile testing on iOS/Android

---

### Phase 8: Documentation & Migration Guide ✅

**Goal**: Document the new theming system for developers and users.

#### Developer Documentation

Create `/docs/THEMING_SYSTEM.md`:
- Overview of theme architecture
- How to use theme variables in new components
- How to add new themeable properties
- How to create custom themes programmatically
- API reference for ThemeProvider, preferencesStore

#### User Documentation

Create `/docs/USER_THEMING_GUIDE.md`:
- How to switch themes
- How to customize colors
- How to save/export themes
- How to share themes with others
- FAQ (e.g., "Why don't my changes persist?")

#### Migration Guide

Create `/docs/THEME_MIGRATION_GUIDE.md`:
- For developers migrating old components
- Step-by-step: Replace hardcoded colors → theme vars
- Common pitfalls and solutions

#### Deliverables
- ✅ `THEMING_SYSTEM.md` (technical reference)
- ✅ `USER_THEMING_GUIDE.md` (end-user guide)
- ✅ `THEME_MIGRATION_GUIDE.md` (dev migration guide)
- ✅ Updated `claude.md` with theming guidelines

---

## Implementation Timeline

| Phase | Tasks | Estimated Time | Priority |
|-------|-------|---------------|----------|
| **Phase 1** | Type definitions & CSS variables | 2-3 hours | CRITICAL |
| **Phase 2** | ThemeProvider updates | 1-2 hours | CRITICAL |
| **Phase 3** | Component migration (33 components) | 6-8 hours | CRITICAL |
| **Phase 4** | ThemeBuilder UI expansion | 3-4 hours | HIGH |
| **Phase 5** | Database schema updates | 1-2 hours | HIGH |
| **Phase 6** | System Preferences integration | 2-3 hours | MEDIUM |
| **Phase 7** | Testing & polish | 3-4 hours | HIGH |
| **Phase 8** | Documentation | 2-3 hours | MEDIUM |
| **TOTAL** | | **20-29 hours** | |

**Recommended Order**: Phases 1 → 2 → 3 → 5 → 4 → 6 → 7 → 8

---

## Success Criteria

The theming system is complete when:

1. ✅ **Zero Hardcoded Colors** - All UI components use CSS variables exclusively
2. ✅ **150+ Themeable Properties** - Every visual element is customizable
3. ✅ **5 Built-in Themes** - Classic, Platinum, Dark, Nounish, Tangerine all complete
4. ✅ **Custom Themes** - Users can customize every color, save to database
5. ✅ **Instant Switching** - Theme changes apply immediately without flicker
6. ✅ **Wallet Persistence** - All customizations persist across sessions
7. ✅ **Export/Import** - Users can share themes via JSON
8. ✅ **Accessibility** - All themes meet WCAG AA standards
9. ✅ **Mobile Support** - ThemeBuilder works on touch devices
10. ✅ **Documentation** - Complete developer and user guides

---

## Future Enhancements (Post-MVP)

1. **Theme Marketplace**
   - Browse community-created themes
   - Upvote/download popular themes
   - Nouns DAO theme contests

2. **AI Theme Generation**
   - "Generate a theme based on this image"
   - "Make this theme warmer/cooler"
   - Accessibility auto-corrections

3. **Time-based Themes**
   - Auto-switch to dark mode at night
   - Seasonal themes
   - Per-app themes

4. **Advanced Patterns**
   - Custom title bar patterns (upload SVG)
   - Custom desktop wallpapers (IPFS)
   - Animated backgrounds

5. **Color Palette Tools**
   - Generate complementary colors
   - Contrast checker
   - Color blindness simulator

---

## Conclusion

This comprehensive theming system will position Berry OS as **the most customizable Mac OS emulator** on the web. Users will have Mac OS-level control over every visual element, with wallet-based persistence ensuring their customizations follow them across devices.

The modular architecture (types → CSS vars → components → UI → persistence) ensures maintainability and allows for future expansion without breaking changes.

**Next Steps**: Begin Phase 1 implementation after stakeholder approval.

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-07  
**Author**: Berry AI Assistant  
**Status**: Awaiting Approval

