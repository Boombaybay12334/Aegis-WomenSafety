# AEGIS Phase 0 Backend

Anonymous account system with Shamir's Secret Sharing for domestic abuse victims. Implements zero-knowledge architecture where the backend cannot decrypt user data.

## 🔐 Security Architecture

### Critical Security Principles

**❌ NEVER Stored on Backend:**
- User passphrases
- Shard A (always encrypted on client localStorage)
- Master encryption keys  
- Wallet private keys
- Any decrypted user data

**✅ Backend Stores ONLY:**
- Wallet addresses (public identifiers)
- References to Shard B (stored with NGO partners)
- References to Shard C (stored in KMS)
- Cryptographic signatures for verification

### Zero-Knowledge Design

The backend stores 2 of 3 shards (B and C) but **CANNOT** reconstruct the master key alone. Only the client with Shard A + (B or C from backend) can decrypt data.

## 🏗️ Project Structure

```
backend/
├── package.json          # Dependencies and scripts
├── .env                   # Environment configuration
├── .gitignore            # Git ignore rules
├── server.js             # Main server file
├── config/
│   └── database.js       # MongoDB connection
├── models/
│   └── User.js           # User schema (stores only references)
├── routes/
│   └── account.js        # API endpoints with security
├── middleware/
│   └── rateLimiter.js    # Rate limiting for different endpoints
└── services/
    ├── mockKMS.js        # Mock KMS service for Shard C
    └── mockNGO.js        # Mock NGO service for Shard B
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- MongoDB running locally or connection string
- Frontend running on http://localhost:5173

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
```bash
# Copy and edit .env file if needed
# Default settings work for local development
```

3. **Start MongoDB:**
```bash
# Make sure MongoDB is running locally
# Default connection: mongodb://localhost:27017/aegis
```

4. **Run the server:**
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

## 🛡️ API Endpoints

All endpoints implement strict security measures including rate limiting, input validation, and signature verification where required.

### 1. Check Account Availability
```http
POST /api/v1/account/check-availability
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6aC0532D0C8DEDC..."
}
```

**Response:**
```json
{
  "available": true
}
```

**Rate Limit:** 10 requests per minute

### 2. Create Account
```http
POST /api/v1/account/create
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6aC0532D0C8DEDC...",
  "shardB": "1:4adadd1dbc681f...",
  "shardC": "3:1194623cf812a9..."
}
```

**Response:**
```json
{
  "success": true,
  "walletAddress": "0x742d35cc6ac0532d0c8dedc..."
}
```

**Rate Limit:** 5 requests per hour
**Security:** Validates hex format, prevents sensitive data leakage

### 3. Verify Account
```http
POST /api/v1/account/verify
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6aC0532D0C8DEDC..."
}
```

**Response:**
```json
{
  "exists": true,
  "createdAt": "2025-10-10T15:30:00.000Z"
}
```

**Rate Limit:** 20 requests per minute

### 4. Recover Shards (New Device)
```http
POST /api/v1/account/recover-shard
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6aC0532D0C8DEDC...",
  "message": "Aegis account recovery for 0x742d... at 2025-10-10T15:30:00.000Z",
  "signature": "0x8a7b2c3d4e5f6789..."
}
```

**Response:**
```json
{
  "success": true,
  "shardB": "2:b1b3b0a1da2ff2...",
  "shardC": "3:1194623cf812a9..."
}
```

**Rate Limit:** 5 requests per hour
**Security:** 🚨 **MANDATORY signature verification** - proves wallet ownership

### 5. Update Shards (After Recovery)
```http
POST /api/v1/account/update-shards
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6aC0532D0C8DEDC...",
  "shardB": "2:new_shard_b_data...",
  "shardC": "3:new_shard_c_data..."
}
```

**Response:**
```json
{
  "success": true
}
```

**Rate Limit:** 10 requests per 10 minutes

## 📊 Health & Monitoring

### Health Check Endpoint
```http
GET /health
```

**Response includes:**
- Server status and uptime
- Database connection status
- Mock service status
- Anonymized user statistics
- Memory and performance metrics

## 🔒 Security Features

### Rate Limiting
- **Availability Check:** 10 requests/minute
- **Account Creation:** 5 requests/hour (strict)
- **Account Verification:** 20 requests/minute  
- **Recovery:** 5 requests/hour (strict)
- **Shard Updates:** 10 requests/10 minutes
- **General API:** 100 requests/minute

### Input Validation
- Ethereum address format validation
- Hex string format validation for shards
- Prevents injection attacks
- Blocks sensitive data transmission

### Signature Verification
Recovery operations require cryptographic proof of wallet ownership:
```javascript
// Client signs message with wallet private key
const message = `Aegis account recovery for ${address} at ${timestamp}`;
const signature = await wallet.signMessage(message);

