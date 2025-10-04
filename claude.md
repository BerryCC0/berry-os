# Nouns OS - Core Development Guide

> **For Berry Team & AI Assistants**
> 
> Read this entire document before beginning any implementation work.

## Project Overview

**Nouns OS** is a Mac OS 8 emulator built with modern web technologies, developed by **Berry**. This project recreates the complete classic Macintosh System 7 Finder experience while integrating Web3 functionality for blockchain connectivity and persistent user customization.

**Starting Point**: Fresh Next.js boilerplate deployed on Vercel  
**Current Status**: Active development with live user base  
**Target**: Complete Mac OS 8 emulation with Web3 integration

## Tech Stack

- **Framework**: Next.js 14+ (TypeScript, App Router)
- **Deployment**: Vercel
- **State Management**: Zustand (singleton pattern for System 7 Toolbox)
- **Styling**: CSS Modules exclusively
- **Database**: Neon (serverless Postgres for user customization & persistence)
- **Web3 Integration**: 
  - Reown's Appkit (wallet connection)
  - Apollo Client (GraphQL/Subgraph data)
  - Neynar SDK (Farcaster integration)
  - Multi-chain: EVM networks, Solana, Bitcoin
- **Analytics**: Vercel Analytics

## Project Structure

```
nouns-os/
├── app/
│   ├── layout.tsx                    # Root layout with Web3 providers
│   ├── page.tsx                      # Main emulator entry point
│   └── api/                          # API routes
│       ├── preferences/              # User preference endpoints
│       └── [...other endpoints]
│
├── system/                           # System 7 / Finder core
│   ├── Finder/                       # Finder application
│   │   ├── Finder.tsx
│   │   ├── Finder.module.css
│   │   ├── components/
│   │   └── utils/
│   ├── components/                   # System UI components
│   │   ├── Window/                   # Window chrome
│   │   ├── MenuBar/                  # Menu bar system
│   │   ├── Desktop/                  # Desktop container
│   │   ├── SystemTray/               # System tray
│   │   └── MobileNav/                # Mobile navigation
│   ├── store/
│   │   └── systemStore.ts            # Zustand System 7 Toolbox
│   ├── lib/
│   │   ├── eventBus.ts               # Event system
│   │   ├── filesystem.ts             # Virtual filesystem
│   │   ├── gestureHandler.ts         # Mobile gestures
│   │   └── windowManager.ts          # Window management utilities
│   └── types/
│       ├── system.ts                 # System-level types
│       ├── window.ts                 # Window types
│       ├── events.ts                 # Event types
│       └── gestures.ts               # Gesture types
│
├── apps/                             # User applications
│   ├── AppConfig.ts                  # App registry & interface
│   ├── MediaViewer/
│   │   ├── MediaViewer.tsx
│   │   ├── MediaViewer.module.css
│   │   ├── components/
│   │   └── utils/
│   ├── WalletManager/
│   ├── Calculator/
│   ├── AboutThisMac/
│   └── [OtherApps]/
│
├── components/                       # Shared UI components
│   └── UI/                           # Reusable UI primitives
│       ├── Button/
│       ├── ScrollBar/
│       ├── Dialog/
│       └── TouchTarget/              # Mobile touch wrapper
│
├── lib/                              # Shared utilities
│   ├── web3/                         # Web3 utilities
│   ├── persistence.ts                # Database helpers
│   └── utils.ts                      # General utilities
│
├── styles/
│   ├── globals.css                   # Mac OS 8 global styles
│   ├── mobile.css                    # Mobile adaptations
│   └── themes/                       # Theme variations
│
├── public/
│   ├── filesystem/                   # Virtual filesystem content
│   │   ├── Documents/
│   │   ├── Pictures/
│   │   ├── System/
│   │   └── Applications/
│   ├── icons/                        # App & system icons
│   └── fonts/                        # Chicago, Geneva fonts
│
└── types/
    └── global.d.ts                   # Global type declarations
```

