/**
 * UI Component Library
 * Reusable Mac OS 8 primitives
 */

// Existing components
export { default as Button } from './Button/Button';
export { default as Dialog } from './Dialog/Dialog';
export { default as TouchTarget } from './TouchTarget/TouchTarget';

// System Modals
export { default as AboutDialog } from './AboutDialog/AboutDialog';
export type { AboutDialogProps } from './AboutDialog/AboutDialog';

export { default as SystemPreferencesModal } from './SystemPreferencesModal/SystemPreferencesModal';
export type { SystemPreferencesModalProps } from './SystemPreferencesModal/SystemPreferencesModal';

// Phase 6.5 - Core UI Components
export { default as ContextMenu } from './ContextMenu/ContextMenu';
export type { ContextMenuProps, ContextMenuItem } from './ContextMenu/ContextMenu';

export { default as Alert } from './Alert/Alert';
export type { AlertProps, AlertButton, AlertType } from './Alert/Alert';

export { default as Tooltip } from './Tooltip/Tooltip';
export type { TooltipProps } from './Tooltip/Tooltip';

export { default as TextInput } from './TextInput/TextInput';
export type { TextInputProps } from './TextInput/TextInput';

export { default as TextArea } from './TextArea/TextArea';
export type { TextAreaProps } from './TextArea/TextArea';

export { default as Select } from './Select/Select';
export type { SelectProps, SelectOption } from './Select/Select';

export { default as Checkbox } from './Checkbox/Checkbox';
export type { CheckboxProps } from './Checkbox/Checkbox';

export { default as Radio } from './Radio/Radio';
export type { RadioProps, RadioOption } from './Radio/Radio';

export { default as ProgressBar } from './ProgressBar/ProgressBar';
export type { ProgressBarProps } from './ProgressBar/ProgressBar';

export { default as Slider } from './Slider/Slider';
export type { SliderProps } from './Slider/Slider';

export { default as StatusBar } from './StatusBar/StatusBar';
export type { StatusBarProps } from './StatusBar/StatusBar';

export { default as Spinner } from './Spinner/Spinner';
export type { SpinnerProps } from './Spinner/Spinner';

export { default as Divider } from './Divider/Divider';
export type { DividerProps } from './Divider/Divider';

export { default as Badge } from './Badge/Badge';
export type { BadgeProps } from './Badge/Badge';

// Phase 7.5 - Advanced Customization
export { default as ColorPicker } from './ColorPicker/ColorPicker';
export type { ColorPickerProps } from './ColorPicker/ColorPicker';

export { default as IconPicker } from './IconPicker/IconPicker';
export type { IconPickerProps, IconCategory } from './IconPicker/IconPicker';

// Phase 8 - Font System & Theme Persistence
export { default as FontPicker } from './FontPicker/FontPicker';
export type { FontPickerProps } from './FontPicker/FontPicker';

export { default as ThemeNameDialog } from './ThemeNameDialog/ThemeNameDialog';
export type { ThemeNameDialogProps } from './ThemeNameDialog/ThemeNameDialog';

// Phase 8C - Theme Library & Sharing
export { default as ThemeLibrary } from './ThemeLibrary/ThemeLibrary';
export type { ThemeLibraryProps, CustomThemeData } from './ThemeLibrary/ThemeLibrary';

export { default as ThemeBrowser } from './ThemeBrowser/ThemeBrowser';
export type { ThemeBrowserProps, PublicThemeData } from './ThemeBrowser/ThemeBrowser';

// Missing components - NOW COMPLETE!
export { default as Tabs } from './Tabs/Tabs';
export type { TabsProps, Tab } from './Tabs/Tabs';

export { default as VolumeControl } from './VolumeControl/VolumeControl';
export type { VolumeControlProps, ControlType } from './VolumeControl/VolumeControl';

export { default as ClipboardViewer } from './ClipboardViewer/ClipboardViewer';
export type { ClipboardViewerProps, ClipboardEntry } from './ClipboardViewer/ClipboardViewer';

export { default as KeyboardViewer, DEFAULT_SHORTCUTS } from './KeyboardViewer/KeyboardViewer';
export type { KeyboardViewerProps, ShortcutCategory } from './KeyboardViewer/KeyboardViewer';
