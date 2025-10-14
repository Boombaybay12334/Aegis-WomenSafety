# Filebase Integration Guide - AEGIS

## Overview
This guide explains how the AEGIS system has been upgraded to use **Filebase** for real S3 and IPFS storage, replacing the previous mock storage system. Now your encrypted evidence files get real IPFS CIDs and S3 keys that are anchored to the blockchain.

---

## What Changed?

### ✅ Backend Changes

1. **New Service: `backend/services/filebaseService.js`**
   - Handles all file uploads to Filebase using AWS S3 SDK
   - Automatically retrieves IPFS CID for each uploaded file
   - Supports mock mode when credentials are not configured (for development)

2. **Updated Model: `backend/models/Evidence.js`**
   - Added `s3Key` and `cid` fields to FileSchema
   - Added `cidRoot` and `s3KeyRoot` to blockchain schema
   - Maintains backward compatibility with legacy `encryptedData` field

3. **Updated Route: `backend/routes/evidence.js`**
   - Uploads encrypted files to Filebase before saving to MongoDB
   - Returns real CID and S3 key in response
   - Falls back to MongoDB storage if Filebase is not configured

4. **Environment Configuration: `backend/.env.example`**
   - Added Filebase credentials section
   - Instructions for setup included

### ✅ Frontend Changes

1. **Updated Flow: `my-frontend/src/services/evidenceService.js`**
   - **NEW FLOW**: Upload to backend first → Get CID/S3 key → Anchor to blockchain
   - **OLD FLOW**: Anchor to blockchain → Upload to backend
   - This ensures blockchain anchors use REAL CID and S3 keys from Filebase

2. **Updated Service: `my-frontend/src/services/blockchainService.js`**
   - Accepts `cidRoot` and `s3KeyRoot` as parameters
   - Uses real values if provided, placeholders otherwise
   - Returns CID and S3 key in blockchain response

---

## Setup Instructions

### Step 1: Create Filebase Account
1. Go to https://filebase.com/
2. Sign up for a free account (5GB free tier)
3. Verify your email

### Step 2: Create Bucket and Get Credentials
1. Log in to Filebase dashboard
2. Click "Buckets" → "Create Bucket"
3. Name it `aegis-evidence` (or your preferred name)
4. Choose **IPFS** as the storage network
5. Click "Create Bucket"

6. Go to "Access Keys" in the left sidebar
7. Click "Create Access Key"
8. Copy the **Access Key ID** and **Secret Access Key**
   - ⚠️ **Save the Secret Key immediately - you cannot view it again!**

### Step 3: Configure Backend Environment
1. Navigate to `backend/` folder
2. Open the existing `.env` file (already present in your project)

3. Add your Filebase credentials to the `.env` file:
   ```env
   # Filebase Configuration (already in .env, just fill in)
   FILEBASE_ACCESS_KEY=your_access_key_here
   FILEBASE_SECRET_KEY=your_secret_key_here
   FILEBASE_BUCKET=aegis-evidence
   FILEBASE_ENDPOINT=https://s3.filebase.com
   ```

4. Fill in other required fields if not already configured (MongoDB URI, blockchain config, etc.)

### Step 4: Install Dependencies
```bash
cd backend
npm install
```

### Step 5: Start the Backend
```bash
cd backend
npm start
```

You should see logs indicating whether Filebase is configured:
- ✅ `[Filebase] Filebase configured, uploading to S3/IPFS...`
- ⚠️ `[Filebase] Filebase not configured, using legacy MongoDB storage`

---

## How It Works

### Upload Flow (New)
```
User uploads evidence
        ↓
Frontend encrypts files with master key
        ↓
Frontend sends encrypted files to backend
        ↓
Backend uploads to Filebase (S3 API)
        ↓
Filebase automatically pins to IPFS
        ↓
Backend retrieves IPFS CID from Filebase
        ↓
Backend stores metadata in MongoDB with CID + S3 key
        ↓
Backend returns CID and S3 key to frontend
        ↓
Frontend anchors to blockchain with REAL CID and S3 key
        ↓
Blockchain stores immutable proof with real references
```

### Storage Locations
1. **Encrypted Files**: Stored in Filebase S3 (also pinned to IPFS)
2. **IPFS CID**: Returned by Filebase, stored in MongoDB and blockchain
3. **S3 Key**: Generated path in Filebase bucket, stored in MongoDB and blockchain
4. **Metadata**: Stored in MongoDB (file info, blockchain tx, etc.)
5. **Blockchain Anchor**: Immutable proof on Ethereum (Holesky testnet)

---

## File Structure in Filebase

Files are organized as:
```
aegis-evidence/  (bucket)
├── evidence/
│   ├── {walletAddress}/
│   │   ├── {evidenceId}/
│   │   │   ├── {timestamp}_{hash}_{filename1}
│   │   │   ├── {timestamp}_{hash}_{filename2}
│   │   │   └── ...
```

Example:
```
aegis-evidence/evidence/0xabcd1234/evidence_abcd1234_1728934567_x9k2p/1728934567_f8a2b3c4_photo.jpg.enc
```

---

## Mock Mode (Development)

If Filebase credentials are **not configured**:
- System runs in **mock mode**
- Files stored in MongoDB (like before)
- Mock CID and S3 keys generated (deterministic based on file content)
- Blockchain anchoring still works with mock values
- **Perfect for development/testing without Filebase account**

