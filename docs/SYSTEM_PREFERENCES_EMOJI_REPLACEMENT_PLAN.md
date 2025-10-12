# System Preferences Modal - Emoji to SVG Replacement Plan

## Overview
Replace all emojis in SystemPreferencesModal with Mac OS 8 style SVG icons to maintain visual consistency across the entire OS.

## Emoji Inventory

### Main Modal (SystemPreferencesModal.tsx)
**Category Icons (Sidebar):**
1. 🎨 - Appearance
2. 🖥️ - Desktop & Dock
3. ⚙️ - System
4. ℹ️ - About

**Placeholder:**
5. ⚙️ - System settings coming soon

### Appearance Tab (AppearanceTab.tsx)
**Section Icons:**
6. 🎨 - Themes section
7. 💎 - Built-In Themes subcategory
8. 🎨 - Custom Themes subcategory
9. 🎨 - Accent Color section
10. 🖼️ - Desktop Wallpaper section
11. ⚙️ - Advanced Options section

**Theme Actions:**
12. 🎨 - Create Theme button icon
13. ✏️ - Edit theme button
14. 📋 - Duplicate theme button
15. 💾 - Export theme button
16. 🌍 - Share publicly button
17. 🔒 - Make private button
18. 🗑️ - Delete theme button

**Status Messages:**
19. 💡 - Empty state hint
20. 🔌 - Connect wallet prompt
21. ✓ - Selected theme checkmark

**Coming Soon:**
22. 🖼️ - Wallpaper coming soon
23. 💾 - Icon sets coming soon
24. 🎭 - Sound effects coming soon

### Desktop & Dock Tab (DesktopAndDockTab.tsx)
25. 🖥️ - Section icon
26. ℹ️ - Info message

### Accent Color Picker
27. 🎨 - Custom color icon

**Total Emojis:** 27 instances (some repeated)
**Unique Emojis:** ~15

## Icon Creation Plan

### Create Preferences Icons Directory
**Location:** `/public/icons/preferences/`

**Why a separate directory?**
- These are specific to System Preferences/Settings
- Different from system-level icons (menu bar, etc.)
- Allows for themed variants if needed
- Keeps preferences UI icons organized

### Icons to Create (16 SVG files)

#### Category Icons (20x20px)
1. **appearance.svg** - 🎨 Paint palette
2. **desktop.svg** - 🖥️ Computer monitor
3. **system.svg** - ⚙️ Gear/cog
4. **info.svg** - ℹ️ Circle with 'i'

#### Action Icons (16x16px - smaller for buttons)
5. **edit.svg** - ✏️ Pencil
6. **duplicate.svg** - 📋 Overlapping squares
7. **save.svg** - 💾 Floppy disk
8. **share.svg** - 🌍 Globe/share symbol
9. **lock.svg** - 🔒 Padlock (closed)
10. **delete.svg** - 🗑️ Trash can
11. **check.svg** - ✓ Checkmark (reuse from /icons/actions/)

#### Feature Icons (18x18px)
12. **wallpaper.svg** - 🖼️ Picture frame
13. **palette.svg** - 🎨 Color palette (alternate)
14. **diamond.svg** - 💎 Diamond shape
15. **mask.svg** - 🎭 Theater mask
16. **lightbulb.svg** - 💡 Light bulb
17. **plug.svg** - 🔌 Power plug (can reuse wallet-connection concept)

## Implementation Plan

### Phase 1: Create Icons Directory & SVGs
1. Create `/public/icons/preferences/` directory
2. Design and create all 16 SVG icons
3. Maintain Mac OS 8 aesthetic (bold, simple, black on transparent)
4. Size appropriately (16-20px range)

### Phase 2: Update SystemPreferencesModal.tsx
**File:** `src/OS/components/UI/SystemPreferencesModal/SystemPreferencesModal.tsx`

**Changes:**
- Update CATEGORIES array to use SVG paths instead of emoji strings
- Update placeholder icon from emoji to img tag
- Update CSS for proper icon sizing

**Before:**
```typescript
const CATEGORIES: CategoryItem[] = [
  {
    id: 'appearance',
    label: 'Appearance',
    icon: '🎨',
    description: 'Themes, colors, fonts, and visual customization',
  },
  // ...
];
```

**After:**
```typescript
const CATEGORIES: CategoryItem[] = [
  {
    id: 'appearance',
    label: 'Appearance',
    icon: '/icons/preferences/appearance.svg',
    description: 'Themes, colors, fonts, and visual customization',
  },
  // ...
];
```

