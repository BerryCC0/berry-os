# Theme Testing Guide

Quick guide to verify all three themes are working properly in Nouns OS.

## How to Test

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open System Preferences:**
   - Click the Berry menu (top left)
   - Select "System Preferences..."

3. **Go to Appearance tab:**
   - Should be the default active tab
   - Shows three theme cards: Classic, Platinum, Dark Mode

## Test Each Theme

### 🎨 Classic Theme (Default)

**What to Check:**
- [ ] Title bars have black & white pinstripes
- [ ] Window backgrounds are light gray (#DDDDDD)
- [ ] Text is black and readable
- [ ] Menu bar is white with black text
- [ ] Menu hover shows black background with white text
- [ ] Desktop icons have black text labels
- [ ] System Preferences text is black

**Expected Look:**
- Traditional Mac OS 8 aesthetic
- High contrast black/white
- Pinstriped active windows

---

### 🔷 Platinum Theme

**What to Check:**
- [ ] Title bars have blue gradient (light to dark)
- [ ] Window backgrounds are slightly lighter gray (#E0E0E0)
- [ ] Text is black and readable
- [ ] Menu bar is light gray with black text
- [ ] Menu hover shows blue background with white text
- [ ] Modern, refined appearance
- [ ] System Preferences text is black

**Expected Look:**
- Mac OS 8.5+ modern appearance
- Softer, more refined than Classic
- Blue gradient title bars

---

### 🌙 Dark Mode Theme

**What to Check:**
- [ ] **Title bars are dark gray (#555555)**
- [ ] **Window backgrounds are dark (#333333)**
- [ ] **Text is WHITE (#FFFFFF) - THIS IS KEY!**
- [ ] **Menu bar is dark with WHITE text**
- [ ] **Menu hover shows blue highlight with white text**
- [ ] **Desktop icons have white text labels**
- [ ] **System Preferences:**
  - [ ] All headings (h3) are white
  - [ ] All paragraphs (p) are white
  - [ ] Theme card text is white
  - [ ] Wallpaper names are white
  - [ ] Section content is readable

**Expected Look:**
- Dark backgrounds throughout
- White text everywhere
- Easy on the eyes
- Good contrast for readability

**Common Issues to Watch For:**
- ❌ Black text on dark background (unreadable)
- ❌ Gray text that's hard to read
- ✅ Crisp white text on dark gray
- ✅ All UI elements clearly visible

---

## Component-by-Component Check

### Menu Bar
**Classic:** White bg, black text → black bg on hover
**Platinum:** Light gray bg, black text → blue bg on hover
**Dark:** Dark bg, white text → blue bg on hover

### Windows
**Classic:** Light gray bg, black text, pinstripe title bar
**Platinum:** Light gray bg, black text, gradient title bar
**Dark:** Dark gray bg, **WHITE TEXT**, dark title bar

### System Preferences
**Classic:** Light sections, black text
**Platinum:** Light sections, black text
**Dark:** Dark sections, **WHITE TEXT**

### Desktop
**Classic:** Teal background, black icon labels
**Platinum:** Blue background, black icon labels
**Dark:** Very dark background, **WHITE ICON LABELS**

---

## Quick Switch Test

1. Open multiple windows (Finder, Calculator, Berry)
2. Switch between themes rapidly
3. Verify all windows update immediately
4. Check that no reload is needed

**Expected:**
- Instant theme switch
- No flicker
- All windows update at once
- No page reload

---

## Persistence Test

1. **Connect wallet** via System Tray
2. Switch to Dark Mode
3. Drag a desktop icon
4. **Refresh the page**
5. **Verify:**
   - [ ] Dark Mode is still active
   - [ ] Icon position is preserved
   - [ ] Theme persists across sessions

---

## Text Contrast Test

### Dark Mode Contrast Check
Open System Preferences in Dark Mode and read:

**Appearance Tab:**
- "Themes" heading → Should be WHITE
- Theme descriptions → Should be readable white/light gray
- "Desktop Picture" heading → Should be WHITE
- Wallpaper names → Should be WHITE

**Desktop Tab:**
- "Desktop Icons" heading → Should be WHITE
- Description text → Should be WHITE/light gray
- "Snap to Grid" label → Should be WHITE

**System Tab:**
- "System Information" heading → Should be WHITE
- Version info → Should be WHITE
- "Wallet Connection" heading → Should be WHITE
- Wallet address → Should be WHITE

**If ANY text is black on dark background, the theme system needs fixing.**

---

## Performance Test

1. Open 5+ windows
2. Switch themes multiple times
3. Verify no lag or slowdown
4. Check CSS custom properties update smoothly

---

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (should work perfectly)
- [ ] Firefox (should work perfectly)
- [ ] Safari (check CSS custom property support)

---

## Known Working State

After the recent theme fix (Phase 6.5), all themes should:
✅ Apply instantly via CSS custom properties
✅ Show correct text colors (white in Dark Mode)
✅ Update all UI components simultaneously
✅ Persist across page refreshes (when wallet connected)
✅ Work in all major browsers

---

## Troubleshooting

**Problem:** Text is black in Dark Mode
**Solution:** Check that component CSS uses `--theme-text` instead of `--mac-black`

**Problem:** Theme doesn't switch
**Solution:** Verify ThemeProvider is wrapping app in `app/page.tsx`

**Problem:** Theme doesn't persist
**Solution:** Ensure wallet is connected and DATABASE_URL is set

**Problem:** Some components don't theme
**Solution:** Check that component CSS uses theme variables with fallbacks

---

## Developer Testing Checklist

Before committing theme changes:
- [ ] All three themes tested
- [ ] Dark Mode text is readable (white)
- [ ] Menu bar works in all themes
- [ ] Windows display correctly in all themes
- [ ] System Preferences readable in all themes
- [ ] Desktop icons readable in all themes
- [ ] Theme switching is instant
- [ ] Theme persists when wallet connected
- [ ] No console errors
- [ ] No linter warnings

---

**Last Updated:** Phase 6.5 Theme System Fix
**Status:** ✅ All themes working correctly

