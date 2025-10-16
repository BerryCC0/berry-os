/**
 * Client Names Mapping
 * Maps client IDs to their display names
 * 
 * Official registry of Nouns auction clients
 */

// Known client IDs from Nouns ecosystem
export const CLIENT_NAMES: Record<number, string> = {
  1: 'Noundry',           // https://www.noundry.wtf/
  2: 'House of Nouns',    // https://houseofnouns.wtf/nouns/
  3: 'Camp',              // https://nouns.camp/
  4: 'Nouns.biz',         // https://nouns.biz/
  5: 'NounSwap',          // https://www.nounswap.wtf/
  6: 'Nouns.game',        // https://www.nouns.game/
  7: 'Nouns Terminal',    // https://nouns.sh/
  8: 'Nouns Esports',     // https://nouns.gg/
  9: 'Probe',             // https://www.probe.wtf/
  10: 'Agora',            // https://nounsagora.com/
  11: 'Berry OS',         // That's us! ⌐◨-◨
  16: 'Lighthouse',       // https://lighthouse.cx/
  18: 'ANouns',           // https://anouns.eth.limo
  22: 'Nouncil',          // Nouncil
  // Add more as they're registered
};

/**
 * Get client display name from ID
 */
export function getClientName(clientId: number | null | undefined): string | null {
  if (clientId === null || clientId === undefined) {
    return null;
  }
  
  return CLIENT_NAMES[clientId] || `Client ${clientId}`;
}

/**
 * Check if bid was made through Berry OS
 */
export function isBerryOSBid(clientId: number | null | undefined): boolean {
  return clientId === 11;
}

