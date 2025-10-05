/**
 * Wallet Sync Hook
 * Automatically loads/saves user preferences when wallet connects/disconnects
 */

'use client';

import { useEffect } from 'react';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useAppKitAccount } from '@reown/appkit/react';

export function useWalletSync() {
  const { address, isConnected } = useAppKitAccount();
  const loadUserPreferences = usePreferencesStore((state) => state.loadUserPreferences);
  const saveUserPreferences = usePreferencesStore((state) => state.saveUserPreferences);
  const resetToDefaults = usePreferencesStore((state) => state.resetToDefaults);
  const setConnectedWallet = usePreferencesStore((state) => state.setConnectedWallet);
  const connectedWallet = usePreferencesStore((state) => state.connectedWallet);

  useEffect(() => {
    if (isConnected && address) {
      // Wallet connected - load preferences
      console.log('Wallet connected:', address);
      setConnectedWallet(address);
      loadUserPreferences(address);
    } else if (!isConnected && connectedWallet) {
      // Wallet disconnected - save one last time, then reset
      console.log('Wallet disconnected');
      saveUserPreferences();
      
      // Wait a moment for save to complete, then reset
      setTimeout(() => {
        resetToDefaults();
      }, 1500);
    }
  }, [isConnected, address, loadUserPreferences, saveUserPreferences, resetToDefaults, setConnectedWallet, connectedWallet]);

  // Auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (connectedWallet) {
        // Trigger save (will be debounced)
        saveUserPreferences();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [connectedWallet, saveUserPreferences]);
}

