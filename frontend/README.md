# Stylus Invoice DApp Frontend

A modern React frontend for the Stylus Invoice Management System built with Vite, TypeScript, and shadcn/ui.

## Features

- 🔗 **Wallet Integration**: Connect with MetaMask on Arbitrum One
- 📝 **Invoice Creation**: Create invoices with recipient addresses and ETH amounts
- 📋 **Invoice Management**: View and manage your invoices
- 💰 **Payment Tracking**: Mark invoices as paid
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **shadcn/ui** for beautiful, accessible components
- **Tailwind CSS** for styling
- **ethers.js v6** for blockchain interaction
- **MetaMask** for wallet connection

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- Arbitrum One network configured in MetaMask

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask wallet
2. **Create Invoice**: Enter a recipient address and amount in ETH to create a new invoice
3. **View Invoices**: See all your invoices in the table below
4. **Mark as Paid**: Click "Mark as Paid" for pending invoices you want to pay

## Contract Information

- **Contract Address**: `0x18c858bcc8944e714e38323191e8bebaa6b9f3e0`
- **Network**: Arbitrum One (Chain ID: 42161)
- **Built with**: Arbitrum Stylus (Rust smart contracts)

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── WalletConnect.tsx
│   ├── CreateInvoice.tsx
│   └── InvoiceList.tsx
├── hooks/              # Custom React hooks
│   └── useContract.ts  # Contract interaction logic
├── lib/                # Utilities and configurations
│   ├── contract.ts     # Contract ABI and utilities
│   └── utils.ts        # General utilities
├── types/              # TypeScript type definitions
│   └── ethereum.d.ts   # MetaMask types
└── App.tsx             # Main application component
```

## Development

The project uses:

- **ESLint** for code linting
- **TypeScript** for type safety
- **Vite** for fast HMR (Hot Module Replacement)

## Troubleshooting

### MetaMask Connection Issues

- Ensure MetaMask is installed and unlocked
- Make sure you're on the Arbitrum One network
- Try refreshing the page if connection fails

### Contract Interaction Issues

- Verify you're connected to Arbitrum One (Chain ID: 42161)
- Check that the contract address is correct
- Ensure you have sufficient ETH for gas fees

## License

MIT License - see the main project README for details.