## Architecture Layers

### Layer 1: System 7 Toolbox (Core Foundation)

**Location**: `/system/store/systemStore.ts`

The heart of Nouns OS - a Zustand singleton managing all system-level state:

**Window Management**:
- Unlimited concurrent windows
- Window state: position (x, y), size (width, height), z-index
- Window controls: close, minimize, zoom (maximize)
- Draggable windows with Mac OS chrome
- Focus management and activation
- Z-index normalization (re-normalize when >1000)

**Process Management**:
- Running applications registry
- Application lifecycle (launch, run, terminate)
- Process IDs and states
- Per-app error boundaries (one crash doesn't kill system)

**Event System** (`/system/lib/eventBus.ts`):
- Simple pub/sub pattern (not RxJS - keep it light)
- Event types: window, menu, keyboard, mouse, app lifecycle
- Typed event payloads
- Priority queue mimicking Mac OS event handling

**Desktop Management**:
- Icon positions and arrangement
- Desktop wallpaper
- Trash can functionality
- Context menus

**Menu Bar System**:
- Apple menu (About, System Preferences, Shut Down, etc.)
- Application menus (File, Edit, View, Special, etc.)
- Dynamic updates based on active application
- Keyboard shortcuts

### Layer 2: Finder & Virtual Filesystem

**Finder** (`/system/Finder/`):
- Complete Mac OS 8 Finder replication
- Desktop with draggable icons
- Window chrome: title bars, close/minimize/zoom buttons
- Hierarchical folder navigation
- Icon view, List view
- Drag-and-drop
- Double-click to open
- Right-click context menus

**Virtual Filesystem** (`/system/lib/filesystem.ts`):
- Read-only structure from `/public/filesystem/`
- Pre-populated files/folders
- File metadata (name, icon, type, size, date)
- Browsing and navigation
- NO user uploads/creation

### Layer 3: System UI Components

**Location**: `/system/components/`

**Window Component** (`/system/components/Window/`):
- Mac OS 8 window chrome
- Draggable title bar
- Resize handles
- Close/minimize/zoom buttons
- Pinstripe pattern on active windows
- CSS Modules for styling

**MenuBar Component** (`/system/components/MenuBar/`):
- Apple menu + app-specific menus
- Keyboard shortcuts
- Hover states
- Menu activation

**Desktop Component** (`/system/components/Desktop/`):
- Icon grid system
- Desktop wallpaper
- Trash can
- Right-click context menu

**MobileNav Component** (`/system/components/MobileNav/`):
- Mobile menu bar replacement
- Hamburger menu
- System tray access
- App switcher trigger

### Layer 4: Applications

**Location**: `/apps/`

**AppConfig.ts** (`/apps/AppConfig.ts`):
- **THE interface between System and Apps**
- Registers all applications
- Defines app metadata, capabilities, permissions
- Manages app initialization/teardown
- App-to-system communication protocol

**App Structure** (strict):
```
apps/
└── YourApp/
    ├── YourApp.tsx              # Main component
    ├── YourApp.module.css       # Main styles
    ├── components/              # Child components
    │   ├── Component.tsx
    │   └── Component.module.css
    └── utils/                   # Organized utilities
        ├── hooks/
        ├── types/
        ├── constants/
        └── helpers/
```

**App Metadata**:
```typescript
interface AppConfig {
  id: string;
  name: string;
  component: React.ComponentType<{ windowId: string }>;
  icon: string;                           // Path to icon
  defaultWindowSize: { width: number; height: number };
  minWindowSize?: { width: number; height: number };
  maxWindowSize?: { width: number; height: number };
  resizable: boolean;
  web3Required?: boolean;
  mobileSupport: 'full' | 'limited' | 'desktop-only';
  mobileLayout?: 'fullscreen' | 'bottom-sheet' | 'modal';
  category: 'system' | 'utility' | 'web3' | 'media' | 'productivity';
  description: string;
  version: string;
}
```

## Core Design Principles

1. **Authenticity First**: Pixel-perfect Mac OS 8 recreation
2. **Modern Under the Hood**: Next.js, TypeScript, Zustand for performance
3. **Web3 Native**: Seamless blockchain integration
4. **User Customization**: Wallet-tied personalization
5. **Shareable Experiences**: Every state is linkable
6. **Robustness**: Users can push limits - crashes are on us to fix
7. **Mobile Adaptive**: Mac OS 8 feel on touch devices

## Development Guidelines

### Separation of Concerns: Business Logic vs Presentation

**Critical Principle**: Keep business logic separate from presentation logic.

**Business Logic** (`/utils/`, `/lib/`):
- Pure TypeScript functions
- No React dependencies
- No JSX
- No UI concerns
- Fully testable in isolation
- Reusable across components

**Presentation Logic** (`.tsx` components):
- React components
- JSX/UI rendering
- User interactions
- Calls business logic functions
- Manages local UI state only

**Example Pattern**:
```typescript
// ❌ BAD: Everything mixed together
function Calculator() {
  const [display, setDisplay] = useState('0');
  
  const handleButtonClick = (value: string) => {
    // 50 lines of calculation logic mixed with UI code
    if (value === '+') {
      // calculation logic here
    }
    setDisplay(result);
  };
  
  return <div>{/* UI */}</div>;
}

// ✅ GOOD: Separated
// apps/Calculator/utils/helpers/calculate.ts
export function calculate(current: string, input: string): string {
  // Pure business logic
  // No React, no UI, just logic
  // Fully testable
}

// apps/Calculator/Calculator.tsx
function Calculator() {
  const [display, setDisplay] = useState('0');
  
  const handleButtonClick = (value: string) => {
    setDisplay(calculate(display, value));
  };
  
  return <div>{/* UI */}</div>;
}
```

**Benefits**:
- Business logic is testable without React
- Can reuse logic across components
- Easier to reason about
- TypeScript shines for business logic
- Presentation stays simple and focused

**Where Business Logic Lives**:
- `/system/lib/` - System-level utilities
- `/apps/[App]/utils/helpers/` - App-specific logic
- `/lib/` - Shared utilities

**Where Presentation Lives**:
- `.tsx` components only
- Handles rendering, user events, local UI state
- Calls business logic functions

### Type Safety
- TypeScript strictly enforced
- No `any` types - use `unknown` with type guards
- Define interfaces for all data structures
- Zustand stores fully typed
- Event payloads typed

### Component Architecture
- System components in `/system/components/`
- Shared UI primitives in `/components/UI/`
- Apps in `/apps/` - completely self-contained
- No cross-app dependencies
- Communication via System 7 Toolbox only

### State Management
- **System state**: Zustand (`/system/store/systemStore.ts`)
- **App state**: Local React state + optional persistence
- **User preferences**: Vercel Postgres (keyed by wallet address)
- **URL state**: Query params for app state serialization

### Styling (Critical)
- ❌ NO inline styles
- ❌ NO CSS-in-JS libraries (styled-components, emotion, etc.)
- ✅ CSS Modules exclusively
- ✅ Global styles only in `/styles/globals.css` for system-wide theming
- ✅ Maintain Mac OS 8 aesthetic
- ✅ Desktop-first, mobile-adaptive
- ✅ Touch targets 44px minimum on mobile

### Web3 Integration
- Providers wrapped in `app/layout.tsx`
- Reown Appkit for wallet connection
- Apollo for subgraph queries
- Neynar for Farcaster
- Multi-chain support abstracted
- Handle disconnections gracefully

## Mac OS 8 Styling Guidelines

### Global Styles (`/styles/globals.css`)

```css
:root {
  /* Classic Mac OS grayscale palette */
  --mac-black: #000000;
  --mac-white: #FFFFFF;
  --mac-gray-1: #DDDDDD;  /* Window backgrounds */
  --mac-gray-2: #888888;  /* Scrollbar tracks */
  --mac-gray-3: #555555;  /* Window borders */
  
  /* System fonts */
  --font-chicago: 'Chicago', 'Courier New', monospace;
  --font-geneva: 'Geneva', 'Helvetica', sans-serif;
  
  /* Classic patterns */
  --pattern-desktop: /* stippled desktop pattern */;
  --pattern-pinstripe: /* title bar pinstripes */;
  
  /* Window chrome */
  --titlebar-height: 19px;
  --scrollbar-width: 15px;
  --border-width: 1px;
  
  /* Mobile breakpoints */
  --mobile: 768px;
  --tablet: 1024px;
  --desktop: 1025px;
}
```

### Visual Elements
- Chicago font for system UI
- 1-pixel black borders on windows
- Pinstripe pattern on active title bars
- Classic gray scrollbars with arrow buttons
- Stippled/dithered desktop patterns
- Single-pixel resize handles

### Mobile Adaptations
```css
/* Desktop: Full Mac OS windowing */
@media (min-width: 1025px) {
  .window {
    position: absolute;
    border: 1px solid var(--mac-black);
    /* draggable, resizable, z-index stacking */
  }
}

/* Mobile: Fullscreen adapted */
@media (max-width: 768px) {
  .window {
    position: fixed;
    inset: 0;
    /* fullscreen, gesture navigation */
  }
}
```

## Deep Linking & URL Structure

**URL Schema**:
```
nouns-os.vercel.app/
nouns-os.vercel.app/?apps=Gallery,Notes
nouns-os.vercel.app/?apps=Gallery&state=eyJpZCI6MTIzfQ
```

**Strategy**:
- `apps` param: comma-separated list of open apps
- `state` param: base64-encoded JSON of app states
- No page reload (Next.js shallow routing)
- Apps implement `serializeState()` / `deserializeState()`

**Share Links**:
Apps can generate shareable URLs:
```typescript
const shareUrl = `${window.location.origin}/?apps=Gallery&state=${btoa(JSON.stringify(state))}`;
```

## User Customization & Persistence

**Customizable**:
- Desktop wallpaper
- System theme/color scheme
- Icon positions
- Window positions (optional)
- System preferences
- App-specific settings

**Storage** (Neon Postgres):
```sql
CREATE TABLE users (
  wallet_address VARCHAR(42) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE TABLE user_preferences (
  wallet_address VARCHAR(42) REFERENCES users(wallet_address),
  preference_key VARCHAR(100),
  preference_value JSONB,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (wallet_address, preference_key)
);

CREATE TABLE app_states (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) REFERENCES users(wallet_address),
  app_id VARCHAR(50),
  state_data JSONB,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, app_id)
);
```

**Setup** (Neon):
1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string to `.env.local`:
   ```
   DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
   ```
3. Install Neon serverless driver:
   ```bash
   npm install @neondatabase/serverless
   ```
4. Use with Next.js API routes or Server Components

**Data Flow**:
1. Wallet connects → fetch preferences from Neon
2. Apply to Zustand store
3. User changes → debounced save to Neon
4. Logout → preferences persist for next session

**Why Neon**:
- Serverless with auto-scaling
- Generous free tier
- Branching for development (separate DB per branch)
- Better cold start performance than Vercel Postgres
- Built-in connection pooling

## Mobile: Mac OS 8 Adapted for Touch

### Philosophy
"It should feel like using Mac OS 8 on a touchscreen Mac, not like a mobile app pretending to be Mac OS 8."

### Mobile Components

**MobileNav** (`/system/components/MobileNav/`):
- Top bar: hamburger menu + app name + settings
- Bottom dock (optional): swipe up to reveal
- Mac OS 8 aesthetic maintained

**TouchTarget** (`/components/UI/TouchTarget/`):
```typescript
interface TouchTargetProps {
  minSize?: number;        // Default: 44px
  haptic?: boolean;        // Haptic feedback
  longPress?: () => void;  // Right-click equivalent
  children: React.ReactNode;
}
```

### Gesture System (`/system/lib/gestureHandler.ts`)

| Gesture | Desktop Equivalent | Use Case |
|---------|-------------------|----------|
| Tap | Click | Select, open |
| Long Press | Right-click | Context menu |
| Swipe Left/Right | - | Navigate apps |
| Swipe Up | - | App switcher |
| Swipe Down | - | Close app, return to desktop |
| Edge Swipe | - | System navigation |

**Event Bus Integration**:
```typescript
eventBus.publish('GESTURE_TAP', { target, position });
eventBus.publish('GESTURE_LONG_PRESS', { target });
eventBus.publish('GESTURE_SWIPE_LEFT', { velocity });
```

### Mobile Layout

**App Switcher** (swipe up):
- Card-based interface
- Mac OS 8 styled thumbnails
- Horizontal scroll
- Swipe down to close

**Mobile Desktop**:
- Larger icons (88px vs 64px)
- Touch-friendly spacing
- Tap to open (no double-tap)
- Long press for context menu

**Mobile Menus**:
- Slide-out drawer
- Mac OS 8 menu styling
- Touch-optimized spacing (16px)
- Hierarchical structure

### Mobile State (`/system/store/systemStore.ts`)

```typescript
interface MobileState {
  activeAppId: string | null;      // Single app on mobile
  appHistory: string[];            // Back navigation
  dockApps: string[];              // Pinned apps
  isDockVisible: boolean;
  isMenuOpen: boolean;
  
  // Actions
  openAppMobile: (appId: string) => void;
  closeAppMobile: () => void;
  goBack: () => void;
  toggleDock: () => void;
  toggleMenu: () => void;
}
```

## Technical Considerations

### Performance
- Virtualize window rendering (many concurrent windows)
- Debounce drag/resize operations
- Lazy load apps (dynamic imports)
- React.memo and useMemo for optimization
- Virtual scrolling for long lists

### Browser Compatibility
- Target: Chrome, Firefox, Safari, Edge (modern versions)
- CSS Grid and Flexbox
- No IE11 support

### Accessibility
- Include actual Chicago/Geneva fonts via @font-face
- Keyboard navigation
- Screen reader support (where feasible)
- Focus management
- Semantic HTML
- ARIA labels

### Error Handling
- React Error Boundaries per app
- One crash doesn't kill system
- Mac OS 8 crash dialog aesthetic
- Error reporting/logging

### Event System
- Simple pub/sub (not RxJS)
- Typed event payloads
- Priority queue
- Event types: window, menu, keyboard, mouse, app lifecycle

### Window Z-Index
- Dynamic assignment on focus
- Re-normalize when >1000
- Most recent always on top

## Key Constraints

### ❌ Never
- Inline styles
- CSS-in-JS libraries
- Page reloads for app navigation
- User file uploads to filesystem
- localStorage/sessionStorage (use Zustand + Postgres)
- Direct app-to-app communication

### ✅ Always
- CSS Modules exclusively
- TypeScript for all code
- Single component + single CSS per app
- Structured utils/components directories
- Complete System 7 feature set
- Unlimited concurrent windows

## Implementation Phases

### Phase 0: Foundation ⚡ START HERE
**Goal**: Core infrastructure before any apps

1. **Install Dependencies**:
```bash
npm install zustand
npm install @reown/appkit @reown/appkit-adapter-wagmi
npm install @apollo/client graphql
npm install @neynar/nodejs-sdk
npm install @neondatabase/serverless
```

2. **Create Structure**:
- `/system/store/systemStore.ts` - Zustand store
- `/system/lib/eventBus.ts` - Event system
- `/system/lib/gestureHandler.ts` - Mobile gestures
- `/styles/globals.css` - Mac OS 8 styles
- `/system/types/` - Core type definitions

3. **Build Foundation**:
- System 7 Toolbox store
- Event bus pub/sub
- Window management utilities
- Basic UI components (Window, Button, etc.)

**Validation**: Desktop renders, can create test window

### Phase 1: About This Mac
**Goal**: Validate architecture with simplest app

- Create `/apps/AboutThisMac/`
- Register in `/apps/AppConfig.ts`
- Test window system, menu integration
- Display system info + wallet data

**Validation**: Can open from Apple menu, window works

### Phase 2: Calculator
**Goal**: Test app state and URL sharing

- Create `/apps/Calculator/`
- Implement state serialization
- Test deep linking
- Mobile touch interactions

**Validation**: Calculator works, shareable URLs work

### Phase 3: Finder
**Goal**: Core system app

- Implement virtual filesystem
- Finder with navigation
- Icon/list views
- Drag-and-drop

**Validation**: Can browse files, open folders

### Phase 4: Media Viewer
**Goal**: App-to-app interaction

- Create `/apps/MediaViewer/`
- Finder → Media Viewer integration
- View images/videos/audio
- Download functionality

**Validation**: Open files from Finder, view media

### Phase 5: Web3 Apps
**Goal**: Web3 integration

- System tray wallet UI
- NFT Gallery app
- Wallet Manager
- Subgraph queries

**Validation**: Web3 fully functional, mobile smooth

### Phase 6: Polish
**Goal**: User customization

- Vercel Postgres setup
- Wallpaper/theme selection
- Icon position persistence
- Cross-device sync

**Validation**: Customization persists across sessions

## Quick Start for AI Assistants

**When starting from fresh Next.js boilerplate:**

### Step 1: Understand the Architecture
- Read entire claude.md
- Understand System 7 Toolbox role
- Understand separation: `/system/` vs `/apps/`
- Understand AppConfig.ts as THE interface

### Step 2: Confirm Understanding
Before implementing, answer:
- What does the System 7 Toolbox manage?
- Where does AppConfig.ts live and why?
- What is the strict app directory structure?
- What styling is forbidden vs required?
- How do mobile gestures map to desktop?

### Step 3: Ask Questions
If unclear:
- "Should X be in `/system/` or `/apps/`?"
- "Is this Phase 0 or later?"
- "Mobile responsive now or later?"
- "Should this use Zustand or local state?"

### Step 4: Implement Phase 0
Build foundation before any apps. No shortcuts.

### Step 5: Validate Each Phase
Confirm with developer before proceeding.

## Example First Prompt

```
I have a fresh Next.js boilerplate. Let's start Phase 0 from claude.md.

Specifically:
1. Set up directory structure (/system/, /apps/, etc.)
2. Install dependencies
3. Create Zustand system store skeleton
4. Implement basic event bus
5. Set up globals.css with Mac OS 8 variables

Implement in order, explain decisions, ask if unclear.
After Phase 0, we'll do Phase 1: About This Mac.
```

## Common Pitfalls

1. ❌ Don't create apps before System 7 Toolbox exists
2. ❌ Don't use inline styles or CSS-in-JS
3. ❌ Don't implement features not in current phase
4. ❌ Don't skip foundational UI components
5. ❌ Don't assume - ask questions!
6. ❌ Don't use localStorage/sessionStorage
7. ❌ Don't forget mobile when building desktop
8. ❌ Don't violate app directory structure
9. ❌ Don't make breaking changes without discussion
10. ❌ Don't optimize prematurely

---

**Company**: Berry  
**Project**: Nouns OS  
**Target**: Complete Mac OS 8 Emulator with Web3  
**Stack**: Next.js + TypeScript + Zustand + CSS Modules + Neon Postgres

**Remember**: This is phased implementation. Validate at each step. Ask questions early. Follow established patterns.