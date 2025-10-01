import { WalletConnect } from "@/components/WalletConnect";
import { CreateInvoice } from "@/components/CreateInvoice";
import { InvoiceList } from "@/components/InvoiceList";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Stylus Invoice DApp
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage invoices on Arbitrum Sepolia using Stylus smart contracts
            </p>
          </div>

          {/* Wallet Connection */}
          <WalletConnect />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Invoice */}
            <CreateInvoice />

            {/* Invoice List */}
            <div className="lg:col-span-2">
              <InvoiceList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
