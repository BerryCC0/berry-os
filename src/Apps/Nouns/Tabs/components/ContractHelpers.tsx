/**
 * Contract Helpers Component
 * Display read and write functions for Nouns contracts
 */

'use client';

import { useState } from 'react';
import styles from './ContractHelpers.module.css';
import FunctionExecutor from './FunctionExecutor';

interface ContractHelpersProps {
  contractName: string;
  contractAddress: string;
}

// Map contract names to their available helpers
const CONTRACT_HELPERS: Record<string, { read: string[]; write: string[] }> = {
  'Treasury': {
    read: [
      'Check if transaction queued',
      'Can execute transaction',
      'Is transaction expired',
      'Get timelock delay',
      'Get grace period',
      'Check admin',
      'Get pending admin',
      'Calculate transaction hash'
    ],
    write: [
      'Queue transaction',
      'Execute transaction',
      'Cancel transaction',
      'Send ETH',
      'Send ERC20',
      'Accept admin',
      'Set pending admin',
      'Set delay'
    ]
  },
  'DAO Governor': {
    read: [
      'Get proposal state',
      'Get proposal details',
      'Get proposal votes',
      'Get voting power',
      'Get quorum votes',
      'Has voted',
      'Get proposal threshold',
      'Get fork threshold',
      'Get fork end timestamp',
      'Get dynamic quorum params'
    ],
    write: [
      'Create proposal',
      'Propose by signatures',
      'Cast vote with Berry OS',
      'Cast vote with reason (Berry OS)',
      'Queue proposal',
      'Execute proposal',
      'Cancel proposal',
      'Veto proposal',
      'Update proposal',
      'Escrow to fork',
      'Execute fork',
      'Join fork',
      'Withdraw from fork'
    ]
  },
  'DAO Admin': {
    read: [
      'Get max fork period',
      'Get min fork period',
      'Get max objection period',
      'Get max updatable period',
      'Get max voting delay',
      'Get min voting delay',
      'Get max voting period',
      'Get min voting period',
      'Get max proposal threshold BPS',
      'Get min proposal threshold BPS',
      'Get max quorum votes BPS',
      'Get min quorum votes BPS bounds',
      'Validate fork period',
      'Validate voting config',
      'Format BPS as percentage',
      'Format blocks as time'
    ],
    write: [
      'Set admin',
      'Set pending admin',
      'Accept admin',
      'Set vetoer',
      'Set pending vetoer',
      'Accept vetoer',
      'Set voting delay',
      'Set voting period',
      'Set proposal threshold BPS',
      'Set objection period',
      'Set updatable period',
      'Set last minute window',
      'Set min quorum BPS',
      'Set max quorum BPS',
      'Set quorum coefficient',
      'Set fork period',
      'Set fork threshold',
      'Set fork escrow',
      'Set fork DAO deployer',
      'Set ERC20 tokens in fork',
      'Set timelocks and admin',
      'Withdraw ETH'
    ]
  },
  'Token Buyer': {
    read: [
      'Calculate USDC output',
      'Calculate ETH input',
      'Calculate price impact',
      'Get admin',
      'Get payer',
      'Get tokens receiver',
      'Get bot discount',
      'Get base swap fee',
      'Validate buy amount'
    ],
    write: [
      'Buy tokens (ETH → USDC)',
      'Set admin',
      'Set payer',
      'Set tokens receiver',
      'Withdraw ETH',
      'Withdraw token',
      'Set bot discount',
      'Set base swap fee',
      'Set payment token'
    ]
  },
  'Payer': {
    read: [
      'Is authorized payer',
      'Is admin',
      'Get treasury',
      'Format payment amount',
      'Calculate total with fees',
      'Validate payment'
    ],
    write: [
      'Pay (send USDC)',
      'Send or register debt',
      'Withdraw token',
      'Set admin',
      'Set treasury',
      'Authorize payer',
      'Revoke payer'
    ]
  },
  'Auction House': {
    read: [
      'Get current auction',
      'Get auction storage',
      'Get bidding client',
      'Get settlements',
      'Get prices',
      'Get reserve price',
      'Get time buffer',
      'Get min bid increment',
      'Get duration',
      'Is paused',
      'Check if auction active',
      'Calculate min bid'
    ],
    write: [
      'Create bid with Berry OS',
      'Settle auction',
      'Settle current & create new',
      'Pause',
      'Unpause',
      'Set reserve price',
      'Set time buffer',
      'Set min bid increment'
    ]
  },
  'Auction House Proxy': {
    read: [
      'Get current auction',
      'Get auction storage',
      'Get bidding client',
      'Get settlements',
      'Get prices',
      'Get reserve price',
      'Get time buffer',
      'Get min bid increment',
      'Get duration',
      'Is paused',
      'Check if auction active',
      'Calculate min bid'
    ],
    write: [
      'Create bid with Berry OS',
      'Settle auction',
      'Settle current & create new',
      'Pause',
      'Unpause',
      'Set reserve price',
      'Set time buffer',
      'Set min bid increment'
    ]
  },
  'Nouns Token': {
    read: [
      'Get balance',
      'Get owner of Noun',
      'Get voting power',
      'Get delegate',
      'Get prior votes',
      'Get total supply',
      'Get seed',
      'Get data URI',
      'Token URI',
      'Has Nouns',
      'Has voting power'
    ],
    write: [
      'Delegate votes',
      'Delegate by signature',
      'Delegate to self',
      'Transfer token',
      'Safe transfer',
      'Approve',
      'Set approval for all'
    ]
  },
  'Descriptor': {
    read: [
      'Get background count',
      'Get body count',
      'Get accessory count',
      'Get head count',
      'Get glasses count',
      'Get backgrounds',
      'Get bodies',
      'Get accessories',
      'Get heads',
      'Get glasses',
      'Generate SVG',
      'Get palette',
      'Is data URI enabled',
      'Token URI',
      'Parse trait data',
      'Calculate total traits'
    ],
    write: [
      'Add backgrounds',
      'Add bodies',
      'Add accessories',
      'Add heads',
      'Add glasses',
      'Set palette',
      'Add color to palette',
      'Set base URI',
      'Toggle data URI',
      'Set art descriptor',
      'Set art inflator',
      'Set renderer',
      'Lock parts'
    ]
  },
  'Seeder': {
    read: [
      'Generate seed (view function)'
    ],
    write: []
  },
  'Data Proxy': {
    read: [
      'Get proposal candidates',
      'Get create candidate cost',
      'Get update candidate cost',
      'Get fee recipient',
      'Get Duna admin',
      'Get Nouns DAO address',
      'Get Nouns Token address'
    ],
    write: [
      'Create proposal candidate',
      'Update proposal candidate',
      'Cancel proposal candidate',
      'Add signature',
      'Send feedback',
      'Send candidate feedback',
      'Signal compliance',
      'Post Duna admin message',
      'Post voter message',
      'Set create cost',
      'Set update cost',
      'Set fee recipient',
      'Set Duna admin'
    ]
  },
  'Stream Factory': {
    read: [
      'Is stream active',
      'Calculate stream progress',
      'Calculate remaining amount',
      'Calculate available amount',
      'Calculate stream rate',
      'Format stream rate',
      'Get time remaining',
      'Validate stream params'
    ],
    write: [
      'Create stream',
      'Withdraw from stream',
      'Cancel stream',
      'Rescue ERC20',
      'Rescue ETH'
    ]
  },
  'Client Rewards': {
    read: [
      'Get client balance',
      'Calculate total claimable',
      'Is client registered',
      'Calculate reward percentage',
      'Get reward stats',
      'Parse reward stats'
    ],
    write: [
      'Register client',
      'Update client description',
      'Update client metadata',
      'Claim rewards',
      'Update rewards for proposal',
      'Update rewards for auction'
    ]
  },
  'Client Rewards Proxy': {
    read: [
      'Get client balance',
      'Calculate total claimable',
      'Is client registered',
      'Calculate reward percentage',
      'Get reward stats',
      'Parse reward stats'
    ],
    write: [
      'Register client',
      'Update client description',
      'Update client metadata',
      'Claim rewards',
      'Update rewards for proposal',
      'Update rewards for auction'
    ]
  },
  'Fork Escrow': {
    read: [
      'Is fork active',
      'Get fork time remaining',
      'Can execute fork',
      'Calculate fork progress',
      'Get num tokens in escrow',
      'Validate token IDs'
    ],
    write: [
      'Escrow to fork',
      'Withdraw from fork escrow',
      'Return tokens to owner'
    ]
  },
  'Fork DAO Deployer': {
    read: [],
    write: [
      'Deploy fork DAO'
    ]
  },
};

