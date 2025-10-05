/**
 * Berry OS - Main Entry Point
 * Browser-native operating system for Web3
 */

import Desktop from '../src/OS/components/Desktop/Desktop';
import ThemeProvider from '../src/OS/components/ThemeProvider/ThemeProvider';

// Disable static generation - Desktop is fully client-side
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <ThemeProvider>
      <Desktop />
    </ThemeProvider>
  );
}
