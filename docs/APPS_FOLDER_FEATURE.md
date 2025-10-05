# Apps Folder Feature

## Overview

Added an Applications folder that dynamically lists all registered apps in Berry OS, with a dedicated button pinned to the far right of the Dock to open it.

## Implementation

### 1. Dynamic Applications Folder (`src/OS/lib/filesystem.ts`)

**Changes:**
- Made the `/Applications` folder children empty initially (no hardcoded apps)
- Added `initializeApplicationsFolder()` function that populates the Applications folder with all registered apps from `AppConfig`
- This ensures the filesystem stays in sync with the app registry automatically

**Key Function:**
```typescript
export function initializeApplicationsFolder(
  apps: Array<{ id: string; name: string; icon: string; description: string; version: string }>
)
```

### 2. System Store Integration (`src/OS/store/systemStore.ts`)

**Changes:**
- Imported `initializeApplicationsFolder` from filesystem
- Modified `initializeDesktopIcons()` to also initialize the Applications folder
- This follows **separation of concerns**: the System 7 Toolbox (systemStore) manages system-level initialization, not presentation components

**Why System Store?**
- Desktop component was getting bloated with too many responsibilities
- System store is the proper place for system-level initialization
- Keeps initialization logic centralized and reusable
- Follows the architecture principles in `claude.md`

### 3. Dock Apps Button (`src/OS/components/Dock/Dock.tsx`)

**Changes:**
- Added visual divider before the Apps button
- Added dedicated "Apps" button pinned to the far right
- Button opens Finder to `/Applications` folder
- Smart behavior:
  - If Finder is already open: focuses it and navigates to Applications
  - If Finder is closed: opens it directly to Applications folder

**Styling (`Dock.module.css`):**
- `.dockDivider` - 1px vertical line separator
- `.appsButton` - special styling with highlight on hover
- Mobile-responsive adjustments

### 4. Finder Navigation Events (`src/Apps/OS/Finder/Finder.tsx`)

**Changes:**
- Reads `initialPath` from URL state to open directly to a specific folder
- Listens for `FINDER_NAVIGATE` events to navigate programmatically
- Event-driven navigation allows Dock (or any component) to control Finder

### 5. Event System Extension (`src/OS/types/events.ts`)

**Changes:**
- Added `FINDER_NAVIGATE` event type
- Added `FinderNavigatePayload` interface with `path: string`
- Properly typed event system for Finder navigation

## User Experience

### Desktop View
1. Dock displays pinned apps on the left
2. Vertical divider separates regular apps from system items
3. "Applications" folder button on the far right with folder icon
4. Clicking Apps button:
   - Opens Finder to Applications folder
   - Shows all installed apps (OS apps + Nouns apps)
   - Double-click any app to launch it

### Mobile View
- Apps button remains on far right of dock
- Responsive touch targets (44px minimum)
- Same functionality as desktop

## Architecture Benefits

✅ **Separation of Concerns**: System initialization in system store, not Desktop component

✅ **Dynamic Sync**: Applications folder automatically stays in sync with `AppConfig`

✅ **Event-Driven**: Dock communicates with Finder via events (loose coupling)

✅ **Type-Safe**: Full TypeScript support with proper event payloads

✅ **Maintainable**: Adding new apps automatically includes them in Applications folder

## Testing Checklist

- [ ] Applications folder shows all registered apps
- [ ] Apps button visible on far right of Dock
- [ ] Clicking Apps button opens Finder to Applications
- [ ] If Finder already open, navigates to Applications
- [ ] Double-clicking apps in Applications folder launches them
- [ ] Apps folder includes: Berry, Calculator, Finder, Media Viewer, Text Editor, System Preferences, Nouns Camp, Nouns Auction
- [ ] Debug app only shows in development mode
- [ ] Mobile: Apps button remains accessible
- [ ] Theme-aware styling (Classic, Platinum, Dark Mode)

## Future Enhancements

- Add app categories/folders (Utilities, Nouns Apps, etc.)
- Search/filter apps in Finder
- Drag apps from Applications to Desktop or Dock
- App aliases/shortcuts
- Recently used apps section

