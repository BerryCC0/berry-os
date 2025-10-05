# System Preferences Guide

**Status:** ✅ **COMPLETE - Ready to Use!**  
**Phase:** 6.5 - Theme System & OS Customization

---

## 🎨 What's New

### System Preferences App
A full-featured settings panel for customizing Berry OS!

**Access it from:**
- Berry menu (  icon) → "System Preferences..."
- Or launch directly from Desktop (if you add it to desktop icons)

---

## 🎯 Features

### ✅ Appearance Tab
- **Theme Selection** - Choose from 3 built-in themes:
  - **Classic** - Original Mac OS 8 look
  - **Platinum** - Mac OS 8.5+ modern appearance (coming soon)
  - **Dark Mode** - Easy on the eyes (coming soon)

- **Wallpaper Selection** - 4 beautiful wallpapers:
  - Classic (stippled pattern)
  - Clouds (sky with clouds)
  - Abstract (purple geometric)
  - Gradient (orange-red gradient)

### ✅ Desktop Tab
- Icon arrangement settings (free-form enabled)
- Grid spacing options (coming soon)
- Icon size controls (coming soon)

### ✅ Dock Tab
- View pinned applications
- Reorder/manage dock apps (coming soon)
- Dock position settings (coming soon)

### ✅ System Tab
- System information
- Performance settings (coming soon)
- Wallet connection status

---

## 🚀 How to Use

### 1. Open System Preferences

```
1. Click Berry icon (top-left)
2. Click "System Preferences..."
3. Window opens with tabbed interface
```

### 2. Change Wallpaper

```
1. Open System Preferences
2. Stay in "Appearance" tab
3. Scroll to "Desktop Wallpaper"
4. Click any wallpaper thumbnail
5. Desktop background changes instantly!
6. Saved automatically (if wallet connected)
```

### 3. Switch Themes (Coming Soon)

```
Currently only Classic theme is active.
Platinum and Dark Mode are being finalized.
```

### 4. View Current Settings

```
Navigate between tabs:
- 🎨 Appearance - Visual customization
- 🖥️ Desktop - Icon settings
- 📌 Dock - Dock configuration
- ⚙️ System - System info & settings
```

---

## 💾 Persistence

### With Wallet Connected ✅
- All changes save automatically
- Persists across sessions
- Different wallets = different settings

### Without Wallet ⚠️
- Changes work during session
- Resets on page refresh
- Connect wallet to save permanently

**Notice displays:** "Connect your wallet to save preferences across sessions"

---

## 🎨 Available Themes

### 1. Classic (Current Default)
```
- Black & white pinstripe title bars
- Light gray windows
- Traditional Mac OS 8 aesthetic
```

### 2. Platinum (Coming Soon)
```
- Gradient title bars
- Modern Mac OS 8.5+ look
- Smoother, more polished appearance
```

### 3. Dark Mode (Coming Soon)
```
- Dark backgrounds
- Inverted color scheme
- Easy on the eyes for night use
```

---

## 🖼️ Available Wallpapers

### 1. Classic ✅
Stippled gray pattern - the iconic Mac OS desktop

### 2. Clouds ✅
Sky blue with white fluffy clouds

### 3. Abstract ✅
Purple/blue geometric shapes and gradients

### 4. Gradient ✅
Smooth orange-to-red gradient

---

## 🔧 Technical Details

### App Structure
```
/src/Apps/OS/SystemPreferences/
├── SystemPreferences.tsx      # Main component
└── SystemPreferences.module.css  # Styles
```

### Integration Points
- **AppConfig.ts** - Registered as `system-preferences`
- **MenuBar.tsx** - Launches from Berry menu
- **systemStore.ts** - Uses `setWallpaper()`, `updateThemePreference()`
- **persistence.ts** - Saves to database automatically

### State Management
```typescript
// Reading current settings
const wallpaper = useSystemStore((state) => state.wallpaper);
const userPreferences = useSystemStore((state) => state.userPreferences);
const connectedWallet = useSystemStore((state) => state.connectedWallet);

// Changing settings
const setWallpaper = useSystemStore((state) => state.setWallpaper);
const updateThemePreference = useSystemStore((state) => state.updateThemePreference);
const saveUserPreferences = useSystemStore((state) => state.saveUserPreferences);
```

---

## 📊 Database Schema

Settings are saved to these tables:
- `theme_preferences` - Theme, wallpaper, colors
- `desktop_icons` - Icon positions
- `dock_preferences` - Dock settings
- `system_preferences` - System options

All keyed by `wallet_address` for per-user customization.

---

## 🎯 Quick Test

### Test Wallpaper Change:
```bash
1. Open http://localhost:3000
2. Connect wallet
3. Berry menu → System Preferences
4. Click different wallpaper thumbnails
5. See desktop background change!
6. Refresh page → wallpaper persists ✅
```

### Test Theme Change (when available):
```bash
1. Open System Preferences
2. Appearance tab
3. Click different theme preview
4. UI theme changes instantly
5. Persists across sessions
```

---

## 🚧 Coming Soon

### Phase 6.5+ Features:
- ✨ **Active theme switching** (Platinum, Dark Mode)
- 🎨 **Custom theme creator** (pick your own colors)
- 🖼️ **Custom wallpaper upload** (via IPFS)
- 📏 **Icon size selection** (small, medium, large)
- 📍 **Dock position** (bottom, left, right)
- ⚡ **Animation speed** controls
- 🔊 **Sound effects** toggle
- 🌍 **Font selection** (Chicago, Geneva, custom)

---

## 🎓 For Developers

### Adding a New Theme

1. **Update themes array** in `SystemPreferences.tsx`:
```typescript
const themes = [
  { id: 'classic', name: 'Classic', description: '...' },
  { id: 'your-theme', name: 'Your Theme', description: '...' },
];
```

2. **Add CSS preview** in `SystemPreferences.module.css`:
```css
.theme-your-theme .previewTitleBar {
  background: your-custom-style;
}
```

3. **Implement theme application** (Phase 6.5):
```typescript
// Apply theme to global CSS variables
document.documentElement.style.setProperty('--theme-color', value);
```

### Adding a New Wallpaper

1. **Add wallpaper file** to `/public/filesystem/System/Desktop Pictures/`

2. **Update wallpapers array**:
```typescript
const wallpapers = [
  { id: 'your-wallpaper', name: 'Your Wallpaper', path: '/path/to/file.svg' },
];
```

3. That's it! It'll show up and be selectable immediately.

---

## ✅ Success Checklist

System Preferences is working if:

- [x] Appears in Berry menu
- [x] Opens in window
- [x] Shows 4 tabs
- [x] Wallpapers are clickable
- [x] Wallpaper changes desktop background
- [x] Shows wallet connection status
- [x] Saves changes (with wallet)
- [x] Persists across page refreshes

---

## 🎉 What Users Can Do NOW

✅ **Change desktop wallpaper** (4 options)  
✅ **See current theme** (Classic active)  
✅ **View system info** (version, wallet)  
✅ **Preview future features** (labeled "Coming Soon")  
✅ **Save preferences** (with wallet)  

---

**Built:** Phase 6.5  
**Status:** Production Ready  
**UI:** Mac OS 8 authentic  
**Persistence:** Full database integration  

**Next:** Implement Platinum & Dark themes, custom colors, and advanced customization!

🚀 **System Preferences is live! Try changing your wallpaper!**

