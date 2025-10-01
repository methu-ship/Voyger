import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  EXPECTED_CHAIN_ID,
} from "@/lib/contract";
import type { ContractState } from "@/types/contract";

export const useContract = () => {
  const [state, setState] = useState<ContractState>({
    provider: null,
    signer: null,
    contract: null,
    account: null,
    chainId: null,
    isConnected: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is available
  const isMetaMaskAvailable = () => {
    return (
      typeof window !== "undefined" &&
      window.ethereum! &&
      window.ethereum!.isMetaMask
    );
  };

  // Connect to MetaMask
  const connect = useCallback(async () => {
    if (!isMetaMaskAvailable()) {
      setError("MetaMask not found. Please install MetaMask.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum!!.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      // Check if we're on the correct network
      if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
        throw new Error(
          `Please switch to Arbitrum Sepolia network. Current: ${network.chainId}, Expected: ${EXPECTED_CHAIN_ID}`
        );
      }

      // Check if contract exists
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === "0x") {
        throw new Error(
          `Contract not found at ${CONTRACT_ADDRESS}. Please check the address and network.`
        );
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setState({
        provider,
        signer,
        contract,
        account: accounts[0],
        chainId: Number(network.chainId),
        isConnected: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to connect to MetaMask");
    } finally {
      setLoading(false);
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    setState({
      provider: null,
      signer: null,
      contract: null,
      account: null,
      chainId: null,
      isConnected: false,
    });
    setError(null);
  }, []);

  // Create invoice
  const createInvoice = useCallback(
    async (recipient: string, amountEth: string) => {
      if (!state.contract || !state.signer) {
        throw new Error("Contract not connected");
      }

      setLoading(true);
      setError(null);

      try {
        const amountWei = ethers.parseEther(amountEth);
        const tx = await state.contract.createInvoice(recipient, amountWei);

        const receipt = await tx.wait();
        return receipt;
      } catch (err: any) {
        setError(err.message || "Failed to create invoice");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [state.contract, state.signer]
  );

  // Get invoice status
  const getInvoiceStatus = useCallback(
    async (invoiceId: string): Promise<number> => {
      if (!state.contract) {
        throw new Error("Contract not connected");
      }

      if (!invoiceId || invoiceId === "0") {
        throw new Error("Invalid invoice ID");
      }

      try {
        const status = await state.contract.getInvoiceStatus(invoiceId);
        return Number(status);
      } catch (err: any) {
        console.error(`Error getting invoice status for ID ${invoiceId}:`, err);
        setError(err.message || "Failed to get invoice status");
        throw err;
      }
    },
    [state.contract]
  );

  // Mark invoice as paid
  const markInvoiceAsPaid = useCallback(
    async (invoiceId: string) => {
      if (!state.contract || !state.signer) {
        throw new Error("Contract not connected");
      }

      setLoading(true);
      setError(null);

      try {
        // First check if the invoice exists and get its status
        const status = await getInvoiceStatus(invoiceId);

        if (status === 1) {
          throw new Error("Invoice is already paid");
        }

        const tx = await state.contract.markInvoiceAsPaid(invoiceId);
        const receipt = await tx.wait();
        return receipt;
      } catch (err: any) {
        let errorMessage = "Failed to mark invoice as paid";

        if (err.message?.includes("InvoiceDoesNotExist")) {
          errorMessage = "Invoice does not exist";
        } else if (err.message?.includes("UnauthorizedAccess")) {
          errorMessage =
            "You are not authorized to pay this invoice (only the recipient can pay)";
        } else if (err.message?.includes("InvoiceAlreadyPaid")) {
          errorMessage = "Invoice is already paid";
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [state.contract, state.signer, getInvoiceStatus]
  );

  // Get invoices for address
  const getInvoicesForAddress = useCallback(
    async (address: string): Promise<string[]> => {
      if (!state.contract) {
        throw new Error("Contract not connected");
      }

      try {
        const invoiceIds = await state.contract.getInvoicesForAddress(address);
        return invoiceIds.map((id: any) => id.toString());
      } catch (err: any) {
        console.error(`Error getting invoices for address ${address}:`, err);
        setError(err.message || "Failed to get invoices");
        throw err;
      }
    },
    [state.contract]
  );

  // Get total invoices
  const getTotalInvoices = useCallback(async (): Promise<string> => {
    if (!state.contract) {
      throw new Error("Contract not connected");
    }

    try {
      const total = await state.contract.getTotalInvoices();
      return total.toString();
    } catch (err: any) {
      setError(err.message || "Failed to get total invoices");
      throw err;
    }
  }, [state.contract]);

  // Check if user is the recipient of an invoice
  const isInvoiceRecipient = useCallback(
    async (invoiceId: string): Promise<boolean> => {
      if (!state.contract || !state.account) {
        return false;
      }

      try {
        // Get all invoices for the current user
        const userInvoices = await getInvoicesForAddress(state.account);

        // Check if this invoice ID is in the user's invoices
        // and if the user is the recipient (not the sender)
        return userInvoices.includes(invoiceId);
      } catch (err: any) {
        console.error(
          `Error checking invoice recipient for ID ${invoiceId}:`,
          err
        );
        return false;
      }
    },
    [state.contract, state.account, getInvoicesForAddress]
  );

  // Get invoice amount by parsing InvoiceCreated events
  const getInvoiceAmount = useCallback(
    async (invoiceId: string): Promise<string> => {
      if (!state.contract || !state.provider) {
        throw new Error("Contract not connected");
      }

      if (!invoiceId || invoiceId === "0") {
        throw new Error("Invalid invoice ID");
      }

      try {
        // Get the contract address
        const contractAddress = CONTRACT_ADDRESS;

        // First, try to get all InvoiceCreated events and find the one with matching invoice ID
        const allEvents = await state.provider.getLogs({
          address: contractAddress,
          topics: [
            // InvoiceCreated event signature
            ethers.id(
              "InvoiceCreated(uint256,address,address,uint256,uint256)"
            ),
          ],
          fromBlock: 0,
          toBlock: "latest",
        });

        // Find the event with matching invoice ID
        for (const event of allEvents) {
          try {
            const decoded = state.contract.interface.parseLog({
              topics: event.topics,
              data: event.data,
            });

            if (decoded && decoded.args[0].toString() === invoiceId) {
              // Found the matching invoice, extract amount
              const amountWei = decoded.args[3];
              const amountEth = ethers.formatEther(amountWei);
              return amountEth;
            }
          } catch (parseErr) {
            // Skip this event if parsing fails
            continue;
          }
        }

        throw new Error("Invoice not found in events");
      } catch (err: any) {
        console.error(`Error getting invoice amount for ID ${invoiceId}:`, err);
        throw new Error("Failed to get invoice amount");
      }
    },
    [state.contract, state.provider]
  );

  // Check if already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      // Wait a bit for MetaMask to inject
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!isMetaMaskAvailable()) return;

      try {
        const accounts = await window.ethereum!.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum!);
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();

          if (Number(network.chainId) === EXPECTED_CHAIN_ID) {
            const contract = new ethers.Contract(
              CONTRACT_ADDRESS,
              CONTRACT_ABI,
              signer
            );

            setState({
              provider,
              signer,
              contract,
              account: accounts[0],
              chainId: Number(network.chainId),
              isConnected: true,
            });
          }
        }
      } catch (err) {
        console.log("Not connected:", err);
      }
    };

    checkConnection();
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (!isMetaMaskAvailable()) return;

    const handleAccountsChanged = () => {
      window.location.reload();
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum!.on("accountsChanged", handleAccountsChanged);
    window.ethereum!.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum!.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum!.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return {
    ...state,
    loading,
    error,
    connect,
    disconnect,
    createInvoice,
    markInvoiceAsPaid,
    getInvoiceStatus,
    getInvoicesForAddress,
    getTotalInvoices,
    isInvoiceRecipient,
    getInvoiceAmount,
  };
};
