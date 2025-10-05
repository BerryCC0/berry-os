# 🎨 Expanded Theming System - Design Document

## Vision

**"Give users Mac OS 8's soul with contemporary macOS's customization power"**

Modern macOS lets users customize accent colors, highlight colors, appearance mode, and more. We'll bring that level of control to Berry OS while maintaining authentic Mac OS 8 aesthetics.

## Current State (Phase 6.5)

✅ **What We Have**:
- 3 built-in themes (Classic, Platinum, Dark)
- Theme switcher in System Preferences
- Instant theme switching (buttery smooth!)
- 15+ CSS custom properties per theme
- Wallpaper selection

❌ **What's Missing**:
- Custom accent colors
- User-created themes
- Advanced appearance options
- Theme marketplace/sharing
- Per-app themes
- Dynamic themes (time-based, etc.)

## Expanded System Architecture

### Phase 7: Advanced Theming

#### 1. **Accent Color Picker** 🎨

Let users choose a custom accent color (like macOS's blue, purple, pink, etc.)

**Implementation**:
```typescript
interface ThemeCustomization {
  baseTheme: 'classic' | 'platinum' | 'dark';
  accentColor?: string;           // Custom highlight color
  titleBarStyle?: 'pinstripe' | 'gradient' | 'solid' | 'custom';
  windowOpacity?: number;         // 0.8-1.0 for translucency
  menuBarStyle?: 'opaque' | 'translucent';
  iconStyle?: 'classic' | 'modern' | 'custom';
  fontSize?: 'small' | 'medium' | 'large';
  cornerStyle?: 'sharp' | 'rounded'; // Mac OS 8 = sharp, modern = rounded
}
```

**UI in System Preferences**:
```
[Appearance Tab]

Base Theme: ● Classic  ○ Platinum  ○ Dark

Accent Color:
┌─────────────────────────────────────┐
│ [🔵] [🟣] [🟢] [🟡] [🔴] [🟠] [Custom]│
│  Blue Purple Green Yellow Red Orange │
└─────────────────────────────────────┘

Advanced Options:
┌─────────────────────────────────────┐
│ Title Bar Style:  [Pinstripe ▼]     │
│ Window Opacity:   [████████░░] 85%  │
│ Menu Bar:         [Opaque ▼]        │
│ Icon Style:       [Classic ▼]       │
│ Font Size:        [Medium ▼]        │
│ Corner Style:     [Sharp ▼]         │
└─────────────────────────────────────┘
```

#### 2. **Custom Theme Builder** 🛠️

Advanced users can create fully custom themes

**UI Flow**:
```
System Preferences → Appearance → [Create Custom Theme] button

┌───────────────────────────────────────────────────────────┐
│ Custom Theme Editor                              [× Close] │
├───────────────────────────────────────────────────────────┤
│ Theme Name: [My Awesome Theme___________________]         │
│                                                             │
│ Base: ● Start from Classic  ○ Start from Platinum         │
│       ○ Start from Dark      ○ Start from Scratch         │
│                                                             │
│ ┌─────────────────┬─────────────────────────────────────┐ │
│ │ Category ▼      │ Preview                             │ │
│ ├─────────────────┤                                     │ │
│ │ > Windows       │  ┌──────────────────┐              │ │
│ │   - Background  │  │ My Awesome Theme │              │ │
│ │   - Borders     │  ├──────────────────┤              │ │
│ │   - Title Bars  │  │                  │              │ │
│ │ > Text          │  │  Hello, world!   │              │ │
│ │   - Primary     │  │                  │              │ │
│ │   - Secondary   │  │  [Button]        │              │ │
│ │ > Buttons       │  └──────────────────┘              │ │
│ │ > Menus         │                                     │ │
│ │ > Highlights    │  ┌────────────────────┐            │ │
│ │ > Shadows       │  │ File  Edit  View   │            │ │
│ │ > Desktop       │  ├────────────────────┤            │ │
│ └─────────────────┘                                     │ │
│                                                             │
│ Window Background: [#DDDDDD] [🎨]                         │
│ Window Border:     [#000000] [🎨]                         │
│                                                             │
│ [Export JSON]  [Import JSON]  [Save Theme]  [Apply]       │
└───────────────────────────────────────────────────────────┘
```

**Data Structure**:
```typescript
interface CustomTheme extends Theme {
  id: string;
  name: string;
  description: string;
  author?: string;
  createdAt?: number;
  isCustom: true;
  basedOn?: 'classic' | 'platinum' | 'dark';
  colors: {
    // Complete color palette
    windowBackground: string;
    windowBorder: string;
    windowBorderInactive: string;
    titleBarActive: string;
    titleBarInactive: string;
    titleBarText: string;
    titleBarTextInactive: string;
    text: string;
    textSecondary: string;
    highlight: string;
    highlightText: string;
    shadow: string;
    buttonFace: string;
    buttonHighlight: string;
    buttonShadow: string;
    menuBackground: string;
    menuText: string;
    menuHighlight: string;
    desktopBackground: string;
    // Additional modern options
    scrollbarTrack?: string;
    scrollbarThumb?: string;
    linkColor?: string;
    errorColor?: string;
    successColor?: string;
    warningColor?: string;
  };
  patterns: {
    titleBarActive: 'pinstripe' | 'gradient' | 'solid' | 'custom';
    titleBarInactive: 'solid' | 'gradient-light' | 'custom';
    windowTexture: 'none' | 'subtle' | 'linen' | 'carbon' | 'custom';
    desktopPattern?: string; // URL to pattern image
  };
  effects?: {
    windowShadow?: boolean;
    windowBlur?: boolean; // Modern translucency
    menuBarBlur?: boolean;
    animations?: boolean;
    transitionSpeed?: 'slow' | 'normal' | 'fast';
  };
}
```

#### 3. **Expanded Built-in Themes** 📦

Add more themes inspired by classic Mac OS versions:

**New Themes**:

1. **"Bondi Blue"** (iMac G3 nostalgia)
   - Translucent windows with blue tint
   - Rounded corners
   - Aqua-inspired buttons

2. **"Graphite"** (Mac OS 9 professional)
   - Grayscale everything
   - Clean, professional look
   - Subtle gradients

3. **"Tangerine"** (Colorful, fun)
   - Orange/yellow warm tones
   - Perfect for Nouns DAO branding
   - Playful but professional

4. **"Midnight"** (True dark mode)
   - Pure black backgrounds
   - OLED-friendly
   - Neon accent colors

5. **"Retro Terminal"** (Hacker aesthetic)
   - Green text on black
   - Monospace everywhere
   - CRT scanline effects

6. **"Cotton Candy"** (Light pastel)
   - Soft pinks and blues
   - Dreamy aesthetic
   - Perfect for artists

7. **"Tokyo Night"** (Modern dark)
   - Purple/blue cyberpunk vibes
   - Popular with developers
   - High contrast

8. **"Nord"** (Arctic blue)
   - Cool blues and grays
   - Scandinavian minimalism
   - Easy on eyes

**Implementation**:
```typescript
// src/OS/components/ThemeProvider/themes/index.ts

export const BUILT_IN_THEMES: Record<string, Theme> = {
  classic: { /* existing */ },
  platinum: { /* existing */ },
  dark: { /* existing */ },
  
  bondiBl: {
    id: 'bondiBlue',
    name: 'Bondi Blue',
    description: 'iMac G3 nostalgia - translucent and playful',
    colors: {
      windowBackground: 'rgba(200, 230, 255, 0.85)',
      windowBorder: '#0088CC',
      titleBarActive: '#0099DD',
      titleBarText: '#FFFFFF',
      text: '#003366',
      highlight: '#00AAFF',
      // ... full palette
    },
    patterns: {
      titleBarActive: 'gradient',
      titleBarInactive: 'gradient-light',
      windowTexture: 'subtle',
    },
    effects: {
      windowBlur: true,
      windowShadow: true,
      transitionSpeed: 'normal',
    },
  },
  
  graphite: {
    id: 'graphite',
    name: 'Graphite',
    description: 'Mac OS 9 professional grayscale',
    colors: {
      windowBackground: '#D0D0D0',
      windowBorder: '#666666',
      titleBarActive: '#888888',
      titleBarText: '#FFFFFF',
      text: '#000000',
      highlight: '#999999',
      // ... all grays
    },
    patterns: {
      titleBarActive: 'gradient',
      titleBarInactive: 'solid',
      windowTexture: 'none',
    },
  },
  
  tangerine: {
    id: 'tangerine',
    name: 'Tangerine',
    description: 'Warm and welcoming - perfect for Nouns',
    colors: {
      windowBackground: '#FFF5E6',
      windowBorder: '#FF8C00',
      titleBarActive: '#FF9500',
      titleBarText: '#FFFFFF',
      text: '#4A2C00',
      highlight: '#FF6600',
      desktopBackground: '#FFE4B5',
      // Nouns DAO vibes
    },
    patterns: {
      titleBarActive: 'solid',
      titleBarInactive: 'solid',
      windowTexture: 'subtle',
    },
  },
  
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'True black for OLED displays',
    colors: {
      windowBackground: '#000000',
      windowBorder: '#111111',
      titleBarActive: '#000000',
      titleBarText: '#FFFFFF',
      text: '#EEEEEE',
      highlight: '#00FF88', // Neon green
      menuBackground: '#000000',
      // Pure blacks throughout
    },
    patterns: {
      titleBarActive: 'solid',
      titleBarInactive: 'solid',
      windowTexture: 'none',
    },
  },
  
  retroTerminal: {
    id: 'retroTerminal',
    name: 'Retro Terminal',
    description: 'Green phosphor CRT aesthetic',
    colors: {
      windowBackground: '#000000',
      windowBorder: '#00FF00',
      titleBarActive: '#001100',
      titleBarText: '#00FF00',
      text: '#00FF00',
      highlight: '#00FF00',
      menuBackground: '#000000',
      menuText: '#00FF00',
      // Monochrome green
    },
    patterns: {
      titleBarActive: 'solid',
      titleBarInactive: 'solid',
      windowTexture: 'scanlines', // CRT effect
    },
    effects: {
      textGlow: true, // CSS text-shadow for glow effect
    },
  },
  
  cottonCandy: {
    id: 'cottonCandy',
    name: 'Cotton Candy',
    description: 'Soft pastels for a dreamy desktop',
    colors: {
      windowBackground: '#FFF0F5',
      windowBorder: '#FFB6C1',
      titleBarActive: '#FFB6E1',
      titleBarText: '#8B4789',
      text: '#4A4A4A',
      highlight: '#DDA0DD',
      desktopBackground: '#E0BBE4',
      // Pastel pinks and purples
    },
    patterns: {
      titleBarActive: 'gradient',
      titleBarInactive: 'gradient-light',
      windowTexture: 'subtle',
    },
  },
  
  tokyoNight: {
    id: 'tokyoNight',
    name: 'Tokyo Night',
    description: 'Cyberpunk developer favorite',
    colors: {
      windowBackground: '#1A1B26',
      windowBorder: '#7AA2F7',
      titleBarActive: '#7AA2F7',
      titleBarText: '#C0CAF5',
      text: '#C0CAF5',
      highlight: '#BB9AF7',
      menuBackground: '#16161E',
      menuText: '#C0CAF5',
      desktopBackground: '#1A1B26',
      // Tokyo Night color scheme
    },
    patterns: {
      titleBarActive: 'gradient',
      titleBarInactive: 'solid',
      windowTexture: 'none',
    },
  },
  
  nord: {
    id: 'nord',
    name: 'Nord',
    description: 'Arctic-inspired cool blues',
    colors: {
      windowBackground: '#ECEFF4',
      windowBorder: '#5E81AC',
      titleBarActive: '#5E81AC',
      titleBarText: '#ECEFF4',
      text: '#2E3440',
      highlight: '#88C0D0',
      menuBackground: '#ECEFF4',
      menuText: '#2E3440',
      desktopBackground: '#D8DEE9',
      // Nord color palette
    },
    patterns: {
      titleBarActive: 'solid',
      titleBarInactive: 'solid',
      windowTexture: 'none',
    },
  },
};
```

#### 4. **Theme Marketplace** 🏪 (Phase 8)

Let users share and download community themes

**Features**:
- Browse themes by category (Dark, Light, Colorful, Minimal, etc.)
- Preview themes before applying
- Rate and favorite themes
- Download theme JSON files
- Upload your own themes (wallet-gated)
- Theme of the week/month featured
- Search and filter

**UI**:
```
System Preferences → Appearance → [Browse Themes] button

┌───────────────────────────────────────────────────────────┐
│ Theme Marketplace                            [Search: ___]│
├───────────────────────────────────────────────────────────┤
│ Categories: [All] [Dark] [Light] [Colorful] [Minimal]    │
│             [Retro] [Modern] [Nouns] [Community]         │
├───────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │ Midnight │ │ Bondi Bl │ │ Graphite │ │ Tangerine│     │
│ │ ⭐ 4.8   │ │ ⭐ 4.9   │ │ ⭐ 4.7   │ │ ⭐ 5.0   │     │
│ │ by Berry │ │ by Berry │ │ by Berry │ │ by Berry │     │
│ │ [Apply]  │ │ [Apply]  │ │ [Apply]  │ │ [Apply]  │     │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                             │
│ Community Themes:                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │ Vaporwave│ │ Cyberpunk│ │ Lavender │ │ Forest   │     │
│ │ ⭐ 4.6   │ │ ⭐ 4.5   │ │ ⭐ 4.8   │ │ ⭐ 4.9   │     │
│ │ by 0x... │ │ by nouns │ │ by alice │ │ by bob   │     │
│ │ [Preview]│ │ [Preview]│ │ [Preview]│ │ [Preview]│     │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                  [Load More]│
└───────────────────────────────────────────────────────────┘
```

**Backend**:
```typescript
// Database schema for theme marketplace
CREATE TABLE community_themes (
  id SERIAL PRIMARY KEY,
  theme_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  author_wallet VARCHAR(66) NOT NULL,
  theme_data JSONB NOT NULL,
  preview_image TEXT,
  downloads INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2),
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  tags TEXT[]
);

CREATE TABLE theme_ratings (
  id SERIAL PRIMARY KEY,
  theme_id VARCHAR(50) REFERENCES community_themes(theme_id),
  wallet_address VARCHAR(66) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(theme_id, wallet_address)
);
```

#### 5. **Dynamic Themes** ⏰ (Phase 8+)

Themes that change automatically

**Types**:

1. **Time-Based Themes**:
   - Light theme during day
   - Dark theme at night
   - Custom schedule

2. **System-Based**:
   - Follow system dark mode
   - Match OS theme

3. **Activity-Based**:
   - Work theme during work hours
   - Fun theme on weekends
   - Focus mode theme

4. **Seasonal Themes**:
   - Spring: Pastel colors
   - Summer: Bright and vibrant
   - Fall: Warm oranges/browns
   - Winter: Cool blues/whites

**UI**:
```
System Preferences → Appearance → [Auto Switch] tab

Dynamic Theme:
● Manual (always use selected theme)
○ Time-Based
  Light theme:  [Classic ▼]     from [6:00 AM]
  Dark theme:   [Midnight ▼]    from [8:00 PM]
  
○ Follow System
  Match macOS/Windows/Linux appearance
  
○ Scheduled
  Monday-Friday 9am-5pm:  [Graphite ▼] (work)
  Evenings & Weekends:    [Tangerine ▼] (fun)
  
○ Seasonal
  Automatically change themes with the seasons
```

#### 6. **Per-App Themes** 🎯 (Advanced)

Different themes for different apps

**Use Case**:
- Code editor in dark mode
- Notes app in light mode
- Media apps in black mode

**Implementation**:
```typescript
interface AppThemeOverride {
  appId: string;
  themeId: string;
  overrideColors?: Partial<Theme['colors']>;
}

interface UserPreferences {
  // ... existing
  appThemeOverrides?: AppThemeOverride[];
}

// In app window component
const getAppTheme = (appId: string) => {
  const override = userPreferences?.appThemeOverrides?.find(
    o => o.appId === appId
  );
  return override ? THEMES[override.themeId] : THEMES[activeTheme];
};
```

## Implementation Roadmap

### Phase 7.1: Accent Color Picker (1-2 days)
- [ ] Add accent color picker to System Preferences
- [ ] Update theme system to support accent color override
- [ ] Add 8 preset accent colors (Blue, Purple, Green, Yellow, Red, Orange, Pink, Teal)
- [ ] Add custom color picker (HSL selector)
- [ ] Update CSS custom properties to use accent color
- [ ] Save accent preference to database

### Phase 7.2: Advanced Options (1-2 days)
- [ ] Add title bar style selector
- [ ] Add window opacity slider
- [ ] Add menu bar style selector
- [ ] Add font size selector
- [ ] Add corner style toggle
- [ ] Update window components to respect options

### Phase 7.3: Expanded Built-in Themes (2-3 days)
- [ ] Create 8 new built-in themes
- [ ] Design and implement each theme's complete color palette
- [ ] Add special effects (blur, glow, scanlines, etc.)
- [ ] Create theme preview thumbnails
- [ ] Add theme descriptions and metadata

### Phase 7.4: Custom Theme Builder (3-4 days)
- [ ] Create Custom Theme Editor UI
- [ ] Add live preview panel
- [ ] Add color pickers for all theme properties
- [ ] Add pattern/texture selectors
- [ ] Add import/export JSON functionality
- [ ] Save custom themes to database
- [ ] Load and apply custom themes

### Phase 8: Theme Marketplace (5-7 days)
- [ ] Create theme marketplace database schema
- [ ] Build theme browser UI
- [ ] Add theme upload functionality (wallet-gated)
- [ ] Add theme preview/apply functionality
- [ ] Add rating and review system
- [ ] Add search and filtering
- [ ] Add featured/trending sections
- [ ] Implement moderation system

### Phase 8+: Dynamic & Per-App Themes (3-4 days)
- [ ] Add time-based theme switching
- [ ] Add system theme detection
- [ ] Add scheduled themes
- [ ] Add seasonal themes
- [ ] Add per-app theme overrides
- [ ] Add transition animations between themes

## Database Schema Updates

```sql
-- Custom themes table
CREATE TABLE custom_themes (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(66) REFERENCES users(wallet_address) ON DELETE CASCADE,
  theme_id VARCHAR(50) NOT NULL,
  theme_name VARCHAR(100) NOT NULL,
  theme_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, theme_id)
);

-- Theme preferences expansion
ALTER TABLE theme_preferences ADD COLUMN accent_color VARCHAR(7);
ALTER TABLE theme_preferences ADD COLUMN title_bar_style VARCHAR(20);
ALTER TABLE theme_preferences ADD COLUMN window_opacity DECIMAL(3,2) DEFAULT 1.0;
ALTER TABLE theme_preferences ADD COLUMN menu_bar_style VARCHAR(20);
ALTER TABLE theme_preferences ADD COLUMN icon_style VARCHAR(20);
ALTER TABLE theme_preferences ADD COLUMN corner_style VARCHAR(20);
ALTER TABLE theme_preferences ADD COLUMN dynamic_theme_enabled BOOLEAN DEFAULT false;
ALTER TABLE theme_preferences ADD COLUMN dynamic_theme_type VARCHAR(50);
ALTER TABLE theme_preferences ADD COLUMN dynamic_theme_config JSONB;

-- App-specific theme overrides
CREATE TABLE app_theme_overrides (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(66) REFERENCES users(wallet_address) ON DELETE CASCADE,
  app_id VARCHAR(50) NOT NULL,
  theme_id VARCHAR(50) NOT NULL,
  override_colors JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, app_id)
);
```

## Staying True to Mac OS 8

### ✅ Keep Mac OS 8 Soul

1. **No blur/glassmorphism on Classic theme** - Only modern themes get modern effects
2. **Pixel-perfect option** - Toggle for pure Mac OS 8 pixel rendering
3. **Classic patterns** - Pinstripe, stippled desktop, etc. remain authentic
4. **Chicago font** - Always available, never removed
5. **1-pixel borders** - Sharp, crisp Mac OS 8 chrome
6. **Mac OS 8 sounds** - System beeps and sounds

### 🎨 Add Contemporary Power

1. **Color freedom** - Let users go wild with colors
2. **Modern effects** - Optional blur, shadows, gradients
3. **Animations** - Smooth transitions (opt-in)
4. **Accessibility** - High contrast, large text, reduced motion
5. **Personalization** - Deep customization without losing authenticity

## Technical Considerations

### Performance
- Custom themes stored as JSON (minimal overhead)
- CSS custom properties update instantly
- Theme preview uses cached thumbnails
- Marketplace themes lazy-loaded

### Accessibility
- All themes must pass WCAG AA contrast ratios
- High contrast mode available
- Color blind friendly themes
- Reduced motion option

### Security
- Theme JSON sanitization
- No arbitrary CSS injection
- Wallet-gated theme uploads
- Moderation for marketplace themes

## Success Metrics

- **Adoption**: % of users who customize beyond default themes
- **Engagement**: Average time spent in theme customization
- **Community**: Number of themes created and shared
- **Retention**: Do custom themes increase user retention?

---

**Result**: Users get **deep customization power** rivaling modern macOS, while Berry OS keeps its authentic Mac OS 8 charm! 🎨✨

