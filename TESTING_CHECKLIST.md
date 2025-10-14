# Filebase Integration - Testing Checklist

Use this checklist to verify the Filebase integration is working correctly.

---

## ✅ Pre-Flight Checks

### Backend Setup
- [ ] AWS SDK installed (`npm list aws-sdk` shows version)
- [ ] `backend/services/filebaseService.js` exists
- [ ] `backend/.env.example` has Filebase section
- [ ] `backend/.env` created from example

### Frontend Setup
- [ ] `evidenceService.js` updated (upload flow changed)
- [ ] `blockchainService.js` accepts CID and S3 parameters

### Documentation
- [ ] `FILEBASE_INTEGRATION_GUIDE.md` exists
- [ ] `QUICK_SETUP_FILEBASE.md` exists
- [ ] `CHANGES_SUMMARY.md` exists
- [ ] `README.md` updated with Filebase info

---

## 🧪 Functional Tests

### Test 1: Mock Mode (No Credentials)
**Purpose**: Verify system works without Filebase configured

- [ ] Remove/comment out Filebase credentials in `.env`
- [ ] Start backend: `cd backend && npm start`
- [ ] Look for log: `⚠️ [Filebase] Credentials not configured, using mock mode`
- [ ] Upload evidence through frontend
- [ ] Check backend logs for: `🔧 [Filebase] Using mock mode - no real upload`
- [ ] Verify evidence uploads successfully
- [ ] Check MongoDB for evidence with mock CID
- [ ] **Expected**: Mock CID like `bafybei...` (deterministic hash)

### Test 2: Real Mode (With Credentials)
**Purpose**: Verify actual Filebase integration works

**Setup:**
- [ ] Sign up at https://filebase.com/
- [ ] Create bucket named `aegis-evidence` with IPFS storage
- [ ] Get Access Key and Secret Key
- [ ] Add to `backend/.env`:
  ```env
  FILEBASE_ACCESS_KEY=FB...
  FILEBASE_SECRET_KEY=...
  FILEBASE_BUCKET=aegis-evidence
  FILEBASE_ENDPOINT=https://s3.filebase.com
  ```

**Test:**
- [ ] Restart backend: `cd backend && npm start`
- [ ] Look for log: `✅ [Filebase] Filebase configured`
- [ ] Upload evidence through frontend
- [ ] Check backend logs for:
  - [ ] `📤 [Filebase] Uploading to bucket: aegis-evidence`
  - [ ] `✅ [Filebase] Upload successful: evidence/0x.../...`
  - [ ] `🔗 [Filebase] Retrieved IPFS CID: bafybei...`
  - [ ] `📦 [Evidence] Root S3 Key: evidence/0x.../...`
- [ ] Verify evidence uploads successfully
- [ ] Check response contains real CID and S3 key

### Test 3: Filebase Dashboard Verification
**Purpose**: Verify files actually uploaded to Filebase

- [ ] Go to https://console.filebase.com/
- [ ] Log in to your account
- [ ] Click on `aegis-evidence` bucket
- [ ] Navigate to `evidence/` folder
- [ ] See wallet address folders
- [ ] See evidence ID folders
- [ ] See encrypted files with timestamps
- [ ] Click on a file to view metadata
- [ ] Verify IPFS CID is shown
- [ ] **Expected**: Files visible in bucket, CID displayed

### Test 4: Blockchain Anchoring with Real CID
**Purpose**: Verify blockchain gets real CID and S3 key

- [ ] Upload evidence (with Filebase configured)
- [ ] Check frontend console logs:
  - [ ] `📤 [Evidence] Uploading to backend (Filebase storage)...`
  - [ ] `🔗 CID: bafybei...`
  - [ ] `📦 S3 Key: evidence/0x.../...`
  - [ ] `⛓️ [Evidence] Starting blockchain anchoring with real CID and S3 key...`
  - [ ] `✅ [Evidence] Blockchain anchoring successful`
- [ ] Check backend logs for blockchain transaction
- [ ] Verify transaction on blockchain explorer
- [ ] **Expected**: Real CID and S3 key in blockchain transaction

### Test 5: Evidence Retrieval
**Purpose**: Verify evidence can be retrieved correctly

- [ ] Upload evidence
- [ ] Get evidence list: GET `/api/v1/evidence/list/{walletAddress}`
- [ ] Verify response includes:
  - [ ] `blockchain.cidRoot` (real CID)
  - [ ] `blockchain.s3KeyRoot` (real S3 key)
- [ ] Get specific evidence: GET `/api/v1/evidence/{evidenceId}`
- [ ] Verify each file has:
  - [ ] `s3Key` (real S3 path)
  - [ ] `cid` (real IPFS CID)
  - [ ] No `encryptedData` field (or null)
- [ ] **Expected**: Evidence retrieved with real storage references

### Test 6: Backward Compatibility
**Purpose**: Verify old evidence still works

- [ ] If you have old evidence (with `encryptedData`):
  - [ ] Retrieve old evidence via API
  - [ ] Verify `encryptedData` field is still present
  - [ ] Verify decryption works
