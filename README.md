# 📚 Ledgerbound MVP - NFT Digital Book Platform

A secure, decentralized digital book platform where authors can upload EPUBs, which are then tokenized as NFTs on the blockchain. Readers can buy these NFTs and read the content securely within our proprietary reader.

## 🏗️ Architecture Overview

```
Lejer/
├── packages/
│   ├── contracts/          # Smart contracts (Solidity + Hardhat)
│   └── reader/             # Secure reader module (WASM-ready)
└── apps/
    ├── api/                # Backend API (Node.js + Express + TypeScript)
    └── web/                # Frontend app (Next.js + TypeScript + Tailwind)
```

## 🚀 Tech Stack (Free-Tier Focus)

### Smart Contracts
- **Language**: Solidity
- **Framework**: Hardhat
- **Libraries**: OpenZeppelin Contracts
- **Target Network**: Polygon Mumbai (Testnet)

### Frontend
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Blockchain Interaction**: Ethers.js + Wagmi + RainbowKit
- **Hosting**: Vercel (Hobby Plan)

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Hosting**: Render (Free Tiers)

### Storage
- **File Storage**: Cloudflare R2 (Free Tier)

### Security
- **Encryption**: AES-256-GCM
- **Challenge-Response**: Proprietary attestation protocol
- **Reader**: WebAssembly (WASM) compiled from Rust (planned)

## 🔐 Security Features

1. **Client Attestation**: Day-one feature with cryptographic challenge-response protocol
2. **AES-256 Encryption**: All EPUB files are encrypted before storage
3. **Secure Key Management**: Decryption keys are only provided after ownership verification
4. **Proprietary Reader**: Client-side decryption and rendering

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Cloudflare R2 account
- Polygon Mumbai testnet wallet with MATIC

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Lejer
```

### 2. Smart Contracts Setup
```bash
cd packages/contracts
npm install
cp env.example .env
# Edit .env with your configuration
npm test
npm run deploy:mumbai
```

### 3. Backend API Setup
```bash
cd apps/api
npm install
cp env.example .env
# Edit .env with your configuration
npm run build
npm start
```

### 4. Frontend Setup
```bash
cd apps/web
npm install
# Edit environment variables in .env.local
npm run dev
```

### 5. Reader Module Setup
```bash
cd packages/reader
npm install
npm run build
```

## 🔧 Environment Configuration

### Smart Contracts (.env)
```env
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
```

### Backend API (.env)
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://username:password@localhost:5432/ledgerbound
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=your_deployed_contract_address_here
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_bucket_name
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address_here
```

## 🚀 Deployment

### Smart Contracts
```bash
cd packages/contracts
npm run deploy:mumbai
```

### Backend API (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy as a Web Service

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

## 📖 Usage

### For Authors
1. Connect wallet to the platform
2. Navigate to "Publish" page
3. Upload EPUB file and fill metadata
4. Set price and supply limits
5. Deploy smart contract
6. Book is now available in marketplace

### For Readers
1. Connect wallet to the platform
2. Browse marketplace for books
3. Purchase NFT (simulated in MVP)
4. Access book through secure reader
5. Read content with chapter navigation

## 🔒 Security Protocol

### Challenge-Response Attestation
1. User signs message proving wallet ownership
2. Server verifies signature and NFT ownership
3. Server sends cryptographic challenge (nonce)
4. Client computes response using proprietary function
5. Server verifies response and provides decryption key
6. Client decrypts and renders book content

## 🧪 Testing

### Smart Contracts
```bash
cd packages/contracts
npm test
```

### Backend API
```bash
cd apps/api
npm test
```

### Frontend
```bash
cd apps/web
npm test
```

## 📁 Project Structure

```
Lejer/
├── packages/
│   ├── contracts/
│   │   ├── contracts/
│   │   │   └── LedgerboundBook.sol
│   │   ├── test/
│   │   │   └── LedgerboundBook.test.js
│   │   ├── scripts/
│   │   │   └── deploy.js
│   │   └── hardhat.config.js
│   └── reader/
│       ├── src/
│       │   └── reader.js
│       └── webpack.config.js
└── apps/
    ├── api/
    │   ├── src/
    │   │   ├── controllers/
    │   │   ├── middleware/
    │   │   ├── services/
    │   │   └── server.ts
    │   └── tsconfig.json
    └── web/
        ├── src/
        │   ├── app/
        │   │   ├── page.tsx
        │   │   ├── publish/
        │   │   ├── read/
        │   │   └── my-library/
        │   └── components/
        └── package.json
```

## 🔮 Future Enhancements

1. **Rust WASM Reader**: Replace JavaScript reader with compiled Rust WASM
2. **IPFS Integration**: Migrate from Cloudflare R2 to decentralized storage
3. **Advanced EPUB Parser**: Full EPUB format support with images and formatting
4. **Marketplace Contract**: Separate marketplace smart contract
5. **Royalty Distribution**: Automated royalty payments to authors
6. **Social Features**: Reviews, ratings, and author profiles

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in each package
- Review the test files for usage examples

## ⚠️ Disclaimer

This is an MVP (Minimum Viable Product) for demonstration purposes. The security features are simplified for the MVP and should be enhanced for production use. 