// Backend verifies signature proves wallet ownership
const recoveredAddress = ethers.utils.verifyMessage(message, signature);
const isValid = recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
```

### Security Headers
- Content Security Policy
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy

## 🏥 Mock Services

### Mock KMS Service
Simulates AWS KMS for encrypting and storing Shard C:
- `encrypt(walletAddress, shardC)` → Returns `kms_id`
- `decrypt(kms_id)` → Returns `shardC`
- `update(oldKmsId, walletAddress, newShardC)` → Returns `new_kms_id`

### Mock NGO Service  
Simulates NGO partner API for storing Shard B:
- `storeShardB(walletAddress, shardB)` → Returns `ngo_id`
- `retrieveShardB(ngo_id)` → Returns `shardB`
- `updateShardB(oldNgoId, walletAddress, newShardB)` → Returns `new_ngo_id`

## 🧪 Testing the Backend

### 1. Start the Backend
```bash
npm run dev
```

### 2. Test with Frontend
1. Start the frontend: `cd ../my-frontend && npm run dev`
2. Create a new account through the UI
3. Login from same device (uses local Shard A)
4. Clear localStorage and login again (triggers recovery)

### 3. Manual API Testing
```bash
# Check if backend is running
curl http://localhost:5000/health

# Test account creation
curl -X POST http://localhost:5000/api/v1/account/check-availability \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x742d35Cc6aC0532D0C8DEDC6c3B2993f0e99D8F2b"}'
```

## 🔧 Environment Variables

```bash
PORT=5000                                    # Server port
NODE_ENV=development                         # Environment
FRONTEND_URL=http://localhost:5173          # Frontend URL for CORS
MONGODB_URI=mongodb://localhost:27017/aegis # Database connection
MOCK_KMS_ENABLED=true                       # Enable mock KMS
MOCK_NGO_ENABLED=true                       # Enable mock NGO
```

## 📈 Production Deployment

### Replace Mock Services
1. **KMS Service:** Replace with AWS KMS SDK
2. **NGO Service:** Replace with real NGO partner APIs
3. **Database:** Use MongoDB Atlas or production instance
4. **Environment:** Set `NODE_ENV=production`

### Security Hardening
1. **HTTPS Only:** Use SSL certificates
2. **Firewall:** Restrict database access
3. **Monitoring:** Set up logging and alerting
4. **Backup:** Regular database backups
5. **Rate Limiting:** Adjust limits based on usage

## ⚠️ Critical Security Notes

1. **Never Log Sensitive Data:** Passphrases, Shard A, or master keys must never appear in logs
2. **Signature Verification:** Always verify signatures for recovery operations
3. **Rate Limiting:** Essential to prevent abuse attacks
4. **Input Validation:** Prevents injection and malformed data attacks
5. **Zero-Knowledge:** Backend alone cannot decrypt any user data

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Frontend Connection Issues
- Check CORS settings in server.js
- Verify FRONTEND_URL in .env matches your frontend URL
- Ensure both frontend and backend are running

---

**🛡️ AEGIS Backend - Protecting victims through technology**