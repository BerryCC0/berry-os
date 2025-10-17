#!/usr/bin/env node

/**
 * Test Etherscan Settler Extraction
 * 
 * Tests the Etherscan API integration for extracting settler addresses
 * from auction settlement transactions.
 * 
 * Usage:
 *   node scripts/test-etherscan-settler.js [txHash]
 * 
 * Example:
 *   node scripts/test-etherscan-settler.js 0xf4cbb2c708b4fc26469aab706be667baf29b6e4017554ee6cdbf8b644de982ae
 */

const fetch = require('cross-fetch');

const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'FYBQKTA9IF438WAQNVWIR1K33W2HJQ6S8A';

// Default test transaction (Noun #0 settlement)
const TEST_TX = process.argv[2] || '0xf4cbb2c708b4fc26469aab706be667baf29b6e4017554ee6cdbf8b644de982ae';

async function getTransactionByHash(txHash) {
  const url = `${ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${ETHERSCAN_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.result;
}

async function testSettlerExtraction() {
  console.log('=== Etherscan Settler Extraction Test ===\n');
  console.log(`Testing transaction: ${TEST_TX}\n`);

  try {
    const tx = await getTransactionByHash(TEST_TX);

    if (!tx) {
      console.error('❌ Failed to fetch transaction');
      return;
    }

    console.log('✅ Transaction fetched successfully\n');
    console.log('Transaction Details:');
    console.log(`  Hash: ${tx.hash}`);
    console.log(`  From (Settler): ${tx.from}`);
    console.log(`  To (Auction House): ${tx.to}`);
    console.log(`  Block Number: ${parseInt(tx.blockNumber, 16)}`);
    console.log(`  Gas Used: ${parseInt(tx.gas, 16)}`);
    console.log(`  Value: ${parseInt(tx.value, 16) / 1e18} ETH`);

    // Verify it's an auction house transaction
    const AUCTION_HOUSE = '0x830BD73E4184ceF73443C15111a1DF14e495C706';
    if (tx.to.toLowerCase() === AUCTION_HOUSE.toLowerCase()) {
      console.log('\n✅ Confirmed: Transaction is to Nouns Auction House');
    } else {
      console.log('\n⚠️  Warning: Transaction is NOT to Nouns Auction House');
    }

    console.log(`\n🎯 Settler Address: ${tx.from}`);
    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSettlerExtraction()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });

