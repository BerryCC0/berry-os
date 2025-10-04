# How To Add Functional Menus to Your App

This guide shows you how to add context-aware, functional menus to any app in Nouns OS.

## Overview

The menu system uses an **event-based architecture**:
1. App defines menus in `AppConfig` with action names
2. User clicks menu → MenuBar publishes event via Event Bus
3. App listens for events and responds with functionality

---

## Step 1: Define Menus in AppConfig

In `/apps/AppConfig.ts`, add a `menus` property to your app config:

```typescript
{
  id: 'my-app',
  name: 'My App',
  // ... other config
  menus: {
    File: [
      { label: 'New', action: 'myapp:new', shortcut: '⌘N' },
      { label: 'Open', action: 'myapp:open', shortcut: '⌘O' },
      { divider: true },
      { label: 'Close', action: 'file:close-window', shortcut: '⌘W' },
    ],
    Edit: [
      { label: 'Cut', action: 'edit:cut', shortcut: '⌘X' },
      { label: 'Copy', action: 'edit:copy', shortcut: '⌘C' },
      { label: 'Paste', action: 'edit:paste', shortcut: '⌘V' },
    ],
    View: [
      { label: 'Zoom In', action: 'myapp:zoom-in', shortcut: '⌘+' },
      { label: 'Zoom Out', action: 'myapp:zoom-out', shortcut: '⌘-' },
      { label: 'Reset Zoom', action: 'myapp:zoom-reset' },
    ],
  },
}
```

