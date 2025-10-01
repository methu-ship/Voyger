import { ethers } from "ethers";

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
