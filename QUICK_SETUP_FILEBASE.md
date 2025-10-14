# Quick Setup Guide - Filebase Integration

## TL;DR - Get Started in 5 Minutes

### 1. Create Filebase Account (2 min)
```
1. Go to https://filebase.com/
2. Sign up (email verification required)
3. Free tier: 5GB storage with IPFS
```

### 2. Get Credentials (1 min)
```
Dashboard → Access Keys → Create Access Key
📋 Copy Access Key ID
📋 Copy Secret Access Key (SAVE NOW - can't view again!)
```

### 3. Create Bucket (1 min)
```
Dashboard → Buckets → Create Bucket
Name: aegis-evidence
Storage: IPFS ✓
```

### 4. Configure Backend (1 min)
```bash
cd backend
```

Edit `.env` (it already exists!):
```env
# Add to existing .env file:
FILEBASE_ACCESS_KEY=FB_YOUR_ACCESS_KEY_HERE
FILEBASE_SECRET_KEY=FB_YOUR_SECRET_KEY_HERE
FILEBASE_BUCKET=aegis-evidence
FILEBASE_ENDPOINT=https://s3.filebase.com
```

### 5. Run Backend
```bash
npm install  # if not already done
npm start
```

Look for: `✅ [Filebase] Filebase configured`

---

## What You Get

✅ **Real IPFS CIDs** - Every file gets a unique Content Identifier  
✅ **S3-Compatible Storage** - Use standard AWS SDK  
✅ **Decentralized Access** - Files on IPFS network  
✅ **Blockchain Anchoring** - Real CIDs anchored on-chain  
✅ **5GB Free** - More than enough for testing  

---

## Testing

Upload evidence through the app and check:

**Backend Logs:**
```
📤 [Evidence] Starting Filebase upload...
✅ [Filebase] Upload successful: evidence/0x.../...
🔗 [Filebase] Retrieved IPFS CID: bafybei...
📦 [Evidence] Root S3 Key: evidence/0x.../...
```

**Filebase Dashboard:**
- Go to https://console.filebase.com/
- Click your bucket → Browse files
- See your uploaded encrypted files with IPFS CIDs

---

## Mock Mode (No Credentials)

Don't have Filebase yet? **No problem!**

Without credentials, the system:
- ✅ Works normally
- ✅ Stores files in MongoDB (like before)
- ✅ Generates mock CIDs
- ✅ Blockchain anchoring works
- ⚠️ CIDs are placeholders (not real IPFS)

Perfect for development!

---

## Common Issues

### "Filebase not configured"
→ Check `.env` has correct credentials

### "Access Denied"
→ Verify Access Key and Secret Key
→ Check bucket name matches

### "CID not available"
→ Normal - retries automatically
→ Check bucket is set to IPFS storage

---

## Architecture

```
Frontend (Encrypted Files)
    ↓
Backend (Uploads to Filebase)
    ↓
Filebase S3 API (Stores & Pins to IPFS)
    ↓
IPFS Network (Decentralized Storage)
    ↓
Backend (Gets CID + S3 Key)
    ↓
MongoDB (Stores metadata)
    ↓
Frontend (Anchors to Blockchain with real CID)
    ↓
Ethereum Blockchain (Immutable proof)
```

---

## File Organization

```
aegis-evidence/                          ← Your Bucket
└── evidence/
    └── 0xabc123.../                    ← Wallet Address
        └── evidence_abc_123_xyz/       ← Evidence ID
            ├── 1728934567_hash_file1.jpg
            ├── 1728934567_hash_file2.pdf
            └── 1728934567_hash_desc.txt
```

---

## Security

🔒 Encrypted files stored encrypted  
🔑 Master key never leaves frontend  
🔐 Filebase only sees encrypted data  
⛓️ Blockchain has immutable CID proof  

**You still need the passphrase to decrypt!**

---

## Need Help?

📖 Full Guide: `FILEBASE_INTEGRATION_GUIDE.md`  
🌐 Filebase Docs: https://docs.filebase.com/  
💬 Filebase Support: https://filebase.com/support  

---

**Ready to go! 🚀**
