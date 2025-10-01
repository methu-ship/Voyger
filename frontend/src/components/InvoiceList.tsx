import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContract } from "@/hooks/useContract";
import type { Invoice } from "@/types/contract";

export const InvoiceList = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isConnected,
    account,
    getInvoicesForAddress,
    getInvoiceStatus,
    markInvoiceAsPaid,
    isInvoiceRecipient,
    getInvoiceAmount,
  } = useContract();

  const loadInvoices = async () => {
    if (!isConnected || !account) {
      setInvoices([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const invoiceIds = await getInvoicesForAddress(account);
      const invoiceData: Invoice[] = [];

      for (const id of invoiceIds) {
        try {
          const status = await getInvoiceStatus(id);
          const isRecipient = await isInvoiceRecipient(id);
          let amount = "0.0";

          try {
            amount = await getInvoiceAmount(id);
          } catch (amountErr) {
            console.error(`Error getting amount for invoice ${id}:`, amountErr);
            // Keep default amount of "0.0" if we can't fetch it
          }

          invoiceData.push({
            id,
            status: status === 0 ? "Pending" : "Paid",
            amount: `${amount} ETH`,
            recipient: isRecipient ? account : undefined,
          });
        } catch (err) {
          console.error(`Error loading invoice ${id}:`, err);
          // Skip this invoice if there's an error
        }
      }

      setInvoices(invoiceData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await markInvoiceAsPaid(invoiceId);
      // Reload invoices after successful payment
      await loadInvoices();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to mark invoice as paid"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [isConnected, account]);

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Invoices</CardTitle>
          <CardDescription>
            Connect your wallet to view your invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Please connect your wallet first
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Invoices</CardTitle>
        <CardDescription>View and manage your invoices</CardDescription>
        <Button
          onClick={loadInvoices}
          disabled={loading}
          variant="outline"
          size="sm">
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {invoices.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No invoices found
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono">#{invoice.id}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "Paid" ? "default" : "secondary"
                      }>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    {invoice.status === "Pending" && invoice.recipient ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsPaid(invoice.id)}
                        disabled={loading}>
                        Mark as Paid
                      </Button>
                    ) : invoice.status === "Paid" ? (
                      <span className="text-muted-foreground text-sm">
                        Completed
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Not recipient
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
