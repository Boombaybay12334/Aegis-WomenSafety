# 🛡️ AEGIS - Women Safety Platform

**Anonymous Evidence Gathering & Incident Reporting System**

A comprehensive blockchain-powered platform for domestic abuse victims to securely store evidence, send emergency alerts, and access help resources with complete anonymity and zero-knowledge architecture.

---

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔧 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🔗 Blockchain Integration](#-blockchain-integration)
- [🔐 Security Features](#-security-features)
- [📱 Usage Guide](#-usage-guide)
- [🧪 Testing](#-testing)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Project Overview

AEGIS is a revolutionary women safety platform that combines:
- **Zero-Knowledge Security**: Backend never sees your data or passwords
- **Blockchain Anchoring**: Evidence permanently recorded on Polygon zkEVM
- **Anonymous Accounts**: No personal information required
- **Evidence Storage**: Encrypted file storage with optional steganography
- **Emergency System**: SOS alerts with dead man's switch
- **Cross-Device Access**: Secure account recovery using Shamir's Secret Sharing

### 🌟 Why AEGIS?

Traditional evidence storage platforms are vulnerable to:
- Server breaches exposing victim data
- Legal pressure to reveal information
- Platform shutdown losing evidence
- Centralized control by authorities

AEGIS solves these problems with decentralized, encrypted, blockchain-anchored evidence storage.

---

## ✨ Key Features

### 🔒 **Zero-Knowledge Security**
- **Passphrase-only access**: No emails, phone numbers, or personal data
- **Client-side encryption**: Files encrypted before leaving your device
- **Shamir's Secret Sharing**: Your encryption key is split across multiple locations
- **Backend blindness**: Server cannot decrypt your data

### ⛓️ **Blockchain Integration**
- **Polygon zkEVM**: Evidence anchored to immutable blockchain
- **Automatic funding**: Platform funds your wallet for blockchain transactions
- **Tamper-proof timestamps**: Cryptographic proof of evidence authenticity
- **Decentralized verification**: Anyone can verify evidence integrity

### 📤 **Evidence Management**
- **Multi-file upload**: Photos, videos, audio, documents
- **Steganography**: Hide evidence inside innocent-looking images
- **Automatic encryption**: AES encryption with your master key
- **Metadata protection**: File details encrypted and protected

### 🆘 **Emergency Features**
- **SOS alerts**: Send location and evidence to authorities/NGOs
- **Dead man's switch**: Automatic alerts if you don't check in
- **Emergency contacts**: Pre-configured trusted contacts
- **Location tracking**: GPS coordinates included in alerts

### 🔄 **Cross-Platform Access**
- **Device recovery**: Access your account from any device
- **Secure sync**: Account data synchronized across devices
- **Backup protection**: Multiple recovery methods available
- **Session management**: Secure login/logout with timeout

---

## 🏗️ Architecture

### **System Components**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express Backend │    │ Polygon zkEVM   │
│                 │    │                  │    │   Blockchain    │
│ • File Upload   │    │ • User Accounts  │    │                 │
│ • Encryption    │────│ • Evidence API   │────│ • Evidence      │
│ • Wallet Mgmt   │    │ • Emergency API  │    │   Anchoring     │
│ • Blockchain    │    │ • Wallet Funding │    │ • Verification  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────▼────────┐             │
         │              │    MongoDB      │             │
         │              │                 │             │
         └──────────────│ • User Data     │─────────────┘
                        │ • Evidence Meta │
                        │ • Emergency Log │
                        └─────────────────┘
```

### **Security Flow**

```
User Passphrase → Wallet (Blockchain) + Master Key (Encryption)
                      │                      │
                      ▼                      ▼
              Blockchain Signing      Shamir Secret Sharing
                      │                      │
                      ▼                      ▼
               Evidence Anchoring     Shard A (Client)
                      │               Shard B (Server)
                      ▼               Shard C (NGO/KMS)
              Immutable Proof              │
                                          ▼
                                  File Encryption/Decryption
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Git

### 1-Minute Setup

```bash
# Clone the repository
git clone https://github.com/Boombaybay12334/Aegis-WomenSafety.git
cd Aegis-WomenSafety

# Install and start backend
cd backend
npm install
npm start

# Install and start frontend (new terminal)
cd ../my-frontend
npm install
npm run dev

# Start blockchain network (new terminal)
cd ../blockchain/aegis-blockchain
npm install
npx hardhat node

# Deploy smart contract (new terminal)
cd blockchain/aegis-blockchain
npx hardhat run scripts/deploy.js --network localhost
```

Access the application at `http://localhost:5173`

---

## 📁 Project Structure

```
Aegis-WomenSafety/
├── 📄 README.md                          # This file
├── 📄 *.md                               # Documentation files
├── 🗂️ backend/                           # Express.js backend
│   ├── 🗂️ config/                        # Configuration files
│   │   ├── 📄 database.js                # MongoDB configuration
│   │   └── 📄 blockchain.js              # Blockchain configuration
│   ├── 🗂️ models/                        # MongoDB models
│   │   ├── 📄 User.js                    # User account model
│   │   ├── 📄 Evidence.js                # Evidence storage model
│   │   └── 📄 SOS.js                     # Emergency alerts model
│   ├── 🗂️ routes/                        # API endpoints
│   │   ├── 📄 account.js                 # Account management APIs
│   │   ├── 📄 evidence.js                # Evidence upload/retrieval APIs
│   │   └── 📄 emergency.js               # Emergency/SOS APIs
│   ├── 🗂️ services/                      # Business logic services
│   │   ├── 📄 blockchainService.js       # Blockchain interaction
│   │   ├── 📄 mockKMS.js                 # Key management simulation
│   │   └── 📄 mockNGO.js                 # NGO integration simulation
│   ├── 🗂️ middleware/                    # Express middleware
│   │   └── 📄 rateLimiter.js             # API rate limiting
│   ├── 📄 server.js                      # Main server file
│   ├── 📄 package.json                   # Backend dependencies
│   └── 📄 .env                           # Environment variables
├── 🗂️ my-frontend/                       # React.js frontend
│   ├── 🗂️ src/
│   │   ├── 🗂️ components/                # React components
│   │   │   ├── 📄 HomePage.jsx           # Landing page
│   │   │   ├── 📄 CreateAccount.jsx      # Account creation
│   │   │   ├── 📄 LoginScreen.jsx        # Login interface
│   │   │   ├── 📄 Dashboard.jsx          # Main dashboard
│   │   │   ├── 📄 UploadEvidence.jsx     # Evidence upload
│   │   │   ├── 📄 EmergencySOS.jsx       # Emergency alerts
│   │   │   └── 📄 Settings.jsx           # User settings
│   │   ├── 🗂️ services/                  # Frontend services
│   │   │   ├── 📄 accountService.js      # Account management
│   │   │   ├── 📄 cryptoService.js       # Encryption/decryption
│   │   │   ├── 📄 evidenceService.js     # Evidence handling
│   │   │   ├── 📄 blockchainService.js   # Blockchain interaction
│   │   │   ├── 📄 apiService.js          # Backend API calls
│   │   │   └── 📄 sosService.js          # Emergency services
│   │   ├── 🗂️ config/                    # Configuration files
│   │   │   └── 📄 blockchain.js          # Blockchain configuration
│   │   └── 🗂️ utils/                     # Utility functions
│   │       └── 📄 deadManSwitch.js       # Auto-emergency system
│   ├── 📄 package.json                   # Frontend dependencies
│   └── 📄 vite.config.js                 # Vite build configuration
└── 🗂️ blockchain/                        # Blockchain components
    └── 🗂️ aegis-blockchain/              # Hardhat project
        ├── 🗂️ contracts/                 # Smart contracts
        │   └── 📄 EvidenceAnchor.sol     # Evidence anchoring contract
        ├── 🗂️ scripts/                   # Deployment scripts
        │   ├── 📄 deploy.js              # Contract deployment
        │   └── 📄 interact.js            # Contract interaction examples
        ├── 🗂️ test/                      # Contract tests
        │   └── 📄 EvidenceAnchor.test.js # Contract test suite
        ├── 📄 hardhat.config.js          # Hardhat configuration
        ├── 📄 deployment.json            # Deployed contract addresses
        └── 📄 package.json               # Blockchain dependencies
```

---

## 🔧 Installation

### System Requirements
- **Node.js**: 16.0.0 or higher
- **MongoDB**: 4.4 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

### Detailed Installation

#### 1. Clone Repository
```bash
git clone https://github.com/Boombaybay12334/Aegis-WomenSafety.git
cd Aegis-WomenSafety
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Install additional blockchain dependencies
npm install ethers@5.7.2

# Set up environment
cp .env.example .env  # Edit .env with your settings

# Start MongoDB (if local)
mongod

# Start backend server
npm start
# or for development
npm run dev
```

#### 3. Frontend Setup
```bash
cd my-frontend

# Install dependencies
npm install

# Install blockchain dependencies (already included in package.json)
# ethers@5.7.2 is now included

# Start development server
npm run dev

# Build for production
npm run build
```

#### 4. Blockchain Setup
```bash
cd blockchain/aegis-blockchain

# Install Hardhat and dependencies
npm install

# Start local blockchain network
npx hardhat node

# Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.js --network localhost

# Run tests
npx hardhat test
```

---

## ⚙️ Configuration

### Backend Configuration (`.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/aegis

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_NETWORK=localhost
ENABLE_BLOCKCHAIN=true
ENABLE_WALLET_FUNDING=true

# Wallet Funding (10,000 ETH in local network)
FUNDING_WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
FUNDING_AMOUNT=0.001
MIN_BALANCE_THRESHOLD=0.0005

# Mock Services
MOCK_KMS_ENABLED=true
MOCK_NGO_ENABLED=true
```

### Frontend Configuration

The frontend automatically reads blockchain configuration from:
- `src/config/blockchain.js` - Contract addresses and network settings
- `blockchain/aegis-blockchain/deployment.json` - Deployed contract addresses

### Production Configuration

For production deployment:

1. **Update RPC URLs** to Polygon zkEVM mainnet
2. **Replace funding wallet** with production wallet
3. **Set secure MongoDB URI** (MongoDB Atlas recommended)
4. **Enable HTTPS** for all endpoints
5. **Update CORS settings** for production domains

---

## 🔗 Blockchain Integration

### Smart Contract: EvidenceAnchor.sol

The platform uses a custom smart contract for evidence anchoring:

```solidity
function anchorEvidence(
    bytes32 evidenceId,    // Unique evidence identifier
    bytes32 merkleRoot,    // Hash of evidence content
    bytes32 cidRoot,       // IPFS CID (future use)
    bytes32 s3Key,         // Storage key (future use)
    bytes32 policyId       // Privacy policy identifier
) external
```

### Blockchain Networks

#### Development (Default)
- **Network**: Hardhat Local
- **RPC**: `http://localhost:8545`
- **Chain ID**: 31337
- **Native Token**: ETH (test)

#### Production Options
- **Polygon zkEVM Mainnet**: Chain ID 1101
- **Polygon zkEVM Testnet**: Chain ID 1442
- **RPC URLs**: Configured in `blockchain.js`

### Wallet Funding System

The platform automatically funds user wallets for blockchain transactions:

1. **Check Balance**: Before evidence upload
2. **Fund if Needed**: Send 0.001 ETH if balance < 0.0005 ETH
3. **Track Transactions**: All funding recorded in logs
4. **Graceful Failure**: Evidence upload continues even if funding fails

### Gas Optimization

- **Evidence Anchoring**: ~100,000 gas
- **Wallet Funding**: 21,000 gas
- **Automatic Estimation**: Dynamic gas price calculation
- **Error Recovery**: Retry logic for failed transactions

---

## 🔐 Security Features

### Zero-Knowledge Architecture

```
Passphrase (Client Only) ──┬── Wallet Private Key ──► Blockchain Signing
                           └── Master Key ──┬── Shard A (localStorage)
                                             ├── Shard B (Backend)
                                             └── Shard C (NGO/KMS)
```

### Encryption Layers

1. **File Encryption**: AES-256 with master key
2. **Shard Encryption**: Individual shards encrypted
3. **Transport Security**: HTTPS/WSS for all communications
4. **Storage Encryption**: MongoDB encryption at rest

### Security Principles

- **No Plaintext Storage**: All sensitive data encrypted
- **Key Separation**: Encryption and signing keys separate
- **Minimal Backend Trust**: Backend cannot decrypt user data
- **Blockchain Immutability**: Evidence tampering impossible
- **Decentralized Recovery**: Multiple recovery paths
- **Session Security**: Automatic timeout and cleanup

### Threat Mitigation

| Threat | Mitigation |
|--------|------------|
| Server Breach | Zero-knowledge architecture, no plaintext data |
| Key Loss | Shamir's Secret Sharing with multiple shards |
| Evidence Tampering | Blockchain anchoring with cryptographic proof |
| Platform Shutdown | Decentralized storage, user owns keys |
| Legal Pressure | Cannot decrypt data we don't have keys for |
| Device Theft | Passphrase required, automatic session timeout |

---

## 📱 Usage Guide

### Creating an Account

1. **Choose Strong Passphrase**: 12+ characters, mix of letters, numbers, symbols
2. **Create Account**: System generates wallet address from passphrase
3. **Backup Reminder**: Write down passphrase securely
4. **Account Created**: Ready to upload evidence

### Uploading Evidence

1. **Select Files**: Choose photos, videos, audio, documents
2. **Optional Description**: Add context and details
3. **Steganography Option**: Hide evidence inside cover image
4. **Automatic Process**:
   - Files encrypted with your master key
   - Evidence anchored to blockchain
   - Metadata stored in database
   - Wallet funded for future transactions

### Emergency Features

#### SOS Alerts
1. **Immediate Alert**: Red SOS button sends instant alert
2. **Location Included**: GPS coordinates attached
3. **Evidence Included**: Recent evidence sent with alert
4. **Multiple Recipients**: Authorities, NGOs, emergency contacts

#### Dead Man's Switch
1. **Set Check-in Period**: Choose 24h, 48h, or 72h
2. **Automatic Monitoring**: System tracks your activity
3. **Warning Notifications**: Alerts before triggering
4. **Auto-Emergency**: Sends SOS if you don't check in

### Cross-Device Access

1. **Same Device**: Use stored encrypted data
2. **New Device**: Account recovery process
3. **Enter Passphrase**: Reconstructs wallet and keys
4. **Download Shards**: Retrieves encrypted shards from backend
5. **Full Access**: All evidence and settings available

---

## 🧪 Testing

### Running Tests

#### Backend Tests
```bash
cd backend
npm test

# Test specific components
npm run test:models
npm run test:routes
npm run test:blockchain
```

#### Frontend Tests
```bash
cd my-frontend
npm test

# Run with coverage
npm run test:coverage
```

#### Blockchain Tests
```bash
cd blockchain/aegis-blockchain
npx hardhat test

# Test with gas reporting
npx hardhat test --gas-reporter

# Test specific contract
npx hardhat test test/EvidenceAnchor.test.js
```

### Manual Testing

#### Evidence Upload Flow
1. Create account with test passphrase
2. Upload sample files (images, documents)
3. Verify blockchain anchoring in console
4. Check MongoDB for evidence record
5. Verify wallet funding transaction

#### Emergency System
1. Set up dead man's switch (short interval for testing)
2. Test manual SOS alert
3. Verify NGO/authority notifications
4. Test auto-trigger functionality

#### Cross-Device Recovery
1. Create account on Device A
2. Upload evidence
3. Access account from Device B
4. Verify evidence retrieval
5. Test passphrase recovery

### Test Data

Sample test accounts and data available in:
- `backend/test/fixtures/` - Test user accounts
- `my-frontend/src/test/` - Sample evidence files
- `blockchain/test/` - Contract test data

---

## 🚢 Deployment

### Local Development

Already covered in [Quick Start](#-quick-start) section.

### Production Deployment

#### 1. MongoDB Atlas Setup
```bash
# Create MongoDB Atlas cluster
# Get connection string
# Update MONGODB_URI in .env
```

#### 2. Polygon zkEVM Configuration
```env
# Update .env for production
BLOCKCHAIN_RPC_URL=https://zkevm-rpc.com
BLOCKCHAIN_NETWORK=polygon_zkevm
FUNDING_WALLET_PRIVATE_KEY=your_production_private_key
```

#### 3. Backend Deployment (Heroku/AWS/DigitalOcean)
```bash
# Build and deploy backend
cd backend
npm run build
# Deploy to your platform of choice
```

#### 4. Frontend Deployment (Vercel/Netlify)
```bash
# Build frontend
cd my-frontend
npm run build

# Deploy dist/ folder to hosting platform
```

#### 5. Smart Contract Deployment
```bash
# Deploy to Polygon zkEVM mainnet
cd blockchain/aegis-blockchain
npx hardhat run scripts/deploy.js --network polygon_zkevm

# Update deployment.json with new addresses
# Commit and push changes
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in production mode
docker-compose -f docker-compose.prod.yml up
```

### Environment-Specific Settings

#### Development
- Local MongoDB
- Hardhat network
- Mock services enabled
- Detailed logging

#### Staging
- MongoDB Atlas
- Polygon zkEVM testnet
- Real NGO integrations
- Performance monitoring

#### Production
- MongoDB Atlas with encryption
- Polygon zkEVM mainnet
- Production wallet funding
- Security hardening

---

## 🤝 Contributing

We welcome contributions to make AEGIS better for domestic abuse victims worldwide.

### Development Process

1. **Fork Repository**: Create your own fork
2. **Create Branch**: `git checkout -b feature/your-feature`
3. **Develop**: Write code, tests, documentation
4. **Test**: Ensure all tests pass
5. **Commit**: `git commit -m "Add your feature"`
6. **Push**: `git push origin feature/your-feature`
7. **Pull Request**: Submit PR with detailed description

### Contribution Guidelines

#### Code Standards
- **JavaScript**: Use ES6+ features, async/await
- **React**: Functional components with hooks
- **Solidity**: Follow OpenZeppelin standards
- **Comments**: Document complex logic
- **Testing**: Include tests for new features

#### Security Considerations
- **No Hardcoded Keys**: Use environment variables
- **Input Validation**: Sanitize all user inputs
- **Error Handling**: Graceful failure, no data leaks
- **Audit Trail**: Log security-relevant actions

#### Documentation
- **README Updates**: Keep documentation current
- **Code Comments**: Explain security-critical sections
- **API Documentation**: Document all endpoints
- **Architecture Docs**: Update system diagrams

### Areas for Contribution

- **Mobile App**: React Native implementation
- **Additional Blockchains**: Support for other networks
- **Enhanced Steganography**: Advanced hiding techniques
- **ML/AI Features**: Evidence analysis and categorization
- **Accessibility**: Screen reader and disability support
- **Internationalization**: Multi-language support
- **Performance**: Optimization and caching
- **Security Audits**: Code review and testing

---

## 📄 License

### MIT License

```
MIT License

Copyright (c) 2025 AEGIS Development Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support & Resources

### Getting Help
- **Documentation**: This README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Community support via GitHub Discussions
- **Security**: Email security@aegis-platform.org for vulnerabilities

### Victim Resources
- **National Domestic Violence Hotline**: 1-800-799-7233
- **Crisis Text Line**: Text HOME to 741741
- **Local Resources**: [Directory of local support organizations]
- **Legal Aid**: Information about evidence and legal proceedings

### Technical Resources
- **Ethereum Documentation**: https://ethereum.org/developers
- **Polygon zkEVM**: https://zkevm.polygon.technology/
- **Hardhat**: https://hardhat.org/
- **React**: https://reactjs.org/
- **MongoDB**: https://docs.mongodb.com/

---

## 🌟 Acknowledgments

AEGIS is built with support from:
- **Open Source Community**: Libraries and tools that make this possible
- **Victim Advocates**: Input on real-world needs and safety considerations
- **Security Researchers**: Guidance on privacy and security best practices
- **Blockchain Developers**: Infrastructure for decentralized evidence storage

### Special Thanks
- **Polygon Team**: For zkEVM technology enabling private blockchain anchoring
- **MongoDB**: For flexible document storage supporting our data model
- **Hardhat**: For development tools enabling smart contract testing
- **React Team**: For the frontend framework powering our user interface

---

**🛡️ AEGIS - Protecting victims through technology, privacy, and community support**

*"Technology should empower the vulnerable, not exploit them. AEGIS exists to give domestic abuse victims the tools they need to document abuse, seek help, and rebuild their lives with dignity and safety."*

---

**Version**: 1.0.0 | **Last Updated**: October 11, 2025 | **License**: MIT