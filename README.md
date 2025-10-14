# AEGIS - Women Safety Platform# 🛡️ AEGIS - Women Safety Platform



**Anonymous Evidence Gathering & Incident Reporting System****Anonymous Evidence Gathering & Incident Reporting System**



A comprehensive blockchain-powered platform for domestic abuse victims to securely store evidence, send emergency alerts, and access help resources with complete anonymity and zero-knowledge architecture.A comprehensive blockchain-powered platform for domestic abuse victims to securely store evidence, send emergency alerts, and access help resources with complete anonymity and zero-knowledge architecture.



**Created by The DUO****Created by The DUO**



------



## Table of Contents## 📋 Table of Contents



- [Project Overview](#project-overview)- [🎯 Project Overview](#-project-overview)

- [Key Features](#key-features)- [✨ Key Features](#-key-features)

- [Architecture](#architecture)- [🏗️ Architecture](#️-architecture)

- [Quick Start](#quick-start)- [🚀 Quick Start](#-quick-start)

- [Project Structure](#project-structure)- [📁 Project Structure](#-project-structure)

- [Installation & Setup](#installation--setup)- [🔧 Installation & Setup](#-installation--setup)

- [Environment Configuration](#environment-configuration)- [⚙️ Environment Configuration](#️-environment-configuration)

- [Blockchain Setup (WSL2 for Windows)](#blockchain-setup-wsl2-for-windows)- [⛓️ Blockchain Setup (WSL2 for Windows)](#️-blockchain-setup-wsl2-for-windows)

- [Blockchain Integration](#blockchain-integration)- [🔗 Blockchain Integration](#-blockchain-integration)

- [Security Features](#security-features)- [🔐 Security Features](#-security-features)

- [Usage Guide](#usage-guide)- [📱 Usage Guide](#-usage-guide)

- [Testing & Verification](#testing--verification)- [🧪 Testing & Verification](#-testing--verification)

- [Deployment](#deployment)- [🚢 Deployment](#-deployment)

- [License](#license)- [📄 License](#-license)



------



## Project Overview## 🎯 Project Overview



AEGIS is a revolutionary women safety platform that combines:AEGIS is a revolutionary women safety platform that combines:

- **Zero-Knowledge Security**: Backend never sees your data or passwords- **Zero-Knowledge Security**: Backend never sees your data or passwords

- **Blockchain Anchoring**: Evidence permanently recorded on Polygon zkEVM- **Blockchain Anchoring**: Evidence permanently recorded on Polygon zkEVM

- **Anonymous Accounts**: No personal information required- **Anonymous Accounts**: No personal information required

- **Evidence Storage**: Encrypted file storage on IPFS via Filebase- **Evidence Storage**: Encrypted file storage with optional steganography

- **Emergency System**: SOS alerts with dead man's switch- **Emergency System**: SOS alerts with dead man's switch

- **Cross-Device Access**: Secure account recovery using Shamir's Secret Sharing- **Cross-Device Access**: Secure account recovery using Shamir's Secret Sharing



### Why AEGIS?### 🌟 Why AEGIS?



Traditional evidence storage platforms are vulnerable to:Traditional evidence storage platforms are vulnerable to:

- Server breaches exposing victim data- Server breaches exposing victim data

- Legal pressure to reveal information- Legal pressure to reveal information

- Platform shutdown losing evidence- Platform shutdown losing evidence

- Centralized control by authorities- Centralized control by authorities



AEGIS solves these problems with decentralized, encrypted, blockchain-anchored evidence storage.AEGIS solves these problems with decentralized, encrypted, blockchain-anchored evidence storage.



------



## Key Features## ✨ Key Features



### Zero-Knowledge Security### 🔒 **Zero-Knowledge Security**

- **Passphrase-only access**: No emails, phone numbers, or personal data- **Passphrase-only access**: No emails, phone numbers, or personal data

- **Client-side encryption**: Files encrypted before leaving your device- **Client-side encryption**: Files encrypted before leaving your device

- **Shamir's Secret Sharing**: Your encryption key is split across multiple locations- **Shamir's Secret Sharing**: Your encryption key is split across multiple locations

- **Backend blindness**: Server cannot decrypt your data- **Backend blindness**: Server cannot decrypt your data



### Blockchain Integration### ⛓️ **Blockchain Integration**

- **Polygon zkEVM**: Evidence anchored to immutable blockchain- **Polygon zkEVM**: Evidence anchored to immutable blockchain

- **Automatic funding**: Platform funds your wallet for blockchain transactions- **Automatic funding**: Platform funds your wallet for blockchain transactions

- **Tamper-proof timestamps**: Cryptographic proof of evidence authenticity- **Tamper-proof timestamps**: Cryptographic proof of evidence authenticity

- **Decentralized verification**: Anyone can verify evidence integrity- **Decentralized verification**: Anyone can verify evidence integrity



### Evidence Management### 📤 **Evidence Management**

- **Multi-file upload**: Photos, videos, audio, documents- **Multi-file upload**: Photos, videos, audio, documents

- **Decentralized storage**: Files stored on IPFS via Filebase (S3-compatible)- **Decentralized storage**: Files stored on IPFS via Filebase (S3-compatible)

- **Real IPFS CIDs**: Each file gets a unique Content Identifier- **Real IPFS CIDs**: Each file gets a unique Content Identifier

- **Blockchain anchoring**: Real CIDs and S3 keys anchored on-chain- **Blockchain anchoring**: Real CIDs and S3 keys anchored on-chain

- **Automatic encryption**: AES-256 encryption with your master key- **Steganography**: Hide evidence inside innocent-looking images

- **Metadata protection**: File details encrypted and protected- **Automatic encryption**: AES encryption with your master key

- **5GB free tier**: Ample storage for evidence files (Filebase)- **Metadata protection**: File details encrypted and protected

- **5GB free tier**: Ample storage for evidence files

### Emergency Features

- **SOS alerts**: Send location and evidence to authorities/NGOs### 🆘 **Emergency Features**

- **Dead man's switch**: Automatic alerts if you don't check in- **SOS alerts**: Send location and evidence to authorities/NGOs

- **Emergency contacts**: Pre-configured trusted contacts- **Dead man's switch**: Automatic alerts if you don't check in

- **Location tracking**: GPS coordinates included in alerts- **Emergency contacts**: Pre-configured trusted contacts

- **Location tracking**: GPS coordinates included in alerts

### Cross-Platform Access

- **Device recovery**: Access your account from any device### 🔄 **Cross-Platform Access**

- **Secure sync**: Account data synchronized across devices- **Device recovery**: Access your account from any device

- **Backup protection**: Multiple recovery methods available- **Secure sync**: Account data synchronized across devices

- **Session management**: Secure login/logout with timeout- **Backup protection**: Multiple recovery methods available

- **Session management**: Secure login/logout with timeout

---

---

## Architecture

## 🏗️ Architecture

### System Components

### **System Components**

```

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐```

│   React Frontend │    │  Express Backend │    │ Polygon zkEVM   │┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐

│                 │    │                  │    │   Blockchain    ││   React Frontend │    │  Express Backend │    │ Polygon zkEVM   │

│ • File Upload   │    │ • User Accounts  │    │                 ││                 │    │                  │    │   Blockchain    │

│ • Encryption    │────│ • Evidence API   │────│ • Evidence      ││ • File Upload   │    │ • User Accounts  │    │                 │

│ • Wallet Mgmt   │    │ • Emergency API  │    │   Anchoring     ││ • Encryption    │────│ • Evidence API   │────│ • Evidence      │

│ • Blockchain    │    │ • Wallet Funding │    │ • Verification  ││ • Wallet Mgmt   │    │ • Emergency API  │    │   Anchoring     │

└─────────────────┘    └──────────────────┘    └─────────────────┘│ • Blockchain    │    │ • Wallet Funding │    │ • Verification  │

         │                       │                       │└─────────────────┘    └──────────────────┘    └─────────────────┘

         │              ┌────────▼────────┐             │         │                       │                       │

         │              │    MongoDB      │             │         │              ┌────────▼────────┐             │

         │              │                 │             │         │              │    MongoDB      │             │

         └──────────────│ • User Data     │─────────────┘         │              │                 │             │

                        │ • Evidence Meta │         └──────────────│ • User Data     │─────────────┘

                        │ • Emergency Log │                        │ • Evidence Meta │

                        └─────────────────┘                        │ • Emergency Log │

                                 │                        └─────────────────┘

                        ┌────────▼────────┐```

                        │  Filebase IPFS  │

                        │                 │### **Security Flow**

                        │ • S3 Storage    │

                        │ • IPFS Pinning  │```

                        │ • CID Retrieval │User Passphrase → Wallet (Blockchain) + Master Key (Encryption)

                        └─────────────────┘                      │                      │

```                      ▼                      ▼

              Blockchain Signing      Shamir Secret Sharing

### Security Flow                      │                      │

                      ▼                      ▼

```               Evidence Anchoring     Shard A (Client)

User Passphrase → Wallet (Blockchain) + Master Key (Encryption)                      │               Shard B (Server)

                      │                      │                      ▼               Shard C (NGO/KMS)

                      ▼                      ▼              Immutable Proof              │

              Blockchain Signing      Shamir Secret Sharing                                          ▼

                      │                      │                                  File Encryption/Decryption

                      ▼                      ▼```

               Evidence Anchoring     Shard A (Client)

                      │               Shard B (Server)---

                      ▼               Shard C (NGO/KMS)

              Immutable Proof              │## 🚀 Quick Start

                                          ▼

                                  File Encryption/Decryption### Prerequisites

```- Node.js 16+ and npm

- MongoDB (local or Atlas)

---- Git



## Quick Start### 1-Minute Setup



### Prerequisites```bash

- **Node.js**: 16.0.0 or higher# Clone the repository

- **MongoDB**: 4.4 or higher (local or MongoDB Atlas)git clone https://github.com/Boombaybay12334/Aegis-WomenSafety.git

- **WSL2**: Required for blockchain components (Windows users only)cd Aegis-WomenSafety

- **Git**: For cloning the repository

# Install and start backend

### One-Minute Setupcd backend

npm install

```bashnpm start

# Clone the repository

git clone https://github.com/Boombaybay12334/Aegis-WomenSafety.git# Install and start frontend (new terminal)

cd Aegis-WomenSafetycd ../my-frontend

npm install

# Install and start backendnpm run dev

cd backend

npm install# Start blockchain network (new terminal - WSL2 required for Windows)

npm start# Windows users: Open WSL2 terminal first

wsl  # (if on Windows)

# Install and start frontend (new terminal)cd ~/blockchain/aegis-blockchain  # (WSL path)

cd ../frontend# OR for Mac/Linux users:

npm install# cd ../blockchain/aegis-blockchain

npm run devnpm install

```npx hardhat node



**IMPORTANT FOR BLOCKCHAIN**: See [Blockchain Setup](#blockchain-setup-wsl2-for-windows) section below for complete blockchain setup instructions.# Deploy smart contract (new WSL2/terminal)

# Windows users: Another WSL2 terminal

Access the application at `http://localhost:5173`wsl  # (if on Windows)

cd ~/blockchain/aegis-blockchain

---npx hardhat run scripts/deploy.js --network localhost

```

## Project Structure

Access the application at `http://localhost:5173`

```

Aegis-WomenSafety/---

├── README.md                          # This file

├── .gitignore                         # Git ignore rules## 📁 Project Structure

├── backend/                           # Express.js backend

│   ├── config/                        # Configuration files```

│   │   ├── database.js                # MongoDB configurationAegis-WomenSafety/

│   │   └── blockchain.js              # Blockchain configuration├── 📄 README.md                          # This file

│   ├── models/                        # MongoDB models├── 📄 *.md                               # Documentation files

│   │   ├── User.js                    # User account model├── 🗂️ backend/                           # Express.js backend

│   │   ├── Evidence.js                # Evidence storage model│   ├── 🗂️ config/                        # Configuration files

│   │   └── SOS.js                     # Emergency alerts model│   │   ├── 📄 database.js                # MongoDB configuration

│   ├── routes/                        # API endpoints│   │   └── 📄 blockchain.js              # Blockchain configuration

│   │   ├── account.js                 # Account management APIs│   ├── 🗂️ models/                        # MongoDB models

│   │   ├── evidence.js                # Evidence upload/retrieval APIs│   │   ├── 📄 User.js                    # User account model

│   │   └── emergency.js               # Emergency/SOS APIs│   │   ├── 📄 Evidence.js                # Evidence storage model

│   ├── services/                      # Business logic services│   │   └── 📄 SOS.js                     # Emergency alerts model

│   │   ├── blockchainService.js       # Blockchain interaction│   ├── 🗂️ routes/                        # API endpoints

│   │   ├── filebaseService.js         # Filebase IPFS/S3 storage│   │   ├── 📄 account.js                 # Account management APIs

│   │   ├── mockKMS.js                 # Key management simulation│   │   ├── 📄 evidence.js                # Evidence upload/retrieval APIs

│   │   └── mockNGO.js                 # NGO integration simulation│   │   └── 📄 emergency.js               # Emergency/SOS APIs

│   ├── middleware/                    # Express middleware│   ├── 🗂️ services/                      # Business logic services

│   │   └── rateLimiter.js             # API rate limiting│   │   ├── 📄 blockchainService.js       # Blockchain interaction

│   ├── data/                          # Data storage│   │   ├── 📄 mockKMS.js                 # Key management simulation

│   │   └── ngo-shards.json            # NGO shard storage (mock)│   │   └── 📄 mockNGO.js                 # NGO integration simulation

│   ├── test-blockchain-retrieval.js   # Test script for blockchain verification│   ├── 🗂️ middleware/                    # Express middleware

│   ├── server.js                      # Main server file│   │   └── 📄 rateLimiter.js             # API rate limiting

│   ├── package.json                   # Backend dependencies│   ├── 📄 server.js                      # Main server file

│   ├── .env                           # Environment variables (DO NOT COMMIT)│   ├── 📄 package.json                   # Backend dependencies

│   └── .gitignore                     # Backend-specific ignore rules│   └── 📄 .env                           # Environment variables

├── frontend/                          # React.js frontend├── 🗂️ my-frontend/                       # React.js frontend

│   ├── src/│   ├── 🗂️ src/

│   │   ├── components/                # React components│   │   ├── 🗂️ components/                # React components

│   │   │   ├── HomePage.jsx           # Landing page│   │   │   ├── 📄 HomePage.jsx           # Landing page

│   │   │   ├── CreateAccount.jsx      # Account creation│   │   │   ├── 📄 CreateAccount.jsx      # Account creation

│   │   │   ├── LoginScreen.jsx        # Login interface│   │   │   ├── 📄 LoginScreen.jsx        # Login interface

│   │   │   ├── Dashboard.jsx          # Main dashboard│   │   │   ├── 📄 Dashboard.jsx          # Main dashboard

│   │   │   ├── UploadEvidence.jsx     # Evidence upload│   │   │   ├── 📄 UploadEvidence.jsx     # Evidence upload

│   │   │   ├── EmergencySOS.jsx       # Emergency alerts│   │   │   ├── 📄 EmergencySOS.jsx       # Emergency alerts

│   │   │   ├── Settings.jsx           # User settings│   │   │   └── 📄 Settings.jsx           # User settings

│   │   │   ├── Navbar.jsx             # Navigation bar│   │   ├── 🗂️ services/                  # Frontend services

│   │   │   └── ProtectedRoute.jsx     # Route protection│   │   │   ├── 📄 accountService.js      # Account management

│   │   ├── services/                  # Frontend services│   │   │   ├── 📄 cryptoService.js       # Encryption/decryption

│   │   │   ├── accountService.js      # Account management│   │   │   ├── 📄 evidenceService.js     # Evidence handling

│   │   │   ├── cryptoService.js       # Encryption/decryption│   │   │   ├── 📄 blockchainService.js   # Blockchain interaction

│   │   │   ├── evidenceService.js     # Evidence handling│   │   │   ├── 📄 apiService.js          # Backend API calls

│   │   │   ├── blockchainService.js   # Blockchain interaction│   │   │   └── 📄 sosService.js          # Emergency services

│   │   │   ├── apiService.js          # Backend API calls│   │   ├── 🗂️ config/                    # Configuration files

│   │   │   └── sosService.js          # Emergency services│   │   │   └── 📄 blockchain.js          # Blockchain configuration

│   │   ├── config/                    # Configuration files│   │   └── 🗂️ utils/                     # Utility functions

│   │   │   └── blockchain.js          # Blockchain configuration│   │       └── 📄 deadManSwitch.js       # Auto-emergency system

│   │   ├── utils/                     # Utility functions│   ├── 📄 package.json                   # Frontend dependencies

│   │   │   └── deadManSwitch.js       # Auto-emergency system│   └── 📄 vite.config.js                 # Vite build configuration

│   │   ├── styles/                    # CSS styles└── 🗂️ blockchain/                        # Blockchain components

│   │   │   └── HomePage.css           # Homepage styles    └── 🗂️ aegis-blockchain/              # Hardhat project

│   │   ├── App.jsx                    # Main React component        ├── 🗂️ contracts/                 # Smart contracts

│   │   ├── App.css                    # App styles        │   └── 📄 EvidenceAnchor.sol     # Evidence anchoring contract

│   │   ├── main.jsx                   # React entry point        ├── 🗂️ scripts/                   # Deployment scripts

│   │   └── index.css                  # Global styles        │   ├── 📄 deploy.js              # Contract deployment

│   ├── public/                        # Static assets        │   └── 📄 interact.js            # Contract interaction examples

│   ├── index.html                     # HTML template        ├── 🗂️ test/                      # Contract tests

│   ├── package.json                   # Frontend dependencies        │   └── 📄 EvidenceAnchor.test.js # Contract test suite

│   ├── vite.config.js                 # Vite build configuration        ├── 📄 hardhat.config.js          # Hardhat configuration

│   └── .gitignore                     # Frontend-specific ignore rules        ├── 📄 deployment.json            # Deployed contract addresses

├── blockchain/                        # Blockchain components        └── 📄 package.json               # Blockchain dependencies

│   ├── contracts/                     # Smart contracts```

│   │   └── EvidenceAnchor.sol         # Evidence anchoring contract

│   ├── scripts/                       # Deployment scripts---

│   │   ├── deploy.js                  # Contract deployment

│   │   └── interact.js                # Contract interaction examples## 🔧 Installation

│   ├── test/                          # Contract tests

│   │   └── EvidenceAnchor.test.js     # Contract test suite### System Requirements

│   ├── artifacts/                     # Compiled contracts (generated)- **Node.js**: 16.0.0 or higher

│   ├── cache/                         # Hardhat cache (generated)- **MongoDB**: 4.4 or higher

│   ├── hardhat.config.js              # Hardhat configuration- **WSL2**: Required for blockchain components (Windows users)

│   ├── deployment.json                # Deployed contract addresses- **RAM**: 4GB minimum, 8GB recommended

│   ├── package.json                   # Blockchain dependencies- **Storage**: 2GB free space

│   └── .gitignore                     # Blockchain-specific ignore rules- **OS**: Windows 10+ (with WSL2), macOS 10.15+, Ubuntu 18.04+

└── blockchaininfo/                    # Blockchain metadata

    └── contractInfo.json              # Contract ABI and addresses### ⚠️ **Important for Windows Users**

```

The blockchain components **must be run in WSL2** for proper functionality. Before proceeding:

---

1. **Install WSL2**: Follow [Microsoft's WSL2 installation guide](https://docs.microsoft.com/en-us/windows/wsl/install)

## Installation & Setup2. **Install Ubuntu**: `wsl --install -d Ubuntu` 

3. **Copy blockchain folder to WSL**:

### System Requirements   ```bash

- **Node.js**: 16.0.0 or higher   # From Windows PowerShell

- **npm**: 7.0.0 or higher   wsl

- **MongoDB**: 4.4 or higher   cd ~

- **WSL2**: Required for blockchain (Windows users only)   cp -r /mnt/c/Users/[YourUsername]/Desktop/Aegis-WomenSafety/blockchain ./

- **RAM**: 4GB minimum, 8GB recommended   ```

- **Storage**: 2GB free space4. **Install Node.js in WSL**:

   ```bash

### Step 1: Clone Repository   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

   sudo apt-get install -y nodejs

```bash   ```

git clone https://github.com/Boombaybay12334/Aegis-WomenSafety.git

cd Aegis-WomenSafetyAll blockchain commands below should be run in WSL2, not Windows Command Prompt or PowerShell.

```

### Detailed Installation

### Step 2: Backend Setup

#### 1. Clone Repository

```bash```bash

cd backendgit clone https://github.com/Boombaybay12334/Aegis-WomenSafety.git

cd Aegis-WomenSafety

# Install dependencies```

npm install

#### 2. Backend Setup

# The .env file already exists, but you need to configure it```bash

# See "Environment Configuration" section belowcd backend

```

# Install dependencies

### Step 3: Frontend Setupnpm install



```bash# Install additional blockchain dependencies

cd frontendnpm install ethers@5.7.2



# Install dependencies# Set up environment

npm install# Edit the existing .env file and add Filebase credentials



# No additional configuration needed# Configure Filebase (Optional but Recommended)

# Frontend reads blockchain config from blockchaininfo/contractInfo.json# 1. Sign up at https://filebase.com/ (5GB free)

```# 2. Create a bucket with IPFS storage

# 3. Get Access Key and Secret Key

### Step 4: MongoDB Setup# 4. Add to .env:

#    FILEBASE_ACCESS_KEY=your_key_here

**Option A: Local MongoDB**#    FILEBASE_SECRET_KEY=your_secret_here

```bash#    FILEBASE_BUCKET=aegis-evidence

# Install MongoDB locally# See QUICK_SETUP_FILEBASE.md for detailed instructions

# Windows: Download from https://www.mongodb.com/try/download/community

# Mac: brew install mongodb-community# Start MongoDB (if local)

# Linux: sudo apt-get install mongodbmongod



# Start MongoDB# Start backend server

mongodnpm start

# or for development

# MongoDB will run on mongodb://localhost:27017npm run dev

``````



**Option B: MongoDB Atlas (Cloud)**#### 3. Frontend Setup

```bash```bash

# 1. Sign up at https://www.mongodb.com/cloud/atlascd my-frontend

# 2. Create a free cluster

# 3. Get connection string# Install dependencies

# 4. Update MONGODB_URI in backend/.envnpm install

```

# Install blockchain dependencies (already included in package.json)

---# ethers@5.7.2 is now included



## Environment Configuration# Start development server

npm run dev

### Backend Environment Variables

# Build for production

The backend uses a `.env` file for configuration. A sample `.env` file already exists at `backend/.env`.npm run build

```

**IMPORTANT**: The `.env` file contains sensitive credentials. Never commit this file to Git!

#### 4. Blockchain Setup (WSL2 Required for Windows)

#### Sample .env Configuration

**Windows Users - Copy to WSL2 First:**

```env```bash

# =====================================================# Open WSL2 terminal

# SERVER CONFIGURATIONwsl

# =====================================================

PORT=5000# Navigate to home directory and copy blockchain folder

NODE_ENV=developmentcd ~

FRONTEND_URL=http://localhost:5173cp -r /mnt/c/Users/[YourUsername]/Desktop/Aegis-WomenSafety/blockchain ./



# =====================================================# Install Node.js if not already installed

# DATABASE CONFIGURATIONcurl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# =====================================================sudo apt-get install -y nodejs

# Local MongoDB```

MONGODB_URI=mongodb://localhost:27017/aegis

**All Users - Run in WSL2 (Windows) or Terminal (Mac/Linux):**

# OR MongoDB Atlas (Cloud)```bash

# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aegis?retryWrites=true&w=majority# Navigate to blockchain directory

cd ~/blockchain/aegis-blockchain  # WSL2 path for Windows

# =====================================================# OR

# BLOCKCHAIN CONFIGURATIONcd blockchain/aegis-blockchain    # Direct path for Mac/Linux

# =====================================================

# RPC URL for blockchain connection# Install Hardhat and dependencies

# For local development (Hardhat)npm install

BLOCKCHAIN_RPC_URL=http://localhost:8545

# Start local blockchain network

# For production (Polygon zkEVM)npx hardhat node

# BLOCKCHAIN_RPC_URL=https://zkevm-rpc.com

# Deploy contracts (in another WSL2/terminal)

BLOCKCHAIN_NETWORK=localhostnpx hardhat run scripts/deploy.js --network localhost

ENABLE_BLOCKCHAIN=true

ENABLE_WALLET_FUNDING=true# Run tests

npx hardhat test

# =====================================================```

# WALLET FUNDING CONFIGURATION

# =====================================================**Important**: The blockchain network must remain running in WSL2 for the entire application to function properly.

# Private key for funding user wallets

# DEFAULT: Hardhat's first default account (10,000 ETH)---

# WARNING: Change this for production!

FUNDING_WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80## ⚙️ Configuration



# Target balance to maintain in user wallets (in ETH)### Backend Configuration (`.env`)

TARGET_WALLET_BALANCE=1

```env

# Minimum balance before triggering auto-funding (in ETH)# Server Configuration

MIN_BALANCE_THRESHOLD=1PORT=5000

NODE_ENV=development

# Minimum balance required before anchoring evidence (in ETH)FRONTEND_URL=http://localhost:5173

MIN_BALANCE_FOR_ANCHORING=0.5

# Database

# =====================================================MONGODB_URI=mongodb://localhost:27017/aegis

# FILEBASE CONFIGURATION (S3 + IPFS Storage)

# =====================================================# Blockchain Configuration

# Get credentials from https://filebase.com/ (5GB free tier)BLOCKCHAIN_RPC_URL=http://localhost:8545

# 1. Sign up and create a bucket with IPFS storageBLOCKCHAIN_NETWORK=localhost

# 2. Go to Dashboard > Access Keys > Create Access KeyENABLE_BLOCKCHAIN=true

# 3. Add your credentials below (or leave empty to use mock mode)ENABLE_WALLET_FUNDING=true



FILEBASE_ACCESS_KEY=your_filebase_access_key_here# Wallet Funding (10,000 ETH in local network)

FILEBASE_SECRET_KEY=your_filebase_secret_key_hereFUNDING_WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

FILEBASE_BUCKET=aegis-evidenceFUNDING_AMOUNT=0.001

FILEBASE_ENDPOINT=https://s3.filebase.comMIN_BALANCE_THRESHOLD=0.0005



# =====================================================# Mock Services

# MOCK SERVICES (For Development/Testing)MOCK_KMS_ENABLED=true

# =====================================================MOCK_NGO_ENABLED=true

# Set to true to enable mock KMS and NGO services```

MOCK_KMS_ENABLED=true

MOCK_NGO_ENABLED=true### Frontend Configuration

```

The frontend automatically reads blockchain configuration from:

#### Setting Up Filebase (Optional but Recommended)- `src/config/blockchain.js` - Contract addresses and network settings

- `blockchain/aegis-blockchain/deployment.json` - Deployed contract addresses

Filebase provides S3-compatible storage with automatic IPFS pinning:

### Production Configuration

1. **Sign up**: Go to https://filebase.com/ (5GB free tier)

2. **Create bucket**: For production deployment:

   - Name: `aegis-evidence`

   - Storage: Select "IPFS"1. **Update RPC URLs** to Polygon zkEVM mainnet

3. **Get credentials**:2. **Replace funding wallet** with production wallet

   - Dashboard > Access Keys > Create Access Key3. **Set secure MongoDB URI** (MongoDB Atlas recommended)

   - Copy Access Key ID and Secret Access Key4. **Enable HTTPS** for all endpoints

4. **Update .env**:5. **Update CORS settings** for production domains

   ```env

   FILEBASE_ACCESS_KEY=FB_YOUR_ACCESS_KEY---

   FILEBASE_SECRET_KEY=YOUR_SECRET_KEY

   FILEBASE_BUCKET=aegis-evidence## 🔗 Blockchain Integration

   FILEBASE_ENDPOINT=https://s3.filebase.com

   ```### Smart Contract: EvidenceAnchor.sol



**Without Filebase**: The system will use mock mode and store encrypted files in MongoDB (less scalable but functional).The platform uses a custom smart contract for evidence anchoring:



---```solidity

function anchorEvidence(

## Blockchain Setup (WSL2 for Windows)    bytes32 evidenceId,    // Unique evidence identifier

    bytes32 merkleRoot,    // Hash of evidence content

### Why WSL2 for Windows Users?    bytes32 cidRoot,       // IPFS CID (future use)

    bytes32 s3Key,         // Storage key (future use)

The blockchain components (Hardhat local network) **must run in WSL2** on Windows due to:    bytes32 policyId       // Privacy policy identifier

- Network binding issues with Windows) external

- File system compatibility```

- Better performance and stability

### Blockchain Networks

**Mac and Linux users** can skip the WSL2 setup and run blockchain commands directly in their terminal.

#### Development (Default)

### Windows Users: WSL2 Setup- **Network**: Hardhat Local

- **RPC**: `http://localhost:8545`

#### Step 1: Install WSL2- **Chain ID**: 31337

- **Native Token**: ETH (test)

```powershell

# Open PowerShell as Administrator and run:#### Production Options

wsl --install- **Polygon zkEVM Mainnet**: Chain ID 1101

- **Polygon zkEVM Testnet**: Chain ID 1442

# Or install specific distribution:- **RPC URLs**: Configured in `blockchain.js`

wsl --install -d Ubuntu

### Wallet Funding System

# Restart your computer when prompted

```The platform automatically funds user wallets for blockchain transactions:



#### Step 2: Set Up Ubuntu in WSL21. **Check Balance**: Before evidence upload

2. **Fund if Needed**: Send 0.001 ETH if balance < 0.0005 ETH

```bash3. **Track Transactions**: All funding recorded in logs

# After restart, Ubuntu will open automatically4. **Graceful Failure**: Evidence upload continues even if funding fails

# Create a username and password when prompted

### Gas Optimization

# Update packages

sudo apt update && sudo apt upgrade -y- **Evidence Anchoring**: ~100,000 gas

```- **Wallet Funding**: 21,000 gas

- **Automatic Estimation**: Dynamic gas price calculation

#### Step 3: Install Node.js in WSL2- **Error Recovery**: Retry logic for failed transactions



```bash---

# Install Node.js 18.x

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -## 🔐 Security Features

sudo apt-get install -y nodejs

### Zero-Knowledge Architecture

# Verify installation

node --version  # Should show v18.x or higher```

npm --version   # Should show 9.x or higherPassphrase (Client Only) ──┬── Wallet Private Key ──► Blockchain Signing

```                           └── Master Key ──┬── Shard A (localStorage)

                                             ├── Shard B (Backend)

#### Step 4: Copy Blockchain Folder to WSL2                                             └── Shard C (NGO/KMS)

```

**Method A: Copy from Windows to WSL2**

```bash### Encryption Layers

# In WSL2 terminal

cd ~1. **File Encryption**: AES-256 with master key

cp -r /mnt/c/Users/[YourUsername]/Desktop/Aegis-WomenSafety/blockchain ./blockchain2. **Shard Encryption**: Individual shards encrypted

3. **Transport Security**: HTTPS/WSS for all communications

# Example:4. **Storage Encryption**: MongoDB encryption at rest

# cp -r /mnt/c/Users/John/Desktop/Aegis-WomenSafety/blockchain ./blockchain

```### Security Principles



**Method B: Clone Repository in WSL2**- **No Plaintext Storage**: All sensitive data encrypted

```bash- **Key Separation**: Encryption and signing keys separate

# In WSL2 terminal- **Minimal Backend Trust**: Backend cannot decrypt user data

cd ~- **Blockchain Immutability**: Evidence tampering impossible

git clone https://github.com/Boombaybay12334/Aegis-WomenSafety.git- **Decentralized Recovery**: Multiple recovery paths

cd Aegis-WomenSafety/blockchain- **Session Security**: Automatic timeout and cleanup

```

### Threat Mitigation

### Blockchain Setup (All Platforms)

| Threat | Mitigation |

#### Step 1: Install Dependencies|--------|------------|

| Server Breach | Zero-knowledge architecture, no plaintext data |

**Windows (in WSL2 terminal):**| Key Loss | Shamir's Secret Sharing with multiple shards |

```bash| Evidence Tampering | Blockchain anchoring with cryptographic proof |

wsl  # Open WSL2 if not already open| Platform Shutdown | Decentralized storage, user owns keys |

cd ~/blockchain  # or ~/Aegis-WomenSafety/blockchain| Legal Pressure | Cannot decrypt data we don't have keys for |

npm install| Device Theft | Passphrase required, automatic session timeout |

```

---

**Mac/Linux:**

```bash## 📱 Usage Guide

cd blockchain

npm install### Creating an Account

```

1. **Choose Strong Passphrase**: 12+ characters, mix of letters, numbers, symbols

#### Step 2: Start Local Blockchain Network2. **Create Account**: System generates wallet address from passphrase

3. **Backup Reminder**: Write down passphrase securely

**Windows (WSL2 terminal):**4. **Account Created**: Ready to upload evidence

```bash

wsl### Uploading Evidence

cd ~/blockchain

npx hardhat node1. **Select Files**: Choose photos, videos, audio, documents

```2. **Optional Description**: Add context and details

3. **Steganography Option**: Hide evidence inside cover image

**Mac/Linux:**4. **Automatic Process**:

```bash   - Files encrypted with your master key

cd blockchain   - Evidence anchored to blockchain

npx hardhat node   - Metadata stored in database

```   - Wallet funded for future transactions



**Expected Output:**### Emergency Features

```

Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/#### SOS Alerts

1. **Immediate Alert**: Red SOS button sends instant alert

Accounts2. **Location Included**: GPS coordinates attached

========3. **Evidence Included**: Recent evidence sent with alert

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)4. **Multiple Recipients**: Authorities, NGOs, emergency contacts

Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

...#### Dead Man's Switch

```1. **Set Check-in Period**: Choose 24h, 48h, or 72h

2. **Automatic Monitoring**: System tracks your activity

**IMPORTANT**: Keep this terminal running! The blockchain network must stay active.3. **Warning Notifications**: Alerts before triggering

4. **Auto-Emergency**: Sends SOS if you don't check in

#### Step 3: Deploy Smart Contract

### Cross-Device Access

Open a **new terminal** (WSL2 for Windows, regular terminal for Mac/Linux):

1. **Same Device**: Use stored encrypted data

**Windows (new WSL2 terminal):**2. **New Device**: Account recovery process

```bash3. **Enter Passphrase**: Reconstructs wallet and keys

wsl4. **Download Shards**: Retrieves encrypted shards from backend

cd ~/blockchain5. **Full Access**: All evidence and settings available

npx hardhat run scripts/deploy.js --network localhost

```---



**Mac/Linux:**## 🧪 Testing

```bash

cd blockchain### Running Tests

npx hardhat run scripts/deploy.js --network localhost

```#### Backend Tests

```bash

**Expected Output:**cd backend

```npm test

Deploying EvidenceAnchor...

# Test specific components

Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3npm run test:models

Network: localhostnpm run test:routes

Chain ID: 31337npm run test:blockchain

```

Saved to deployment.json

```#### Frontend Tests

```bash

#### Step 4: Verify Contract Deploymentcd my-frontend

npm test

The deployment creates/updates two files:

- `blockchain/deployment.json` - Contract address and metadata# Run with coverage

- `blockchaininfo/contractInfo.json` - Contract ABI and address (used by backend/frontend)npm run test:coverage

```

**Check the contract address:**

```bash#### Blockchain Tests (Run in WSL2 for Windows)

# Windows (WSL2)```bash

cat ~/blockchain/deployment.json# Windows users: Open WSL2 terminal

wsl

# Mac/Linuxcd ~/blockchain/aegis-blockchain

cat blockchain/deployment.json

```# Mac/Linux users:

cd blockchain/aegis-blockchain

You should see:

```jsonnpx hardhat test

{

  "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",# Test with gas reporting

  "network": "localhost",npx hardhat test --gas-reporter

  "chainId": "31337",

  "timestamp": "2025-10-14T..."# Test specific contract

}npx hardhat test test/EvidenceAnchor.test.js

``````



#### Step 5: Run Backend and Frontend### Manual Testing



Now that the blockchain is running, start the backend and frontend in **separate terminals** (use Windows terminal, not WSL2):#### Evidence Upload Flow

1. Create account with test passphrase

**Terminal 1: Backend (Windows/Mac/Linux)**2. Upload sample files (images, documents)

```bash3. Verify blockchain anchoring in console

cd backend4. Check MongoDB for evidence record

npm start5. Verify wallet funding transaction

```

#### Emergency System

**Terminal 2: Frontend (Windows/Mac/Linux)**1. Set up dead man's switch (short interval for testing)

```bash2. Test manual SOS alert

cd frontend3. Verify NGO/authority notifications

npm run dev4. Test auto-trigger functionality

```

#### Cross-Device Recovery

### Blockchain Network Summary1. Create account on Device A

2. Upload evidence

You should have **3 terminals running**:3. Access account from Device B

4. Verify evidence retrieval

1. **WSL2/Terminal 1**: Hardhat node (`npx hardhat node`)5. Test passphrase recovery

2. **Terminal 2**: Backend server (`npm start`)

3. **Terminal 3**: Frontend dev server (`npm run dev`)### Test Data



---Sample test accounts and data available in:

- `backend/test/fixtures/` - Test user accounts

## Blockchain Integration- `my-frontend/src/test/` - Sample evidence files

- `blockchain/test/` - Contract test data

### Smart Contract: EvidenceAnchor.sol

---

The platform uses a custom Solidity smart contract for evidence anchoring:

## 🚢 Deployment

```solidity

function anchorEvidence(### Local Development

    bytes32 evidenceId,    // Unique evidence identifier

    bytes32 merkleRoot,    // Hash of evidence contentAlready covered in [Quick Start](#-quick-start) section.

    bytes32 cidRoot,       // IPFS CID from Filebase

    bytes32 s3Key,         // S3 storage key from Filebase### Production Deployment

    bytes32 policyId       // Privacy policy identifier

) external#### 1. MongoDB Atlas Setup

``````bash

# Create MongoDB Atlas cluster

### Contract Functions# Get connection string

# Update MONGODB_URI in .env

- **anchorEvidence()**: Store evidence hash and metadata on blockchain```

- **verifyEvidence()**: Retrieve evidence details by ID

- **getUserAnchors()**: Get all evidence IDs for a wallet address#### 2. Polygon zkEVM Configuration

- **anchors()**: Public mapping to query evidence data```env

# Update .env for production

### Blockchain NetworksBLOCKCHAIN_RPC_URL=https://zkevm-rpc.com

BLOCKCHAIN_NETWORK=polygon_zkevm

#### Development (Default)FUNDING_WALLET_PRIVATE_KEY=your_production_private_key

- **Network**: Hardhat Local```

- **RPC**: `http://localhost:8545`

- **Chain ID**: 31337#### 3. Backend Deployment (Heroku/AWS/DigitalOcean)

- **Native Token**: ETH (test)```bash

- **Pre-funded Accounts**: 10 accounts with 10,000 ETH each# Build and deploy backend

cd backend

#### Production (Future)npm run build

- **Polygon zkEVM Mainnet**: Chain ID 1101# Deploy to your platform of choice

- **Polygon zkEVM Testnet (Cardona)**: Chain ID 2442```

- **Configuration**: Update `BLOCKCHAIN_RPC_URL` in `.env`

#### 4. Frontend Deployment (Vercel/Netlify)

### Wallet Funding System```bash

# Build frontend

AEGIS automatically funds user wallets to pay for blockchain transactions:cd my-frontend

npm run build

1. **Check Balance**: Before evidence upload

2. **Auto-Fund**: Send ETH if balance below threshold# Deploy dist/ folder to hosting platform

3. **Configurable**: Set amounts in `.env````

4. **Transparent**: All funding logged

#### 5. Smart Contract Deployment (WSL2 Required for Windows)

**Configuration:**```bash

```env# Deploy to Polygon zkEVM mainnet

FUNDING_WALLET_PRIVATE_KEY=0xac09...  # Funder wallet# Windows users: Use WSL2 terminal

TARGET_WALLET_BALANCE=1               # Target balance (ETH)wsl

MIN_BALANCE_THRESHOLD=1               # Trigger funding when belowcd ~/blockchain/aegis-blockchain

MIN_BALANCE_FOR_ANCHORING=0.5         # Required for anchoring

```# Mac/Linux users:

cd blockchain/aegis-blockchain

### Gas Costs

npx hardhat run scripts/deploy.js --network polygon_zkevm

Approximate gas costs on local network:

- **Evidence Anchoring**: ~100,000 gas# Update deployment.json with new addresses

- **Wallet Funding**: 21,000 gas# Commit and push changes

- **Evidence Verification**: ~50,000 gas (read-only)```



---### Docker Deployment



## Security Features```bash

# Build and run with Docker Compose

### Zero-Knowledge Architecturedocker-compose up --build



```# Run in production mode

Passphrase (Client Only) ──┬── Wallet Private Key ──► Blockchain Signingdocker-compose -f docker-compose.prod.yml up

                           └── Master Key ──┬── Shard A (localStorage)```

                                             ├── Shard B (Backend)

                                             └── Shard C (NGO/KMS)### Environment-Specific Settings

```

#### Development

**Key Principles:**- Local MongoDB

- Backend **never** receives the passphrase- Hardhat network

- Backend **cannot** decrypt user data- Mock services enabled

- User controls all cryptographic keys- Detailed logging

- No personal information required

#### Staging

### Encryption Layers- MongoDB Atlas

- Polygon zkEVM testnet

1. **File Encryption**: AES-256-CBC with master key- Real NGO integrations

2. **Shard Encryption**: Each shard individually encrypted- Performance monitoring

3. **Transport Security**: All API calls over HTTPS (production)

4. **Storage Encryption**: MongoDB encryption at rest#### Production

- MongoDB Atlas with encryption

### Shamir's Secret Sharing- Polygon zkEVM mainnet

- Production wallet funding

The master encryption key is split into 3 shards:- Security hardening

- **Shard A**: Stored in browser localStorage (client-side)

- **Shard B**: Stored in backend database---

- **Shard C**: Stored with NGO/KMS service (mock in development)



**Recovery**: Any 2 of 3 shards can reconstruct the master key.

### Technical Resources

### Threat Mitigation- **Ethereum Documentation**: https://ethereum.org/developers

- **Polygon zkEVM**: https://zkevm.polygon.technology/

| Threat | Mitigation |- **Hardhat**: https://hardhat.org/

|--------|------------|- **React**: https://reactjs.org/

| Server Breach | Zero-knowledge architecture, no plaintext data |- **MongoDB**: https://docs.mongodb.com/

| Key Loss | Shamir's Secret Sharing with multiple shards |

| Evidence Tampering | Blockchain anchoring with cryptographic proof |---

| Platform Shutdown | Decentralized storage, user owns keys |

| Legal Pressure | Cannot decrypt data without user's passphrase |

| Device Theft | Passphrase required, automatic session timeout |**🛡️ AEGIS - Protecting victims through technology, privacy, and community support**



---*"Technology should empower the vulnerable, not exploit them. AEGIS exists to give domestic abuse victims the tools they need to document abuse, seek help, and rebuild their lives with dignity and safety."*



## Usage Guide**Created by The DUO Team**



### Creating an Account---



1. Navigate to the application (`http://localhost:5173`)**Version**: 1.0.0 | **Last Updated**: October 11, 2025 | **License**: MIT | **Team**: The DUO
2. Click "Create Account"
3. Enter a **strong passphrase** (12+ characters recommended)
4. System generates:
   - Wallet address (from passphrase hash)
   - Master encryption key (from passphrase)
   - Secret shards (distributed automatically)
5. **IMPORTANT**: Write down your passphrase securely
6. Click "Create Account"

**WARNING**: If you lose your passphrase, you **cannot** recover your account or evidence.

### Logging In

1. Click "Login"
2. Enter your passphrase
3. System reconstructs:
   - Wallet private key
   - Master encryption key (from shards)
4. Access granted to dashboard

### Uploading Evidence

1. Go to "Upload Evidence" section
2. Click "Select Files" and choose files (photos, videos, documents, audio)
3. Add optional description
4. Click "Upload"
5. **Automatic Process**:
   - Files encrypted client-side with AES-256
   - Encrypted files uploaded to Filebase (IPFS)
   - IPFS CID and S3 key retrieved
   - Evidence metadata saved to MongoDB
   - Evidence hash anchored to blockchain
   - Your wallet automatically funded if needed

### Viewing Evidence

1. Go to "My Evidence" section
2. All evidence displayed with:
   - Timestamp
   - Description
   - Blockchain anchor status
   - File count
3. Click "View" to see evidence details
4. Files decrypted client-side for viewing

### Emergency SOS

1. Click red "SOS" button (available on all pages)
2. Confirm emergency alert
3. System sends:
   - Your location (GPS)
   - Recent evidence
   - Emergency message
4. Recipients: Pre-configured NGOs and authorities

### Dead Man's Switch

1. Go to "Settings" > "Dead Man's Switch"
2. Enable and set check-in interval (24h, 48h, 72h)
3. System monitors your activity
4. If you don't check in within interval:
   - Warning notification sent
   - If still no response, automatic SOS triggered
5. Check in anytime to reset timer

---

## Testing & Verification

### Quick Test: Evidence Upload Flow

This is the most important test to verify the entire system is working.

#### Step 1: Start All Services

Ensure you have 3 terminals running:
1. **Blockchain**: `npx hardhat node` (in WSL2 for Windows)
2. **Backend**: `npm start` (in backend/)
3. **Frontend**: `npm run dev` (in frontend/)

#### Step 2: Create Test Account

1. Open `http://localhost:5173`
2. Create account with passphrase: `test-account-123`
3. Note the wallet address shown

#### Step 3: Upload Test Evidence

1. Go to "Upload Evidence"
2. Select a small test file (image or document)
3. Add description: "Test evidence upload"
4. Click "Upload"
5. Watch the console logs in **all three terminals**

**Expected Backend Logs:**
```
[Filebase] Uploading to bucket: aegis-evidence
[Filebase] Upload successful: evidence/0x.../file.jpg
[Filebase] Retrieved IPFS CID: bafybei...
[Blockchain] Funding wallet 0x... with 0.001 ETH
[Blockchain] Wallet funded successfully
[Evidence] Anchoring to blockchain...
[Evidence] Evidence anchored successfully: tx hash 0x...
```

**Expected Frontend Console:**
```
[Evidence] Uploading to backend (Filebase storage)...
[Evidence] Upload successful, evidenceId: ...
CID: bafybei...
S3 Key: evidence/0x.../...
[Evidence] Starting blockchain anchoring...
[Blockchain] Anchoring evidence...
[Blockchain] Transaction hash: 0x...
Evidence uploaded successfully!
```

#### Step 4: Verify Blockchain Anchoring

Use the test script to retrieve and verify evidence from blockchain:

**Windows (new Windows terminal, NOT WSL2):**
```powershell
cd backend
node test-blockchain-retrieval.js
```

**Mac/Linux:**
```bash
cd backend
node test-blockchain-retrieval.js
```

**Follow the prompts:**
1. Enter your passphrase: `test-account-123`
2. Enter wallet address (shown in frontend)
3. Script will display all evidence anchored on blockchain

**Expected Output:**
```
Fetching evidence IDs for wallet: 0x...
Found 1 evidence ID(s)

Evidence ID: 0x...
Merkle Root: 0x...
CID Root: 0x... (bafybei...)
S3 Key: 0x... (evidence/...)
Timestamp: 1728936000
Submitter: 0x...
Exists: true

Blockchain verification successful!
```

### Testing Filebase Storage

If you configured Filebase:

1. Login to https://console.filebase.com/
2. Click on your bucket (`aegis-evidence`)
3. Navigate to `evidence/[wallet-address]/[evidence-id]/`
4. You should see your encrypted files
5. Click on a file to view metadata and IPFS CID

### Running Automated Tests

#### Backend Tests
```bash
cd backend
npm test
```

#### Frontend Tests
```bash
cd frontend
npm test
```

#### Blockchain Contract Tests
**Windows (WSL2):**
```bash
wsl
cd ~/blockchain
npx hardhat test
```

**Mac/Linux:**
```bash
cd blockchain
npx hardhat test
```

**Expected Output:**
```
  EvidenceAnchor
    ✓ Should anchor evidence successfully
    ✓ Should verify evidence correctly
    ✓ Should get user anchors
    ✓ Should reject duplicate anchors
    
  4 passing (2s)
```

### Common Issues and Solutions

#### Issue: "Cannot connect to blockchain"
**Solution**: Make sure Hardhat node is running in WSL2 (Windows) or terminal (Mac/Linux)
```bash
# Check if running:
curl http://localhost:8545

# Should return: {"jsonrpc":"2.0","id":...}
```

#### Issue: "Insufficient funds for intrinsic transaction cost"
**Solution**: Your wallet needs to be funded. Check backend logs for auto-funding, or wait a moment and try again.

#### Issue: "Contract not deployed"
**Solution**: Deploy the contract:
```bash
wsl  # Windows only
cd ~/blockchain
npx hardhat run scripts/deploy.js --network localhost
```

#### Issue: "MongoDB connection failed"
**Solution**: Start MongoDB:
```bash
# Windows: Start MongoDB service
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Or use MongoDB Atlas cloud connection string
```

---

## Deployment

### Production Deployment Checklist

#### 1. Backend (Heroku/AWS/DigitalOcean)

```bash
# Update .env for production
NODE_ENV=production
MONGODB_URI=mongodb+srv://...  # MongoDB Atlas
BLOCKCHAIN_RPC_URL=https://zkevm-rpc.com  # Polygon zkEVM mainnet
FUNDING_WALLET_PRIVATE_KEY=your_production_key  # Change from default!
FILEBASE_ACCESS_KEY=...  # Production Filebase account

# Deploy backend
npm run build  # If you have build step
# Deploy to your platform
```

#### 2. Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build

# Deploy dist/ folder to hosting platform
```

#### 3. Smart Contract (Polygon zkEVM)

**Deploy to testnet first:**
```bash
# Update hardhat.config.js with your private key
# Get testnet MATIC from faucet

npx hardhat run scripts/deploy.js --network cardona

# Update blockchaininfo/contractInfo.json with new address
```

**Deploy to mainnet:**
```bash
# Ensure you have MATIC for gas fees
npx hardhat run scripts/deploy.js --network polygon_zkevm

# Update production backend .env with new contract address
```

#### 4. MongoDB Atlas

1. Create production cluster at https://www.mongodb.com/cloud/atlas
2. Enable encryption at rest
3. Configure IP whitelist
4. Create database user
5. Get connection string
6. Update backend `.env`

#### 5. Security Hardening

- Enable HTTPS for all endpoints
- Update CORS settings for production domains
- Rotate all API keys and secrets
- Enable MongoDB encryption
- Set up monitoring and alerts
- Configure backup strategy

---

## License

MIT License

Copyright (c) 2025 The DUO

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

---

**AEGIS - Protecting victims through technology, privacy, and community support**

*"Technology should empower the vulnerable, not exploit them. AEGIS exists to give domestic abuse victims the tools they need to document abuse, seek help, and rebuild their lives with dignity and safety."*

**Created by The DUO Team**

---

**Version**: 1.0.0 | **Last Updated**: October 14, 2025 | **Repository**: https://github.com/Boombaybay12334/Aegis-WomenSafety