To enable mock mode, simply don't set the Filebase credentials in `.env`.

---

## API Response Changes

### Evidence Upload Response (Updated)
```json
{
  "success": true,
  "evidenceId": "evidence_abcd1234_1728934567_x9k2p",
  "filesUploaded": 3,
  "totalSize": 1548672,
  "steganographyEnabled": false,
  "blockchain": {
    "cidRoot": "bafybeihdwdcefgh4kdijkl...",  // ← REAL IPFS CID
    "s3KeyRoot": "evidence/0xabcd.../..."      // ← REAL S3 KEY
  }
}
```

### Evidence Retrieval Response (Updated)
```json
{
  "success": true,
  "evidenceId": "evidence_abcd1234_1728934567_x9k2p",
  "files": [
    {
      "fileName": "photo.jpg",
      "fileType": "image/jpeg",
      "fileSize": 524288,
      "s3Key": "evidence/0x.../evidence_.../1728934567_f8a2b3c4_photo.jpg",
      "cid": "bafybeihdwdcefgh4kdijkl...",
      "timestamp": "2025-10-14T12:34:56.789Z"
    }
  ],
  "blockchain": {
    "anchored": true,
    "txHash": "0x123abc...",
    "blockNumber": 1234567,
    "cidRoot": "bafybeihdwdcefgh4kdijkl...",
    "s3KeyRoot": "evidence/0x.../evidence_.../"
  }
}
```

---

## Backward Compatibility

The system maintains **full backward compatibility**:

1. **Old Evidence (with `encryptedData`)**:
   - Still accessible via API
   - Can be decrypted normally
   - No migration required

2. **New Evidence (with `s3Key` and `cid`)**:
   - Stored in Filebase
   - Retrievable via S3 API or IPFS CID
   - MongoDB only stores metadata

3. **Frontend**:
   - Automatically handles both formats
   - Decryption works the same way
   - No user-facing changes

---

## Testing

### Test Filebase Integration
```bash
cd backend
node -e "const { isFilebaseConfigured } = require('./services/filebaseService'); console.log('Filebase configured:', isFilebaseConfigured());"
```

### Test Evidence Upload
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd my-frontend && npm run dev`
3. Create account and upload evidence
4. Check backend logs for:
   - `✅ [Filebase] Upload successful`
   - `🔗 [Filebase] Retrieved IPFS CID: bafybei...`

### Verify on Filebase Dashboard
1. Go to https://console.filebase.com/
2. Click on your bucket (`aegis-evidence`)
3. Browse to see uploaded files
4. Click on a file to view metadata (including IPFS CID)

---

## Benefits

### 🔒 Security
- Encrypted files stored on decentralized IPFS network
- S3-compatible access with encryption at rest
- Blockchain anchors point to immutable IPFS CIDs

### 💰 Cost
- 5GB free tier (sufficient for thousands of evidence items)
- No egress fees for IPFS retrieval
- Pay only for additional storage beyond free tier

### 🚀 Performance
- S3-compatible API (fast uploads/downloads)
- IPFS pinning for decentralized access
- CDN-like distribution globally

### 🌐 Decentralization
- Files accessible via IPFS gateways
- Not dependent on single cloud provider
- Censorship-resistant storage

---

## Troubleshooting

### Issue: "Filebase not configured" in logs
**Solution**: Check that `.env` has valid `FILEBASE_ACCESS_KEY` and `FILEBASE_SECRET_KEY`

### Issue: "CID not available" warnings
**Solution**: 
- CID retrieval may take 1-2 seconds after upload
- Service automatically retries with delay
- If persistent, check Filebase dashboard for bucket IPFS configuration

### Issue: Upload fails with "Access Denied"
**Solution**:
- Verify Access Key and Secret Key are correct
- Check bucket name matches `.env` configuration
- Ensure bucket exists and is set to IPFS storage

### Issue: Files not appearing in Filebase dashboard
**Solution**:
- Check backend logs for upload errors
- Verify bucket name is correct
- Check AWS SDK connectivity to Filebase endpoint

---

## Next Steps

### Optional Enhancements
1. **Add file download from Filebase**
   - Update retrieval endpoints to fetch from S3/IPFS
   - Provide IPFS gateway links for public access

2. **Implement file deletion**
   - Add endpoint to delete from Filebase when evidence is soft-deleted
   - Update `deleteFromFilebase` usage in routes

3. **Add IPFS gateway support**
   - Allow retrieval via public IPFS gateways
   - Provide multiple gateway options for redundancy

4. **Migrate existing evidence**
   - Script to upload old `encryptedData` to Filebase
   - Update records with CID and S3 key

---

## Security Notes

⚠️ **IMPORTANT**:
1. **Never commit `.env` file to version control**
2. **Keep your Filebase Secret Key secure**
3. **Use different credentials for development and production**
4. **Encrypted files are stored encrypted** - Filebase stores them as-is
5. **Master key reconstruction** is still required to decrypt files

---

## Support

- Filebase Docs: https://docs.filebase.com/
- Filebase Support: https://filebase.com/support
- AEGIS Issues: Contact your development team

---

**Congratulations! Your evidence anchoring now uses real IPFS CIDs and S3 storage! 🎉**