- [ ] Upload new evidence (with Filebase)
- [ ] Retrieve both old and new evidence
- [ ] **Expected**: Both formats work correctly

---

## 🐛 Troubleshooting Tests

### Issue: "Filebase not configured" but credentials are set
**Debug Steps:**
- [ ] Check `.env` file has correct format (no quotes around values)
- [ ] Verify no extra spaces in credentials
- [ ] Check `FILEBASE_ACCESS_KEY` and `FILEBASE_SECRET_KEY` are set
- [ ] Restart backend server
- [ ] Check logs on startup

### Issue: "Access Denied" from Filebase
**Debug Steps:**
- [ ] Verify Access Key is correct (starts with `FB` or similar)
- [ ] Verify Secret Key is correct
- [ ] Check bucket exists in Filebase dashboard
- [ ] Check bucket name matches `.env` exactly
- [ ] Verify bucket is set to IPFS storage

### Issue: "CID not available"
**Debug Steps:**
- [ ] Check Filebase dashboard - does file exist?
- [ ] Wait 2-3 seconds and retry (IPFS pinning takes time)
- [ ] Check bucket is configured for IPFS (not Storj/Sia)
- [ ] Check backend logs for retry attempts
- [ ] If persistent, check Filebase status page

### Issue: Upload works but no CID in response
**Debug Steps:**
- [ ] Check backend logs for Filebase upload
- [ ] Verify `cidRoot` and `s3KeyRoot` in response
- [ ] Check MongoDB record for blockchain fields
- [ ] Verify Filebase service returned CID
- [ ] Check if running in mock mode

---

## 📊 Performance Tests

### Upload Speed Test
- [ ] Upload 1 small file (<1MB)
  - Expected: < 2 seconds
- [ ] Upload 1 large file (5-10MB)
  - Expected: < 10 seconds
- [ ] Upload 5 files at once
  - Expected: < 15 seconds
- [ ] Compare with mock mode
  - Mock should be faster (no network)

### Storage Verification
- [ ] Check MongoDB document size (should be small)
- [ ] Verify files not in `encryptedData` field
- [ ] Check Filebase dashboard for file sizes
- [ ] Verify total storage usage in Filebase

---

## 🔒 Security Tests

### Encryption Verification
- [ ] Upload evidence
- [ ] Check Filebase dashboard
- [ ] Download file from Filebase (if possible)
- [ ] Verify file is encrypted (looks like random data)
- [ ] Verify cannot decrypt without passphrase
- [ ] **Expected**: Files stored encrypted, unreadable

### CID Immutability
- [ ] Upload evidence
- [ ] Note the CID
- [ ] Upload same file again
- [ ] Verify different CID (different encryption)
- [ ] **Expected**: Each upload has unique CID

### Blockchain Verification
- [ ] Upload evidence
- [ ] Get transaction hash from logs
- [ ] Check blockchain explorer
- [ ] Verify CID is in transaction data
- [ ] Verify S3 key is in transaction data
- [ ] **Expected**: Real references on-chain

---

## ✅ Final Verification

### Code Quality
- [ ] No errors in VS Code
- [ ] `npm start` runs without errors (backend)
- [ ] `npm run dev` runs without errors (frontend)
- [ ] No console errors in browser

### Documentation
- [ ] README.md updated
- [ ] Integration guide complete
- [ ] Quick setup guide clear
- [ ] Changes summary accurate

### Deployment Readiness
- [ ] `.env.example` has all required fields
- [ ] `.env` not committed to git
- [ ] Filebase credentials secure
- [ ] Mock mode works as fallback
- [ ] Error handling in place

---

## 📝 Test Results

**Date Tested**: _________________

**Tester**: _________________

**Results Summary**:
- [ ] All tests passed ✅
- [ ] Some tests failed ⚠️ (see notes below)
- [ ] Major issues found ❌ (see notes below)

**Notes**:
```
_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________
```

**Filebase Configuration**:
- [ ] Using real Filebase (credentials configured)
- [ ] Using mock mode (no credentials)

**Test Environment**:
- Backend: Running on _________________
- Frontend: Running on _________________
- MongoDB: Local / Atlas (circle one)
- Network: Holesky / Mainnet (circle one)

---

## 🎉 Success Criteria

All of the following must be true:
- [x] Backend starts without errors
- [x] Frontend starts without errors
- [x] Mock mode works (files upload without Filebase)
- [x] Real mode works (files upload to Filebase)
- [x] CID and S3 key returned in response
- [x] Blockchain anchoring uses real CID
- [x] Files visible in Filebase dashboard
- [x] Old evidence still accessible
- [x] Documentation complete

**If all checked: Integration successful! 🎉**

---

## 📞 Support

If tests fail, check:
1. `FILEBASE_INTEGRATION_GUIDE.md` - Full troubleshooting guide
2. `QUICK_SETUP_FILEBASE.md` - Setup verification
3. `CHANGES_SUMMARY.md` - What changed and why
4. Backend logs - Error details
5. Frontend console - Network errors

**Still stuck?** Check Filebase documentation or contact support.

---

**Happy Testing! 🧪✅**
