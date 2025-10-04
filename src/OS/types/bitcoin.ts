/**
 * Bitcoin Connector Types
 * Type definitions for Bitcoin wallet interactions
 */

export interface BitcoinConnector {
  getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]>;
  signMessage(params: BitcoinConnector.SignMessageParams): Promise<string>;
  sendTransfer(params: BitcoinConnector.SendTransferParams): Promise<string>;
  signPSBT(
    params: BitcoinConnector.SignPSBTParams
  ): Promise<BitcoinConnector.SignPSBTResponse>;
}

export namespace BitcoinConnector {
  export interface AccountAddress {
    address: string;
    publicKey?: string;
    purpose: 'payment' | 'ordinals';
  }

  export interface SignMessageParams {
    address: string;
    message: string;
  }

  export interface SendTransferParams {
    from: string;
    to: string;
    amount: string; // in satoshis
  }

  export interface SignPSBTParams {
    psbt: string; // base64 encoded PSBT
    signInputs?: {
      address: string;
      signingIndexes: number[];
    }[];
    broadcast?: boolean;
  }

  export interface SignPSBTResponse {
    psbt: string; // signed PSBT
    txId?: string; // if broadcast was true
  }
}

