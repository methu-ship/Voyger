import { ethers } from "ethers";

// Contract configuration
export const CONTRACT_ADDRESS = "0x18c858bcc8944e714e38323191e8bebaa6b9f3e0";
export const EXPECTED_CHAIN_ID = 42161; // Arbitrum One

// Contract ABI - matching your deployed contract
export const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient_address",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "create_invoice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "invoice_id",
        type: "uint256",
      },
    ],
    name: "mark_invoice_as_paid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "invoice_id",
        type: "uint256",
      },
    ],
    name: "get_invoice_status",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "address",
        type: "address",
      },
    ],
    name: "get_invoices_for_address",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "invoice_id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "address",
        type: "address",
      },
    ],
    name: "is_invoice_owner",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "get_total_invoices",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "address",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "status",
        type: "uint8",
      },
    ],
    name: "get_invoices_by_status_for_address",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "address",
        type: "address",
      },
    ],
    name: "get_invoice_count_for_address",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// Types
export interface Invoice {
  id: string;
  status: "Pending" | "Paid";
  amount: string;
  recipient?: string;
  sender?: string;
}

export interface ContractState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
}

// Utility functions
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const isValidAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatEther = (wei: string): string => {
  return ethers.formatEther(wei);
};

export const parseEther = (ether: string): string => {
  return ethers.parseEther(ether).toString();
};
