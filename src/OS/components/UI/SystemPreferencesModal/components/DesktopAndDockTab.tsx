/**
 * Desktop & Dock Tab Component
 * Settings for desktop behavior, dock configuration, and window restoration
 */

'use client';

import CollapsibleSection from './CollapsibleSection';
import Slider from '../../Slider/Slider';
import Checkbox from '../../Checkbox/Checkbox';
import RadioGroup, { RadioOption } from '../../RadioGroup/RadioGroup';
import PinnedAppsManager from '../../PinnedAppsManager/PinnedAppsManager';
import type { DesktopPreferences, DockPreferences } from '../../../../types/system';
import styles from './DesktopAndDockTab.module.css';

export interface DesktopAndDockTabProps {
  desktopPreferences: DesktopPreferences;
  dockPreferences: DockPreferences;
  restoreWindowsOnStartup: boolean;
  connectedWallet: string | null;
  onDesktopChange: (prefs: Partial<DesktopPreferences>) => void;
  onDockChange: (prefs: Partial<DockPreferences>) => void;
  onRestoreWindowsChange: (enabled: boolean) => void;
}

export default function DesktopAndDockTab({
  desktopPreferences,
  dockPreferences,
  restoreWindowsOnStartup,
  connectedWallet,
  onDesktopChange,
  onDockChange,
  onRestoreWindowsChange,
}: DesktopAndDockTabProps) {
  // Double-click speed options
  const doubleClickOptions: RadioOption[] = [
    { value: 'slow', label: 'Slow (500ms)' },
    { value: 'medium', label: 'Medium (300ms)' },
    { value: 'fast', label: 'Fast (200ms)' },
  ];

  // Dock position options
  const dockPositionOptions: RadioOption[] = [
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'hidden', label: 'Hidden' },
  ];

  return (
    <div className={styles.desktopAndDockTab}>
      {/* Wallet notice */}
      {!connectedWallet && (
        <div className={styles.notice}>
          <strong>💡 Tip:</strong> Connect your wallet to save preferences across sessions.
          Changes will persist for this session only.
        </div>
      )}

      {/* Dock Section - First */}
      <CollapsibleSection
        title="Dock"
        description="Position and behavior"
        icon="📍"
        defaultExpanded={false}
      >
        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            💡 <strong>Tip:</strong> Drag the divider line on the dock (between pinned apps and the Apps folder) 
            up or down to resize the dock to any size you like.
          </p>
        </div>

        <div className={styles.settingGroup}>
          <label className={styles.label}>Position on Screen</label>
          <RadioGroup
            options={dockPositionOptions}
            value={dockPreferences.position}
            onChange={(value) => onDockChange({ position: value as 'bottom' | 'left' | 'right' | 'hidden' })}
            direction="horizontal"
          />
        </div>

        <div className={styles.settingGroup}>
          <Checkbox
            checked={dockPreferences.autoHide}
            onChange={(checked) => onDockChange({ autoHide: checked })}
            label="Automatically hide and show the Dock"
            description="Dock slides off-screen when not in use"
          />
        </div>

        <div className={styles.settingGroup}>
          <label className={styles.label}>Pinned Applications</label>
          <p className={styles.description}>
            Drag to reorder • Click × to remove • Click + to add
          </p>
          <PinnedAppsManager
            pinnedApps={dockPreferences.pinnedApps}
            onChange={(apps) => onDockChange({ pinnedApps: apps })}
          />
        </div>
      </CollapsibleSection>

      {/* Desktop Section - Second */}
      <CollapsibleSection
        title="Desktop"
        description="Icon arrangement and behavior"
        icon="🖥️"
        defaultExpanded={false}
      >
        <div className={styles.settingGroup}>
          <Checkbox
            checked={desktopPreferences.snapToGrid}
            onChange={(checked) => onDesktopChange({ snapToGrid: checked })}
            label="Snap icons to grid"
            description="Align icons to a grid when dragging (free-form positioning when disabled)"
          />
        </div>

        {desktopPreferences.snapToGrid && (
          <div className={styles.settingGroup}>
            <label className={styles.label}>Grid Spacing</label>
            <Slider
              min={60}
              max={120}
              value={desktopPreferences.gridSpacing}
              onChange={(value) => onDesktopChange({ gridSpacing: value })}
              step={10}
              unit="px"
              showValue
            />
          </div>
        )}

        <div className={styles.settingGroup}>
          <Checkbox
            checked={desktopPreferences.showHiddenFiles}
            onChange={(checked) => onDesktopChange({ showHiddenFiles: checked })}
            label="Show hidden files and folders"
            description="Display files and folders that are normally hidden"
          />
        </div>

        <div className={styles.settingGroup}>
          <label className={styles.label}>Double-Click Speed</label>
          <RadioGroup
            options={doubleClickOptions}
            value={desktopPreferences.doubleClickSpeed}
            onChange={(value) => onDesktopChange({ doubleClickSpeed: value as 'slow' | 'medium' | 'fast' })}
            direction="vertical"
          />
        </div>
      </CollapsibleSection>

      {/* Windows Section - Third */}
      <CollapsibleSection
        title="Windows"
        description="Window management preferences"
        icon="🪟"
        defaultExpanded={false}
      >
        <div className={styles.settingGroup}>
          <Checkbox
            checked={restoreWindowsOnStartup}
            onChange={onRestoreWindowsChange}
            label="Restore windows when reopening Berry OS"
            description="Automatically reopen windows that were open when you last quit"
          />
        </div>

        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            ℹ️ Window positions and sizes are automatically saved as you work. 
            Enable this option to restore them on your next visit.
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
}