**JSX Update:**
```typescript
// Before
<span className={styles.categoryIcon}>{category.icon}</span>

// After
<img src={category.icon} alt="" className={styles.categoryIcon} />
```

### Phase 3: Update CollapsibleSection Component
**File:** `src/OS/components/UI/SystemPreferencesModal/components/CollapsibleSection.tsx`

- Update icon prop to accept SVG path
- Change from rendering string to img tag

### Phase 4: Update AppearanceTab.tsx
**File:** `src/OS/components/UI/SystemPreferencesModal/components/AppearanceTab.tsx`

**Sections to Update:**
1. All CollapsibleSection icon props → SVG paths
2. Subcategory icons (💎, 🎨) → img tags
3. Create Theme button icon → img tag
4. Theme action buttons (edit, duplicate, export, share, delete) → img tags
5. Status message icons (💡, 🔌) → img tags
6. Checkmark (✓) → img tag
7. Coming soon icons → img tags

**Example Changes:**
```typescript
// Section icons
<CollapsibleSection
  icon="/icons/preferences/appearance.svg"
  // ...
/>

// Subcategory icons
<span className={styles.subcategoryIcon}>
  <img src="/icons/preferences/diamond.svg" alt="" />
</span>

// Action buttons
<button onClick={handleEdit} title="Edit theme">
  <img src="/icons/preferences/edit.svg" alt="Edit" className={styles.actionIcon} />
</button>

// Status messages
<p className={styles.emptyHint}>
  <img src="/icons/preferences/lightbulb.svg" alt="" className={styles.hintIcon} />
  Create and save your first custom theme!
</p>
```

### Phase 5: Update DesktopAndDockTab.tsx
**File:** `src/OS/components/UI/SystemPreferencesModal/components/DesktopAndDockTab.tsx`

- Update section icon → SVG path
- Update info icon → img tag

### Phase 6: Update AccentColorPicker.tsx
**File:** `src/OS/components/UI/SystemPreferencesModal/components/AccentColorPicker.tsx`

- Update custom color icon → img tag

### Phase 7: Update CSS Files
**Files to Modify:**
1. `SystemPreferencesModal.module.css`
2. `AppearanceTab.module.css`
3. `CollapsibleSection.module.css`
4. `AccentColorPicker.module.css`

**CSS Updates:**
```css
/* Category icons (sidebar) */
.categoryIcon {
  width: 20px;
  height: 20px;
  display: block;
  object-fit: contain;
  flex-shrink: 0;
}

/* Action button icons */
.actionIcon {
  width: 14px;
  height: 14px;
  display: block;
  object-fit: contain;
}

/* Subcategory icons */
.subcategoryIcon img {
  width: 18px;
  height: 18px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
}

/* Hint icons */
.hintIcon {
  width: 16px;
  height: 16px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 6px;
}
```

## Icon Design Specifications

