# Icon System Documentation

## Directory Structure

```
public/icons/
├── apps/              # Application icons
│   ├── about-this-mac.svg
│   ├── calculator.svg
│   └── ...
├── system/            # System icons (folders, files, etc.)
│   ├── folder.svg
│   ├── file.svg
│   ├── trash.svg
│   └── placeholder.svg
└── README.md
```

## Naming Conventions

### App Icons

App icons should be stored in `/public/icons/apps/` with the following naming:

- **SVG (preferred)**: `{app-id}.svg`
  - Example: `about-this-mac.svg`, `calculator.svg`
  
- **PNG**: `{app-id}-{size}.png`
  - Example: `calculator-32.png`, `calculator-64.png`
  - Sizes: 16, 32, 48, 64, 128, 256
  
- **ICO**: `{app-id}-{size}.ico`
  - Example: `calculator-32.ico`
  - Sizes: 16, 32, 48

**Note**: The `app-id` must match the `id` field in your AppConfig registration.

### System Icons

System icons (non-app) should be stored in `/public/icons/system/` with descriptive names:
- `folder.svg`, `file.svg`, `trash.svg`, etc.

## Using Icons in Code

### For Apps (in AppConfig.ts)

```typescript
import { getAppIconPath } from '../lib/iconUtils';

export const REGISTERED_APPS: AppConfig[] = [
  {
    id: 'your-app-id',
    name: 'Your App Name',
    icon: getAppIconPath('your-app-id', 'svg'), // Standardized path
    // ... other config
  },
];
```

### For System Icons

```typescript
import { SYSTEM_ICONS } from '../lib/iconUtils';

// Use predefined system icons
<img src={SYSTEM_ICONS.folder} alt="Folder" />
```

### With Fallback

```typescript
import { getAppIconWithFallback } from '../lib/iconUtils';

const iconPath = getAppIconWithFallback('app-id');
```

## Icon Specifications

### Recommended Formats

1. **SVG** (preferred for scalability)
   - Vector format, scales perfectly
   - Small file size
   - Easy to edit and maintain
   
2. **PNG** (for raster graphics)
   - Provide multiple sizes (32px minimum)
   - Use transparent backgrounds
   - Export at 2x for retina displays
   
3. **ICO** (for Windows compatibility)
   - Multi-resolution format
   - Useful for native-like feel

### Mac OS 8 Style Guidelines

To maintain authenticity:

- **Colors**: Use classic Mac OS palette
  - Gray: `#DDDDDD`, `#888888`, `#555555`
  - Desktop blue: `#5d92c0`
  - Black borders: `#000000`
  - White: `#FFFFFF`

- **Style**: Pixelated, simplified shapes
  - 1px black borders
  - Solid fills
  - Minimal gradients
  - High contrast

- **Size**: 32x32px is standard
  - Keep designs simple at small sizes
  - Test readability at 32px

### Example SVG Template

```svg
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="4" y="4" width="24" height="24" fill="#DDDDDD" stroke="#000000" stroke-width="1"/>
  
  <!-- Content -->
  <rect x="6" y="6" width="20" height="20" fill="#FFFFFF"/>
  
  <!-- Details -->
  <circle cx="16" cy="16" r="8" fill="#5d92c0" stroke="#000000" stroke-width="1"/>
</svg>
```

## Adding New App Icons

1. **Create your icon** following Mac OS 8 style guidelines
2. **Save as SVG** in `/public/icons/apps/{app-id}.svg`
3. **Use in AppConfig**:
   ```typescript
   icon: getAppIconPath('app-id', 'svg')
   ```
4. **Test** by launching your app from the menu

## Fallback System

If an icon is missing:
1. System tries SVG first
2. Falls back to PNG (32px)
3. Shows placeholder icon if not found

## Best Practices

✅ **DO**:
- Use SVG for scalability
- Follow naming conventions
- Keep designs simple and recognizable
- Test at multiple sizes
- Use standard Mac OS 8 colors

❌ **DON'T**:
- Don't use inline base64 images
- Don't hardcode icon paths
- Don't skip the standardized structure
- Don't use complex gradients or effects
- Don't ignore the Mac OS 8 aesthetic

## Icon Utilities Reference

Located in `/lib/iconUtils.ts`:

- `getAppIconPath(appId, format, size)` - Get path to app icon
- `getAppIconWithFallback(appId)` - Get path with fallback logic
- `SYSTEM_ICONS` - Predefined system icon paths
- `PLACEHOLDER_ICON` - Placeholder for missing icons
- `validateIcon(path)` - Check if icon exists

---

**Maintained by**: Berry  
**Last Updated**: October 3, 2025

