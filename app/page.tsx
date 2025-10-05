/**
 * Berry OS - Main Entry Point
 * Browser-native operating system for Web3
 */

import Desktop from '../src/OS/components/Desktop/Desktop';

// Disable static generation - Desktop is fully client-side
export const dynamic = 'force-dynamic';

export default function Home() {
  return <Desktop />;
}