export default function ContractHelpers({ contractName, contractAddress }: ContractHelpersProps) {
  const [activeFunction, setActiveFunction] = useState<{
    name: string;
    type: 'read' | 'write';
  } | null>(null);

  // Extract main contract name without brackets
  const mainName = contractName.split('[')[0].trim();
  const helpers = CONTRACT_HELPERS[mainName];

  if (!helpers) {
    return (
      <div className={styles.helpers}>
        <div className={styles.noHelpers}>
          <p>📋 Contract helpers coming soon!</p>
          <p className={styles.hint}>
            View on{' '}
            <a
              href={`https://etherscan.io/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Etherscan ↗
            </a>
          </p>
        </div>
      </div>
    );
  }

  const handleFunctionClick = (functionName: string, type: 'read' | 'write') => {
    setActiveFunction({ name: functionName, type });
  };

  return (
    <div className={styles.helpers}>
      {/* Read Functions */}
      {helpers.read.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>📖 Read Functions</h4>
          <div className={styles.functionList}>
            {helpers.read.map((fn, index) => (
              <button
                key={index}
                className={styles.functionButton}
                onClick={() => handleFunctionClick(fn, 'read')}
              >
                {fn}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Write Functions */}
      {helpers.write.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>✍️ Write Functions</h4>
          <div className={styles.functionList}>
            {helpers.write.map((fn, index) => (
              <button
                key={index}
                className={`${styles.functionButton} ${styles.writeButton}`}
                onClick={() => handleFunctionClick(fn, 'write')}
              >
                {fn}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Function Executor */}
      {activeFunction && (
        <FunctionExecutor
          contractName={contractName}
          contractAddress={contractAddress}
          functionName={activeFunction.name}
          functionType={activeFunction.type}
          onClose={() => setActiveFunction(null)}
        />
      )}

      <div className={styles.footer}>
        <p className={styles.hint}>
          💡 Click a function to interact with the contract
        </p>
      </div>
    </div>
  );
}