### Menu Item Properties:
- `label` - Text displayed in menu
- `action` - Action identifier (your choice, use `appname:action` convention)
- `shortcut` - Keyboard shortcut display (doesn't auto-bind, just visual)
- `divider` - Set to `true` for separator line
- `disabled` - Set to `true` to gray out (non-clickable)

---

## Step 2: Listen for Menu Actions in Your App

In your app component, subscribe to the `MENU_ACTION` event:

```typescript
import { useEffect } from 'react';
import { eventBus } from '../../system/lib/eventBus';

export default function MyApp({ windowId }: { windowId: string }) {
  // Your app state
  const [zoom, setZoom] = useState(100);
  
  // Menu action handlers
  useEffect(() => {
    const subscription = eventBus.subscribe('MENU_ACTION', (payload) => {
      const { action } = payload as any;
      
      switch (action) {
        case 'myapp:new':
          // Handle New action
          handleNew();
          break;
        
        case 'myapp:open':
          // Handle Open action
          handleOpen();
          break;
        
        case 'myapp:zoom-in':
          setZoom(prev => Math.min(prev + 10, 200));
          break;
        
        case 'myapp:zoom-out':
          setZoom(prev => Math.max(prev - 10, 50));
          break;
        
        case 'myapp:zoom-reset':
          setZoom(100);
          break;
        
        // Standard system actions
        case 'edit:cut':
          handleCut();
          break;
        
        case 'edit:copy':
          handleCopy();
          break;
        
        case 'edit:paste':
          handlePaste();
          break;
      }
    });

    // Cleanup on unmount
    return () => subscription.unsubscribe();
  }, [/* dependencies */]);

  // Rest of your component...
}
```

---

## Step 3: Implement Your Action Handlers

Create functions that execute when menu items are clicked:

```typescript
const handleNew = () => {
  // Reset state to new document
  setContent('');
  setFilename('Untitled');
};

const handleOpen = () => {
  // Open file picker or dialog
  console.log('Opening file...');
};

const handleCut = () => {
  // Cut selected text to clipboard
  if (selectedText) {
    clipboard.cut('text', selectedText);
    deleteSelection();
  }
};
```

---

## Common System Actions

You can reuse these standard actions across apps:

### File Menu:
- `file:new-folder` - Create new folder (Finder)
- `file:close-window` - Close active window
- `file:open` - Open file dialog
- `file:save` - Save current document

### Edit Menu:
- `edit:cut` - Cut to clipboard
- `edit:copy` - Copy to clipboard
- `edit:paste` - Paste from clipboard
- `edit:select-all` - Select all items

### View Menu:
- `view:as-icons` - Icon view (Finder)
- `view:as-list` - List view (Finder)
- `view:zoom-in` - Zoom in
- `view:zoom-out` - Zoom out

### Special Menu:
- `special:empty-trash` - Empty trash

---

## Real-World Examples

### Example 1: Calculator

**AppConfig.ts:**
```typescript
menus: {
  Edit: [
    { label: 'Copy Result', action: 'calc:copy-result', shortcut: '⌘C' },
    { label: 'Paste', action: 'calc:paste', shortcut: '⌘V' },
    { divider: true },
    { label: 'Clear', action: 'calc:clear', shortcut: '⌘⌫' },
  ],
  View: [
    { label: 'Share Calculator State', action: 'calc:share' },
  ],
}
```

**Calculator.tsx:**
```typescript
useEffect(() => {
  const subscription = eventBus.subscribe('MENU_ACTION', (payload) => {
    const { action } = payload as any;
    
    switch (action) {
      case 'calc:copy-result':
        copyToClipboard(state.display);
        break;
      
      case 'calc:clear':
        clear();
        break;
      
      case 'calc:share':
        handleShare();
        break;
    }
  });

  return () => subscription.unsubscribe();
}, [state]);
```

### Example 2: Finder

**AppConfig.ts:**
```typescript
menus: {
  File: [
    { label: 'New Folder', action: 'file:new-folder', shortcut: '⌘N' },
    { divider: true },
    { label: 'Close Window', action: 'file:close-window', shortcut: '⌘W' },
  ],
  Edit: [
    { label: 'Cut', action: 'edit:cut', shortcut: '⌘X' },
    { label: 'Copy', action: 'edit:copy', shortcut: '⌘C' },
    { label: 'Paste', action: 'edit:paste', shortcut: '⌘V' },
    { divider: true },
    { label: 'Select All', action: 'edit:select-all', shortcut: '⌘A' },
  ],
  View: [
    { label: 'as Icons', action: 'view:as-icons', shortcut: '⌘1' },
    { label: 'as List', action: 'view:as-list', shortcut: '⌘2' },
  ],
}
```

**Finder.tsx:**
```typescript
useEffect(() => {
  const subscription = eventBus.subscribe('MENU_ACTION', (payload) => {
    const { action } = payload as any;
    
    switch (action) {
      case 'edit:copy':
        if (selectedItems.length > 0) {
          clipboard.copy('file', getSelectedItems());
        }
        break;
      
      case 'edit:select-all':
        selectAll();
        break;
      
      case 'view:as-icons':
        setViewMode('icon');
        break;
      
      case 'view:as-list':
        setViewMode('list');
        break;
    }
  });

  return () => subscription.unsubscribe();
}, [selectedItems, currentPath]);
```

---

## Tips & Best Practices

### 1. **Action Naming Convention**
Use `appname:action` format for app-specific actions:
- ✅ `calc:clear`, `finder:new-folder`, `notes:bold`
- ❌ `clear`, `newFolder`, `make-bold`

### 2. **Reuse Standard Actions**
Use system actions (`edit:cut`, `file:close-window`) when possible for consistency.

### 3. **Include Dependencies**
Add state dependencies to your `useEffect` dependency array:
```typescript
useEffect(() => {
  // subscription code
}, [selectedText, zoom, currentFile]); // Add relevant state
```

### 4. **Conditional Items**
You can dynamically show/hide menu items based on state by building menus in your component.

### 5. **Disabled States**
Mark items as disabled when they shouldn't be clickable:
```typescript
{ label: 'Undo', action: 'edit:undo', shortcut: '⌘Z', disabled: !canUndo }
```

### 6. **Clean Up Subscriptions**
Always return the unsubscribe function:
```typescript
return () => subscription.unsubscribe();
```

---

## Clipboard Integration

For Cut/Copy/Paste functionality, use the clipboard system:

```typescript
import { clipboard } from '../../system/lib/clipboard';

// Copy
clipboard.copy('text', selectedText);
clipboard.copy('file', selectedFiles);

// Cut
clipboard.cut('text', selectedText);

// Paste
const data = clipboard.paste();
if (data && data.type === 'text') {
  insertText(data.data);
}

// Check if clipboard has data
if (clipboard.hasData()) {
  // Enable paste
}
```

---

## Testing Your Menus

1. **Focus your app window** - Click on it
2. **Check menu bar** - Your app name should appear
3. **Click menu items** - Should execute your handlers
4. **Try keyboard shortcuts** - Should work globally
5. **Switch apps** - Menu should update to other app

---

## Troubleshooting

### "Menu items don't do anything"
- Check you're subscribing to `'MENU_ACTION'` event
- Verify action names match between `AppConfig` and your handler
- Check browser console for errors

### "Menus don't appear"
- Ensure `menus` property is in your `AppConfig`
- Check menu structure matches the `MenuItem` interface
- Verify your app window is focused

### "Actions fire for other apps"
- This is normal! All apps receive all events
- Use a `switch` statement to only handle your actions
- Ignore actions that aren't yours

---

## Advanced: Context-Aware Menus

You can make menus dynamic based on state by using menubar actions to trigger state-based behavior:

```typescript
// In your handler, check state before acting
case 'myapp:toggle-feature':
  if (featureEnabled) {
    disableFeature();
  } else {
    enableFeature();
  }
  break;
```

Then update the menu label in AppConfig or show/hide items dynamically.

---

## Summary

1. **Define menus** in `AppConfig.menus`
2. **Subscribe to events** with `eventBus.subscribe('MENU_ACTION', ...)`
3. **Handle actions** in a switch statement
4. **Implement functionality** in your action handlers
5. **Clean up** with `subscription.unsubscribe()`

That's it! Your app now has fully functional, context-aware menus! 🎉

