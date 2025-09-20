# PayLink - Web3 Payment Platform

A modern, secure Web3 payment platform built with Next.js, featuring peer-to-peer transactions, split bill functionality, and a comprehensive rewards system.

## 🌟 Features

### 💳 Core Payment Features
- **Send Money**: Transfer funds instantly with password protection
- **Receive Money**: Generate QR codes for easy payments
- **Split Bills**: Split expenses with multiple people peer-to-peer
- **Transaction History**: Complete audit trail of all payments
- **QR Payments**: Scan and pay using QR codes

### 🎁 Rewards System
- **Earn Rewards**: Get 10 RWD tokens for every 1 SHM sent
- **Redeem Rewards**: Convert 100 RWD tokens back to 1 SHM
- **Balance Tracking**: Monitor reward earnings and redemptions
- **Transaction History**: Complete rewards transaction log

### 🔒 Security Features
- **Password Protection**: Secure all payments with user-defined passwords
- **Web3 Compliance**: Following Web3 security protocols
- **MetaMask Integration**: Seamless wallet connection
- **Address Validation**: Comprehensive wallet address verification

### 🆕 Split Bill Features
- **Multiple Participants**: Add unlimited participants to split bills
- **Equal Split**: Automatically divide amounts equally
- **Custom Amounts**: Set different amounts for each participant
- **Batch Payments**: Send to all participants with one authorization
- **Progress Tracking**: Real-time payment status updates
- **Error Handling**: Graceful handling of partial failures

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnushkaMowade1/Pay-Link.git
   cd Pay-Link
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Usage

### Getting Started
1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Set Password**: Create a secure password for payment authorization
3. **Explore Features**: Access all features through the dashboard

### Sending Payments
1. Go to Dashboard → Send Money
2. Enter recipient address and amount
3. Add optional note
4. Enter password to authorize
5. Confirm transaction in MetaMask

### Split Bills
1. Go to Dashboard → Split Bill
2. Click "New Split Bill"
3. Enter bill details (title, amount, description)
4. Add participants (name + wallet address)
5. Choose equal split or set custom amounts
6. Review and authorize with password
7. Watch real-time progress as payments are sent

### Earning & Redeeming Rewards
- **Automatic Earning**: Rewards are automatically credited for each payment
- **Check Balance**: View RWD balance in the Wallet tab
- **Redeem**: Use the "Redeem Rewards" button to convert RWD to SHM

## 🏗️ Project Structure

```
PayLink/
├── app/                    # Next.js 13+ app directory
│   ├── dashboard/         # Dashboard pages
│   ├── learn-more/        # Information pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard-specific components
│   ├── homepage/         # Landing page components
│   ├── ui/               # Reusable UI components
│   └── wallet/           # Wallet integration components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── rewards.ts        # Rewards system logic
│   ├── split-bill.ts     # Split bill functionality
│   └── shardeum.ts       # Blockchain integration
├── contracts/            # Smart contracts (Solidity)
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React hooks, localStorage
- **Blockchain**: ethers.js, MetaMask integration
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Development**: ESLint, Prettier

## 🔧 Configuration

### Environment Setup
The application uses localStorage for demo purposes. For production:

1. **Smart Contracts**: Deploy contracts using `scripts/deploy-contracts.js`
2. **Environment Variables**: Set up `.env.local` with:
   ```
   NEXT_PUBLIC_SHARDEUM_RPC_URL=your_rpc_url
   NEXT_PUBLIC_REWARD_TOKEN_ADDRESS=deployed_token_address
   NEXT_PUBLIC_REWARD_VAULT_ADDRESS=deployed_vault_address
   ```

### Network Configuration
Currently configured for Shardeum network. Update `lib/shardeum.ts` for other networks.

## 🧪 Testing

Run the test scripts to verify functionality:

```bash
# Test rewards system
node test-rewards.js

# Test split bill logic
node test-split-bill.js
```

## 📋 Features Roadmap

### Current Features ✅
- [x] Wallet connection and management
- [x] Send/receive payments
- [x] Password protection
- [x] Rewards earning and redemption
- [x] Split bill functionality
- [x] Transaction history
- [x] QR code generation

### Upcoming Features 🚧
- [ ] Split bill history and tracking
- [ ] Recurring payments
- [ ] Multi-signature wallets
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with more blockchains

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [MetaMask](https://metamask.io/) for Web3 wallet integration
- [Shardeum](https://shardeum.org/) for the blockchain infrastructure

---

**Made with ❤️ by the PayLink Team**