### Style Guidelines
- **Colors:** Black (#000000) on transparent
- **Stroke Width:** 1.5-2px for clarity
- **Style:** Bold, simple, iconic
- **Detail:** Minimal but recognizable
- **Size Range:** 16-20px (depends on context)

### Examples

**Appearance Icon (Paint Palette):**
```svg
<svg width="20" height="20" viewBox="0 0 20 20">
  <circle cx="10" cy="10" r="7" stroke="#000" stroke-width="2" fill="none"/>
  <circle cx="7" cy="8" r="1.5" fill="#000"/>
  <circle cx="10" cy="7" r="1.5" fill="#000"/>
  <circle cx="13" cy="8" r="1.5" fill="#000"/>
  <circle cx="11" cy="11" r="1.5" fill="#000"/>
</svg>
```

**Edit Icon (Pencil):**
```svg
<svg width="16" height="16" viewBox="0 0 16 16">
  <path d="M12 2L14 4L6 12H4V10L12 2Z" stroke="#000" stroke-width="1.5" fill="none"/>
  <path d="M11 3L13 5" stroke="#000" stroke-width="1.5"/>
  <path d="M3 13H13" stroke="#000" stroke-width="1.5"/>
</svg>
```

**Info Icon (Circle with i):**
```svg
<svg width="20" height="20" viewBox="0 0 20 20">
  <circle cx="10" cy="10" r="8" stroke="#000" stroke-width="2" fill="none"/>
  <circle cx="10" cy="6" r="1" fill="#000"/>
  <rect x="9.5" y="8" width="1" height="5" fill="#000"/>
</svg>
```

## Files to Create/Modify

### New Files (17):
1. `/public/icons/preferences/appearance.svg`
2. `/public/icons/preferences/desktop.svg`
3. `/public/icons/preferences/system.svg`
4. `/public/icons/preferences/info.svg`
5. `/public/icons/preferences/edit.svg`
6. `/public/icons/preferences/duplicate.svg`
7. `/public/icons/preferences/save.svg`
8. `/public/icons/preferences/share.svg`
9. `/public/icons/preferences/lock.svg`
10. `/public/icons/preferences/delete.svg`
11. `/public/icons/preferences/wallpaper.svg`
12. `/public/icons/preferences/palette.svg`
13. `/public/icons/preferences/diamond.svg`
14. `/public/icons/preferences/mask.svg`
15. `/public/icons/preferences/lightbulb.svg`
16. `/public/icons/preferences/plug.svg`
17. `/docs/SYSTEM_PREFERENCES_EMOJI_REPLACEMENT_PLAN.md`

### Modified Files (7):
1. `src/OS/components/UI/SystemPreferencesModal/SystemPreferencesModal.tsx`
2. `src/OS/components/UI/SystemPreferencesModal/SystemPreferencesModal.module.css`
3. `src/OS/components/UI/SystemPreferencesModal/components/CollapsibleSection.tsx`
4. `src/OS/components/UI/SystemPreferencesModal/components/AppearanceTab.tsx`
5. `src/OS/components/UI/SystemPreferencesModal/components/AppearanceTab.module.css`
6. `src/OS/components/UI/SystemPreferencesModal/components/DesktopAndDockTab.tsx`
7. `src/OS/components/UI/SystemPreferencesModal/components/AccentColorPicker.tsx`

## Benefits

1. **Visual Consistency** - All preferences UI uses Mac OS 8 style icons
2. **Cross-Platform** - No emoji rendering differences
3. **Scalability** - SVG icons are crisp at any size
4. **Maintainability** - Easy to update or add new icons
5. **Professional** - Cohesive design language throughout
6. **Theme Support** - Icons can be filtered/colored based on theme
7. **Accessibility** - Proper alt text for screen readers

## Testing Checklist

- [ ] All category icons display correctly
- [ ] Section icons render properly
- [ ] Action buttons show correct icons
- [ ] Status messages display with icons
- [ ] Icons scale appropriately
- [ ] Mobile display maintains quality
- [ ] Theme switching works correctly
- [ ] No console errors
- [ ] All linting passes
- [ ] Icons work in all themes (Classic, Platinum, Dark Mode)

## Reusable Icons

Some icons can be reused from existing directories:
- **Checkmark** - Use `/icons/actions/check.svg`
- **Plug** - Consider reusing wallet-connection.svg concept
- **Trash/Delete** - Could reference system trash icon

## Future Enhancements

1. **Animated Icons** - Subtle hover animations
2. **Icon Themes** - Colored variants for different moods
3. **Custom Icon Sets** - User-selectable icon styles
4. **Icon Library** - Comprehensive preferences icon pack
5. **Dynamic Coloring** - CSS filters based on active theme

## Related Documentation

- [Emoji to SVG Migration](./EMOJI_TO_SVG_MIGRATION.md)
- [Balance Card Improvements](./BALANCE_CARD_IMPROVEMENTS_COMPLETE.md)
- [System Tray Wallet Icon](./SYSTEM_TRAY_WALLET_ICON.md)
- [Wallet Control Center Complete Summary](./WALLET_CONTROL_CENTER_COMPLETE_SUMMARY.md)

## Implementation Order

1. **Create all SVG icons** (establishes foundation)
2. **Update SystemPreferencesModal** (main modal structure)
3. **Update CollapsibleSection** (affects all sections)
4. **Update AppearanceTab** (most complex component)
5. **Update DesktopAndDockTab** (simpler component)
6. **Update AccentColorPicker** (smallest component)
7. **Update all CSS files** (proper styling)
8. **Test thoroughly** (all themes, mobile, desktop)

## Notes

- Some emojis are console.log statements (🎨, ✏️, 🗑️, etc.) - these are fine to keep as they're debug output
- Focus on UI-visible emojis only
- Maintain consistent sizing per context (category=20px, action=14px, inline=16-18px)
- All icons should work with theme system (black base, filterable)

