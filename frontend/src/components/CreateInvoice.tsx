import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContract } from "@/hooks/useContract";
import { isValidAddress, isValidAmount } from "@/lib/contract";

export const CreateInvoice = () => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { createInvoice, isConnected } = useContract();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      setResult("Error: Please connect your wallet first");
      return;
    }

    if (!recipient) {
      setResult("Error: Please enter recipient address");
      return;
    }

    if (!isValidAddress(recipient)) {
      setResult("Error: Invalid recipient address format");
      return;
    }

    if (!amount) {
      setResult("Error: Please enter amount");
      return;
    }

    if (!isValidAmount(amount)) {
      setResult("Error: Invalid amount (must be > 0)");
      return;
    }

    setIsLoading(true);
    setResult("Creating invoice...");

    try {
      const receipt = await createInvoice(recipient, amount);
      setResult(`✅ Invoice created! Block: ${receipt.blockNumber}`);

      // Clear form
      setRecipient("");
      setAmount("");
    } catch (error: any) {
      setResult(`Error: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Invoice</CardTitle>
        <CardDescription>
          Create a new invoice for a recipient with a specified amount
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              placeholder="e.g. 1.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Will be converted to wei automatically
            </p>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !isConnected}
            className="w-full">
            {isLoading ? "Creating..." : "Create Invoice"}
          </Button>
        </form>
        {result && (
          <div className="mt-4 p-3 text-sm bg-muted rounded-md">{result}</div>
        )}
      </CardContent>
    </Card>
  );
};
