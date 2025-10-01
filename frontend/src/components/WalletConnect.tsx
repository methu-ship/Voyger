import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContract } from "@/hooks/useContract";
import { formatAddress } from "@/lib/contract";

export const WalletConnect = () => {
  const { isConnected, account, chainId, loading, error, connect, disconnect } =
    useContract();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
        <CardDescription>
          Connect your MetaMask wallet to interact with the invoice contract
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connected" : "Not connected"}
              </Badge>
            </div>
            {account && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Account:</span>
                <span className="text-sm text-muted-foreground font-mono">
                  {formatAddress(account)}
                </span>
              </div>
            )}
            {chainId && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Chain:</span>
                <span className="text-sm text-muted-foreground font-mono">
                  {chainId} (Arbitrum Sepolia)
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={isConnected ? disconnect : connect}
            disabled={loading}
            variant={isConnected ? "outline" : "default"}>
            {loading
              ? "Loading..."
              : isConnected
              ? "Disconnect"
              : "Connect Wallet"}
          </Button>
        </div>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
