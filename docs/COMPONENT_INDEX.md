# Berry OS - Complete Component Index

> **Comprehensive guide to all UI components, system utilities, and integrations**

## 📋 Table of Contents

- [Core UI Components](#core-ui-components)
- [System Components](#system-components)
- [System Utilities](#system-utilities)
- [Mobile Components](#mobile-components)
- [Advanced Customization](#advanced-customization)
- [Usage Examples](#usage-examples)

---

## Core UI Components

### 1. **ContextMenu**
**Path**: `/src/OS/components/UI/ContextMenu/`

Right-click context menus for OS interaction.

```tsx
import { ContextMenu, type ContextMenuItem } from '@/OS/components/UI';

const items: ContextMenuItem[] = [
  { label: 'Open', action: 'open' },
  { label: 'Get Info', action: 'info', shortcut: '⌘I' },
  { divider: true },
  { label: 'Move to Trash', action: 'trash', danger: true },
];

<ContextMenu
  x={mouseX}
  y={mouseY}
  items={items}
  onClose={() => setMenuOpen(false)}
  onAction={(action) => handleAction(action)}
/>
```

---

### 2. **Alert**
**Path**: `/src/OS/components/UI/Alert/`

System-level alerts, confirmations, and prompts.

```tsx
import { Alert, type AlertButton } from '@/OS/components/UI';

<Alert
  type="warning"
  title="Empty Trash?"
  message="Are you sure you want to permanently erase the items in the Trash?"
  buttons={[
    { label: 'Cancel', action: 'secondary', onClick: () => setShow(false) },
    { label: 'Empty Trash', action: 'danger', onClick: handleEmptyTrash },
  ]}
  defaultButton={1}
  sound
/>
```

---

### 3. **Tooltip**
**Path**: `/src/OS/components/UI/Tooltip/`

Hover tooltips for icons, buttons, truncated text.

```tsx
import { Tooltip } from '@/OS/components/UI';

<Tooltip content="Open Finder" position="bottom" delay={500}>
  <button>📁</button>
</Tooltip>
```

---

### 4. **TextInput & TextArea**
**Path**: `/src/OS/components/UI/TextInput/`, `/src/OS/components/UI/TextArea/`

Text input components with Mac OS 8 styling.

```tsx
import { TextInput, TextArea } from '@/OS/components/UI';

<TextInput
  value={name}
  onChange={setName}
  placeholder="Enter file name..."
  autoFocus
/>

<TextArea
  value={notes}
  onChange={setNotes}
  rows={6}
  maxLength={500}
/>
```

---

### 5. **Select**
**Path**: `/src/OS/components/UI/Select/`

Dropdown menus for System Preferences and settings.

```tsx
import { Select, type SelectOption } from '@/OS/components/UI';

const options: SelectOption[] = [
  { value: 'classic', label: 'Classic Theme', icon: '/icons/theme-classic.svg' },
  { value: 'dark', label: 'Dark Mode', icon: '/icons/theme-dark.svg' },
];

<Select
  options={options}
  value={currentTheme}
  onChange={setTheme}
  placeholder="Select theme..."
/>
```

---

### 6. **Checkbox & Radio**
**Path**: `/src/OS/components/UI/Checkbox/`, `/src/OS/components/UI/Radio/`

Form controls for preferences and dialogs.

```tsx
import { Checkbox, Radio, type RadioOption } from '@/OS/components/UI';

<Checkbox
  checked={soundEnabled}
  onChange={setSoundEnabled}
  label="Enable system sounds"
/>

<Radio
  options={[
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ]}
  value={fontSize}
  onChange={setFontSize}
  name="font-size"
/>
```

---

### 7. **ProgressBar**
**Path**: `/src/OS/components/UI/ProgressBar/`

Progress indicators with classic barber pole animation.

```tsx
import { ProgressBar } from '@/OS/components/UI';

<ProgressBar
  value={uploadProgress}
  label="Uploading..."
  size="medium"
/>

<ProgressBar
  value={0}
  indeterminate
  label="Loading..."
/>
```

---

### 8. **Slider**
**Path**: `/src/OS/components/UI/Slider/`

Sliders for volume, brightness, and numeric values.

```tsx
import { Slider } from '@/OS/components/UI';

<Slider
  label="Volume:"
  value={volume}
  min={0}
  max={100}
  onChange={setVolume}
  showValue
/>
```

---

### 9. **StatusBar**
**Path**: `/src/OS/components/UI/StatusBar/`

Bottom bar in windows showing info and counts.

```tsx
import { StatusBar } from '@/OS/components/UI';

<StatusBar
  left={<span>{itemCount} items</span>}
  center={<span>{selectedCount} selected</span>}
  right={<span>{fileSize}</span>}
/>
```

---

### 10. **Spinner**
**Path**: `/src/OS/components/UI/Spinner/`

Loading indicators for async operations.

```tsx
import { Spinner } from '@/OS/components/UI';

<Spinner size="medium" color="#000000" />
```

---

### 11. **Divider**
**Path**: `/src/OS/components/UI/Divider/`

Visual separators for sections.

```tsx
import { Divider } from '@/OS/components/UI';

<Divider orientation="horizontal" spacing={16} />
```

---

### 12. **Badge**
**Path**: `/src/OS/components/UI/Badge/`

Notification counts on icons.

```tsx
import { Badge } from '@/OS/components/UI';

<Badge count={3} position="top-right">
  <img src="/icons/apps/mail.svg" alt="Mail" />
</Badge>
```

---

## System Components

### 13. **NotificationCenter**
**Path**: `/src/OS/components/NotificationCenter/`

System notifications (non-blocking alerts).

```tsx
import NotificationCenter, { type Notification } from '@/OS/components/NotificationCenter';

const notifications: Notification[] = [
  {
    id: '1',
    title: 'Download Complete',
    message: 'file.zip has been downloaded',
    type: 'success',
    duration: 5000,
    actions: [{ label: 'Open', action: () => openFile() }],
  },
];

<NotificationCenter
  notifications={notifications}
  onDismiss={handleDismiss}
  maxVisible={3}
/>
```

---

### 14. **GetInfo**
**Path**: `/src/OS/components/GetInfo/`

File/folder/app information panel.

```tsx
import GetInfo, { type GetInfoData } from '@/OS/components/GetInfo';

const data: GetInfoData = {
  icon: '/icons/system/folder.svg',
  name: 'Documents',
  kind: 'Folder',
  size: '2.4 MB',
  created: new Date('2025-01-01'),
  modified: new Date(),
  path: '/Users/Documents',
  permissions: 'Read Only',
};

<GetInfo data={data} onClose={() => setShowInfo(false)} />
```

---

### 15. **SearchField**
**Path**: `/src/OS/components/SearchField/`

Global search with Mac OS 8 styling.

```tsx
import SearchField from '@/OS/components/SearchField';

<SearchField
  placeholder="Search files..."
  onSearch={handleSearch}
  onClear={() => setResults([])}
  autoFocus
/>
```

---

### 16. **AboutDialog**
**Path**: `/src/OS/components/AboutDialog/`

System information dialog.

```tsx
import AboutDialog from '@/OS/components/AboutDialog';

<AboutDialog onClose={() => setShowAbout(false)} />
```

---

### 17. **AppSwitcher**
**Path**: `/src/OS/components/AppSwitcher/`

Command+Tab app switching interface.

```tsx
import AppSwitcher from '@/OS/components/AppSwitcher';

<AppSwitcher
  onClose={() => setSwitcherOpen(false)}
  onSelect={focusApp}
/>
```

---

## System Utilities

### 18. **Drag & Drop System**
**Path**: `/src/OS/lib/dragDrop.ts`

Universal drag-drop framework.

```tsx
import { dragDropManager, useDragSource, useDropTarget, type DragData } from '@/OS/lib/dragDrop';

// Drag source
const dragProps = useDragSource({
  type: 'file',
  data: fileData,
  source: 'finder',
});

<div {...dragProps}>Drag me</div>

// Drop target
const dropProps = useDropTarget({
  accepts: ['file'],
  onDrop: (data) => {
    console.log('Dropped:', data);
    return true;
  },
});

<div {...dropProps}>Drop here</div>
```

---

### 19. **Selection System**
**Path**: `/src/OS/lib/selection.ts`

Rubber-band and multi-select framework.

```tsx
import { selectionManager, useSelectable, useSelectionContainer } from '@/OS/lib/selection';

// Selectable item
const selectProps = useSelectable('item-1', {
  multiSelect: true,
  rangeSelect: true,
});

<div {...selectProps}>Select me</div>

// Container with rubber-band
const containerProps = useSelectionContainer(items);

<div {...containerProps}>
  {items.map(item => <Item key={item.id} {...item} />)}
</div>
```

---

### 20. **Keyboard Shortcuts**
**Path**: `/src/OS/lib/keyboardShortcuts.ts`

Global shortcut registration.

```tsx
import { keyboardShortcutManager, useKeyboardShortcut, COMMON_SHORTCUTS } from '@/OS/lib/keyboardShortcuts';

// Register shortcut
useKeyboardShortcut('s', ['cmd'], () => {
  saveFile();
}, {
  global: false,
  description: 'Save file',
});

// Use common shortcuts
const { key, modifiers } = COMMON_SHORTCUTS.SAVE;
```

---

### 21. **Sound System**
**Path**: `/src/OS/lib/sound.ts`

System sounds management.

```tsx
import { soundManager, playSound, useSoundSettings } from '@/OS/lib/sound';

// Play sound
playSound('beep', 0.5);
playSound('trash');

// Settings hook
const { enabled, volume, setEnabled, setVolume } = useSoundSettings();
```

---

### 22. **State Serialization**
**Path**: `/src/OS/lib/stateSerialization.ts`

Complete state save/restore for deep linking.

```tsx
import {
  serializeSystemState,
  restoreSystemState,
  createShareableURL,
  loadStateFromURL,
  saveStateToLocalStorage,
  loadStateFromLocalStorage,
} from '@/OS/lib/stateSerialization';

// Create shareable URL
const url = createShareableURL();

// Load from URL
const state = loadStateFromURL();
if (state) {
  restoreSystemState(state);
}

// Auto-save to localStorage
saveStateToLocalStorage();
```

---

### 23. **Auto-Save System**
**Path**: `/src/OS/lib/autoSave.ts`

Automatic periodic saves with debouncing.

```tsx
import { autoSaveManager, useAutoSave } from '@/OS/lib/autoSave';

// Enable auto-save
const { enable, disable, saveNow, isEnabled, isSaving, lastSaveTime } = useAutoSave();

enable({
  interval: 5 * 60 * 1000, // 5 minutes
  debounce: 2000, // 2 seconds
  saveToLocalStorage: true,
  onSave: (state) => console.log('Saved:', state),
});

// Manual save
saveNow();
```

---

### 24. **Accessibility System**
**Path**: `/src/OS/lib/accessibility.ts`

Complete a11y framework.

```tsx
import { accessibilityManager, useAccessibility } from '@/OS/lib/accessibility';

const {
  settings,
  updateSetting,
  trapFocus,
  releaseFocus,
  announce,
  skipToContent,
} = useAccessibility();

// Update settings
updateSetting('highContrast', true);
updateSetting('screenReaderEnabled', true);

// Announce to screen reader
announce('File saved successfully', 'polite');

// Focus trap for modal
trapFocus(modalElement);
// Later...
releaseFocus();
```

---

## Mobile Components

### 25. **GestureOverlay**
**Path**: `/src/OS/components/GestureOverlay/`

Visual swipe hints for mobile.

```tsx
import GestureOverlay, { type GestureHint } from '@/OS/components/GestureOverlay';

const hints: GestureHint[] = [
  { gesture: 'swipe-up', description: 'Open app switcher' },
  { gesture: 'swipe-down', description: 'Close current app' },
  { gesture: 'long-press', description: 'Show context menu' },
];

<GestureOverlay
  hints={hints}
  autoHide
  duration={5000}
  onDismiss={() => setShowHints(false)}
/>
```

---

### 26. **MobileAppSwitcher**
**Path**: `/src/OS/components/MobileAppSwitcher/`

iOS-style card-based app switcher.

```tsx
import MobileAppSwitcher from '@/OS/components/MobileAppSwitcher';

<MobileAppSwitcher
  onClose={() => setSwitcherOpen(false)}
  onSelect={focusApp}
  onKill={terminateApp}
/>
```

---

### 27. **MobileKeyboard**
**Path**: `/src/OS/components/MobileKeyboard/`

Custom Mac OS 8-styled keyboard with 5 languages!

```tsx
import MobileKeyboard from '@/OS/components/MobileKeyboard';

<MobileKeyboard
  onKeyPress={handleKeyPress}
  onClose={() => setKeyboardOpen(false)}
  layout="english" // 'english' | 'spanish' | 'french' | 'german' | 'japanese'
  autoCapitalize
/>
```

**Supported Languages**:
- English (QWERTY)
- Spanish (ñ, accents)
- French (AZERTY)
- German (ü, ö, ä, ß)
- Japanese (Hiragana/Katakana)

---

## Advanced Customization

### 28. **ColorPicker**
**Path**: `/src/OS/components/UI/ColorPicker/`

Theme color customization.

```tsx
import { ColorPicker } from '@/OS/components/UI';

<ColorPicker
  value={accentColor}
  onChange={setAccentColor}
  presets={NOUNS_PALETTE}
  showCustom
/>
```

---

### 29. **IconPicker**
**Path**: `/src/OS/components/UI/IconPicker/`

Custom icon selection.

```tsx
import { IconPicker } from '@/OS/components/UI';

<IconPicker
  currentIcon={icon}
  onSelect={setIcon}
  category="system"
  customIcons={userIcons}
/>
```

---

### 30. **ThemeBuilder**
**Path**: `/src/OS/components/ThemeBuilder/`

Complete theme customization UI.

```tsx
import ThemeBuilder, { type CustomTheme } from '@/OS/components/ThemeBuilder';

<ThemeBuilder
  theme={currentTheme}
  onChange={setTheme}
  onSave={handleSaveTheme}
  onCancel={() => setBuilderOpen(false)}
/>
```

---

## Usage Examples

### Example 1: File Context Menu

```tsx
function FileItem({ file }: { file: FileData }) {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const menuItems: ContextMenuItem[] = [
    { label: 'Open', action: 'open' },
    { label: 'Get Info', action: 'info', shortcut: '⌘I' },
    { divider: true },
    { label: 'Duplicate', action: 'duplicate', shortcut: '⌘D' },
    { label: 'Rename', action: 'rename' },
    { divider: true },
    { label: 'Move to Trash', action: 'trash', danger: true },
  ];

  return (
    <>
      <div onContextMenu={handleContextMenu}>
        {file.name}
      </div>
      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          items={menuItems}
          onClose={() => setMenuPos(null)}
          onAction={handleFileAction}
        />
      )}
    </>
  );
}
```

---

### Example 2: Complete Form with All Controls

```tsx
function SettingsPanel() {
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('classic');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(50);
  const [fontSize, setFontSize] = useState('medium');

  return (
    <div className={styles.panel}>
      <TextInput
        value={name}
        onChange={setName}
        placeholder="System name..."
      />

      <Divider spacing={16} />

      <Select
        options={themeOptions}
        value={theme}
        onChange={setTheme}
      />

      <Divider spacing={16} />

      <Checkbox
        checked={soundEnabled}
        onChange={setSoundEnabled}
        label="Enable sounds"
      />

      <Slider
        label="Volume:"
        value={volume}
        min={0}
        max={100}
        onChange={setVolume}
        showValue
        disabled={!soundEnabled}
      />

      <Divider spacing={16} />

      <Radio
        options={fontSizeOptions}
        value={fontSize}
        onChange={setFontSize}
        name="fontSize"
      />
    </div>
  );
}
```

---

### Example 3: Accessible Modal with Focus Trap

```tsx
function Modal({ children, onClose }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { trapFocus, releaseFocus, announce } = useAccessibility();

  useEffect(() => {
    if (modalRef.current) {
      trapFocus(modalRef.current);
      announce('Modal opened', 'polite');
    }

    return () => {
      releaseFocus();
      announce('Modal closed', 'polite');
    };
  }, []);

  return (
    <div ref={modalRef} className={styles.modal} role="dialog" aria-modal="true">
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

---

## Component Summary

| Category | Components | Count |
|----------|-----------|-------|
| Core UI | ContextMenu, Alert, Tooltip, TextInput, TextArea, Select, Checkbox, Radio, ProgressBar, Slider, StatusBar, Spinner, Divider, Badge | 14 |
| System | NotificationCenter, GetInfo, SearchField, AboutDialog, AppSwitcher | 5 |
| Utilities | DragDrop, Selection, KeyboardShortcuts, Sound, StateSerialization, AutoSave, Accessibility | 7 |
| Mobile | GestureOverlay, MobileAppSwitcher, MobileKeyboard | 3 |
| Customization | ColorPicker, IconPicker, ThemeBuilder | 3 |
| **Total** | | **32** |

---

**All components follow Mac OS 8 styling conventions and are fully responsive for mobile!** 🎉

