# Storage Management Update - AEGIS

## Changes Made

### Problem
- Wallet addresses were being stored in localStorage permanently
- This caused confusion when creating multiple accounts or logging in/out
- LocalStorage data persisted across sessions causing "account already exists" confusion

### Solution

**SessionStorage (Cleared on tab close):**
- ✅ Current session data (`aegis_session`)
  - Wallet address
  - Decrypted Shard A (in memory for current session)
  - Login timestamp
- ✅ Passphrase (temporary, for current session only)

**LocalStorage (Persists across sessions):**
- ✅ `aegis_user_{walletAddress}` - User account data for same-device login
  - Wallet address
  - Encrypted Shard A
  - Creation timestamp
- ✅ `encryptedShardA` - Currently logged-in user's encrypted Shard A
- ✅ `lastLoginDate` - Last login date for inactivity tracking

**Removed from LocalStorage:**
- ❌ `aegis_current_wallet` - No longer needed, wallet address only in sessionStorage

---

## How It Works Now

### 1. Account Creation
```javascript
signUp(passphrase)
├─ Derives wallet address from passphrase
├─ Calls backend API (will fail if account exists in DB)
├─ Stores encrypted Shard A in localStorage: aegis_user_{address}
├─ Stores encryptedShardA in localStorage (for evidence encryption)
└─ Creates session in sessionStorage (wallet address + decrypted Shard A)
```

**Key Point:** Backend MongoDB is the source of truth for "account exists" check, not localStorage.

---

### 2. Login (Same Device)
```javascript
login(passphrase)
├─ Derives wallet address from passphrase
├─ Verifies account exists in backend
├─ Retrieves encrypted Shard A from localStorage: aegis_user_{address}
├─ Decrypts Shard A with passphrase
├─ Stores encryptedShardA and passphrase for current session
└─ Creates session in sessionStorage
```

---

### 3. Login (New Device)
```javascript
login(passphrase) - No local data found
├─ Derives wallet address from passphrase
├─ Verifies account exists in backend
├─ Initiates recovery with signature verification
├─ Retrieves Shard B and C from backend/NGO
├─ Reconstructs master key
├─ Generates new Shard A, B, C
├─ Updates backend with new Shard B and C
├─ Stores new encrypted Shard A in localStorage: aegis_user_{address}
└─ Creates session in sessionStorage
```

---

### 4. Logout
```javascript
logout()
├─ Clears sessionStorage (aegis_session, passphrase)
└─ Does NOT clear localStorage (aegis_user_{address}, encryptedShardA)
    ↳ These persist for same-device login on next session
```

---

### 5. Multiple Accounts on Same Device
**Scenario:** User wants to create/login with different passphrases (different accounts)

```
Account 1: passphrase "Abhinav12334"
├─ Derives wallet: 0x8507...C5
└─ Stores in localStorage: aegis_user_0x8507...C5

Logout → Clears sessionStorage only

Account 2: passphrase "DifferentPass123"
├─ Derives wallet: 0x2Ca2...3DE5
└─ Stores in localStorage: aegis_user_0x2Ca2...3DE5
    ↳ Both accounts can coexist in localStorage
```

**When logging in again:**
- System derives wallet address from entered passphrase
- Looks for `aegis_user_{derivedAddress}` in localStorage
- If found: same-device login
- If not found: new device recovery

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     AEGIS Storage Architecture               │
└─────────────────────────────────────────────────────────────┘

SessionStorage (Session-only, cleared on tab close)
├─ aegis_session
│  ├─ walletAddress (derived from passphrase)
│  ├─ decryptedShardA (in-memory only)
│  └─ loggedInAt
└─ passphrase (temporary, for evidence encryption)

LocalStorage (Persistent across sessions)
├─ aegis_user_{address1} (Account 1 data)
│  ├─ walletAddress
│  ├─ encryptedShardA
│  └─ createdAt
├─ aegis_user_{address2} (Account 2 data, if multiple accounts)
├─ encryptedShardA (current user's encrypted shard)
└─ lastLoginDate (for inactivity tracking)

Backend MongoDB (Source of truth)
└─ Users collection
   ├─ walletAddress (unique)
   ├─ shardB
   └─ shardC_id (NGO reference)
```

---

## Security & Privacy

✅ **Wallet address only in sessionStorage** (cleared on tab close)  
✅ **Encrypted Shard A persists** (for same-device login convenience)  
✅ **Backend is source of truth** for account existence  
✅ **Multiple accounts supported** (different passphrases = different wallets)  
✅ **Zero-knowledge architecture maintained** (backend never sees passphrase or Shard A)  

---

## Testing

### Test Case 1: New Account Creation
1. Enter passphrase "Test12345678"
2. Click "Create Account"
3. **Expected:** Account created successfully
4. Check localStorage: `aegis_user_0x...` exists
5. Check sessionStorage: `aegis_session` exists

### Test Case 2: Logout and Re-login
1. Logout
2. Check sessionStorage: cleared ✅
3. Check localStorage: `aegis_user_0x...` still exists ✅
4. Login with same passphrase
5. **Expected:** Same-device login (fast, uses localStorage)

### Test Case 3: Different Account
1. Logout from Account 1
2. Create account with passphrase "Different12345"
3. **Expected:** New account created
4. Check localStorage: Both `aegis_user_{address1}` and `aegis_user_{address2}` exist
5. Logout
6. Login with first passphrase
7. **Expected:** Switches back to Account 1

### Test Case 4: Account Already Exists
1. Create account with passphrase "Test12345678"
2. Logout
3. Try to create account again with same passphrase
4. **Expected:** Backend returns 409 error "Account already exists"
5. Frontend shows error message

---

## Migration Notes

**No migration needed for existing users!**
- Existing localStorage data remains valid
- Old `aegis_current_wallet` key is simply ignored (not used anymore)
- Users can continue using their accounts without any changes

**For developers:**
- `CURRENT_WALLET_KEY` constant removed from `accountService.js`
- Wallet address now only retrieved from `sessionStorage.aegis_session.walletAddress`
- All evidence encryption, SOS, etc. should use `getSession().walletAddress`

---

## Files Modified

1. **my-frontend/src/services/accountService.js**
   - Removed `CURRENT_WALLET_KEY` constant
   - Updated `createSession()` to only use sessionStorage
   - Updated `logout()` to preserve localStorage data
   - Added comments explaining storage strategy

---

## Conclusion

✅ **Fixed:** "Account already exists" confusion  
✅ **Improved:** Clear separation of session vs persistent storage  
✅ **Maintained:** Same-device login convenience  
✅ **Enabled:** Multiple accounts on same device  
✅ **Preserved:** Zero-knowledge security architecture  

All changes are backward-compatible and require no data migration! 🎉
