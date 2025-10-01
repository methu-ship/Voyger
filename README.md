## Invoice System
A decentralized invoice management system built on Arbitrum Stylus that allows users to create, track, and manage payment invoices directly on the blockchain.

### Features
- Create Invoices: Generate invoices with detailed 
- Transparent: All invoice data is immutably stored on the blockchain
- View Invoice details

### Getting Started

**Clone the Repository**

```bash
git clone <Voyger>
cd Voyger
```

**Smart Contract Setup**
Install Rust

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Cargo Stylus
cargo install --force cargo-stylus
```

**Build and deploy contract**

```bash
# Navigate to contract directory
cd contract

# Build the contract
cargo stylus build

# Deploy tIVATE_KEY>o Arbitrum Sepolia (testnet)
cargo stylus deploy \
  --endpoint='https://sepolia-rollup.arbitrum.io/rpc' \
  --private-key=< private key> \
  --estimate-gas
```

**Frontend Setup**
```bash
cd frontend
npm install
```

**Start Development Server**
```bash
npm run dev
```