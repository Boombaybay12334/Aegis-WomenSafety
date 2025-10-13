# Account Creation Flow - DEBUG GUIDE

## Expected Flow When Creating Account

### 1. User fills form and clicks "Create Account"

```
CreateAccount.jsx → handleSubmit()
├─ 🔵 Sets isSubmitting=true, isLoading=true
├─ 🔵 Calls accountService.signUp(passphrase)
│
└─ accountService.signUp() executes:
   ├─ Derives wallet address from passphrase
   ├─ Generates master key
   ├─ Splits into Shard A, B, C
   ├─ Calls backend API: createAccount({ walletAddress, shardB, shardC })
   │  └─ Backend saves to MongoDB
   ├─ Encrypts Shard A with passphrase
   ├─ Stores in localStorage:
   │  ├─ aegis_user_{address} = { walletAddress, encryptedShardA, createdAt }
   │  └─ encryptedShardA = encrypted shard
   ├─ Stores in sessionStorage:
   │  └─ passphrase = user's passphrase
   ├─ Calls createSession(address, shardA)
   │  └─ Stores in sessionStorage:
   │     └─ aegis_session = { walletAddress, decryptedShardA, loggedInAt }
   └─ Returns { walletAddress: address }
```

### 2. After signUp() succeeds

```
CreateAccount.jsx → handleSubmit() (continued)
├─ 🟢 Signup successful!
├─ 🟢 Session created (check with getSession())
├─ 🟢 Sets lastLoginDate in localStorage
├─ 🟢 Calls onSignUpSuccess() callback
│  └─ This calls App.jsx → handleLoginSuccess()
│     └─ Sets isLoggedIn = true
└─ 🟢 Navigates to /dashboard
```

### 3. Dashboard loads

```
App.jsx checks isLoggedIn = true
├─ ProtectedRoute allows access
└─ Dashboard component renders
```

---

## Debug Console Output (Expected)

When you create an account, you should see in the browser console:

```
🔵 [CreateAccount] Starting signup...
🟢 [CreateAccount] Signup successful! Result: { walletAddress: "0x..." }
🟢 [CreateAccount] Session created: { walletAddress: "0x...", decryptedShardA: "...", loggedInAt: "..." }
🟢 [CreateAccount] Calling onSignUpSuccess callback...
🟢 [App] handleLoginSuccess called
🟢 [App] Current session: { walletAddress: "0x...", decryptedShardA: "...", loggedInAt: "..." }
🟢 [App] isLoggedIn state set to true
🟢 [CreateAccount] Navigating to dashboard...
```

---

## If "Account Already Exists" Error Appears

### Possible Causes:

1. **Backend already has this account**
   - Check MongoDB: `node backend/list-users.js`
   - If wallet exists, use different passphrase or delete user from DB

2. **Double submission (FIXED)**
   - Added `isSubmitting` guard to prevent double clicks
   - Should no longer happen

3. **React StrictMode double render**
   - Only happens in development
   - The guard should prevent this

### How to Test:

1. **Clear everything:**
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Check MongoDB is empty:**
   ```bash
   node backend/list-users.js
   ```

3. **Try creating account with a UNIQUE passphrase:**
   - Use something you've never used before
   - e.g., "TestAccount123456789"

4. **Watch the console logs** - they will show exactly where it fails

---

## Storage After Successful Account Creation

### SessionStorage (cleared on tab close):
```javascript
aegis_session = {
  walletAddress: "0x850740edee3DE1A780eE21686537D1632c5fc1C5",
  decryptedShardA: "2:a1b2c3...",
  loggedInAt: "2025-10-14T..."
}
passphrase = "YourPassphrase"
```

### LocalStorage (persists):
```javascript
aegis_user_0x850740edee3DE1A780eE21686537D1632c5fc1C5 = {
  walletAddress: "0x850740edee3DE1A780eE21686537D1632c5fc1C5",
  encryptedShardA: "U2FsdGVkX1...",
  createdAt: "2025-10-14T..."
}
encryptedShardA = "U2FsdGVkX1..."
lastLoginDate = "2025-10-14T..."
```

### MongoDB Backend:
```javascript
{
  walletAddress: "0x850740edee3de1a780ee21686537d1632c5fc1c5",
  shardB: "2:d4e5f6...",
  shardC_id: "ngo_abc123...",
  createdAt: Date,
  shardVersion: 1
}
```

---

## Troubleshooting Steps

### If dashboard doesn't load after signup:

1. **Check console for errors**
2. **Verify session exists:**
   ```javascript
   // In browser console:
   JSON.parse(sessionStorage.getItem('aegis_session'))
   ```
3. **Check isLoggedIn state in React DevTools**
4. **Verify ProtectedRoute is working**

### If "Account already exists" appears:

1. **Check backend terminal** - see what wallet address it's receiving
2. **Check MongoDB** - see if account actually exists
3. **Clear browser storage** - start fresh
4. **Use a completely different passphrase**

---

## Fixed Issues

✅ Added `isSubmitting` guard to prevent double submission
✅ Removed setTimeout delay (navigate immediately)
✅ Added comprehensive console logging
✅ Session is created immediately after account creation
✅ `onSignUpSuccess()` callback is called to update App state

---

## Testing Checklist

- [ ] Clear localStorage and sessionStorage
- [ ] Verify MongoDB is empty (`node backend/list-users.js`)
- [ ] Create account with unique passphrase
- [ ] Console shows all green 🟢 messages
- [ ] Dashboard loads successfully
- [ ] Can upload evidence
- [ ] Can logout and login again
