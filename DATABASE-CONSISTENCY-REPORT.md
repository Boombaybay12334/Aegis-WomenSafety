# Database Consistency Report - AEGIS

## ✅ DATABASE CONSISTENCY CHECK COMPLETE

All database connections are now **CONSISTENT** and pointing to the correct database!

---

## 📊 Database Configuration

### Primary Database
- **Name:** `aegis`
- **Connection String:** `mongodb://localhost:27017/aegis`
- **Environment Variable:** `MONGODB_URI` (defined in `backend/.env`)

---

## 🔍 Files Checked

### ✅ Main Server Files
| File | Connection | Status |
|------|------------|--------|
| `backend/server.js` | Uses `config/database.js` | ✅ Correct |
| `backend/config/database.js` | `process.env.MONGODB_URI` | ✅ Correct |
| `backend/.env` | `mongodb://localhost:27017/aegis` | ✅ Correct |

### ✅ Route Files
| File | Connection | Status |
|------|------------|--------|
| `backend/routes/account.js` | Uses shared connection | ✅ Correct |
| `backend/routes/evidence.js` | Uses shared connection | ✅ Correct |
| `backend/routes/emergency.js` | Uses shared connection | ✅ Correct |

### ✅ Model Files
| File | Connection | Status |
|------|------------|--------|
| `backend/models/User.js` | Uses shared connection | ✅ Correct |
| `backend/models/Evidence.js` | Uses shared connection | ✅ Correct |
| `backend/models/SOS.js` | Uses shared connection | ✅ Correct |

### ✅ Utility Scripts
| File | Connection String | Status |
|------|-------------------|--------|
| `backend/check-users.js` | `process.env.MONGODB_URI \|\| 'mongodb://localhost:27017/aegis'` | ✅ FIXED |
| `backend/check-raw-users.js` | `process.env.MONGODB_URI \|\| 'mongodb://localhost:27017/aegis'` | ✅ Correct |
| `backend/list-users.js` | `process.env.MONGODB_URI \|\| 'mongodb://localhost:27017/aegis'` | ✅ FIXED |
| `backend/delete-user.js` | `process.env.MONGODB_URI \|\| 'mongodb://127.0.0.1:27017/aegis'` | ✅ FIXED |
| `backend/migrate-shards.js` | `process.env.MONGODB_URI \|\| 'mongodb://localhost:27017/aegis'` | ✅ Correct |
| `backend/quick-fix-shards.js` | `process.env.MONGODB_URI \|\| 'mongodb://localhost:27017/aegis'` | ✅ Correct |

### ✅ Service Files
| File | Connection | Status |
|------|------------|--------|
| `backend/services/mockKMS.js` | In-memory (no DB) | ✅ N/A |
| `backend/services/mockNGO.js` | In-memory (no DB) | ✅ N/A |
| `backend/services/blockchainService.js` | No DB connection | ✅ N/A |

---

## 🔧 Fixes Applied

### 1. ❌ **list-users.js** (FIXED)
**Before:**
```javascript
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aegis-dev';
```

**After:**
```javascript
require('dotenv').config();
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aegis';
```

**Issue:** Was using wrong env variable (`MONGO_URI` instead of `MONGODB_URI`) and wrong database name (`aegis-dev` instead of `aegis`)

---

### 2. ❌ **check-users.js** (FIXED)
**Before:**
```javascript
mongoose.connect('mongodb://localhost:27017/aegis', {
```

**After:**
```javascript
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aegis', {
```

**Issue:** Hardcoded connection string, not reading from `.env`

---

### 3. ❌ **delete-user.js** (FIXED)
**Before:**
```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aegis_phase0';
```

**After:**
```javascript
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aegis';
```

**Issue:** Wrong database name (`aegis_phase0` instead of `aegis`)

---

## 📋 Collections in Database

The `aegis` database contains the following collections:

1. **`users`** - User accounts with wallet addresses and encrypted shards
2. **`evidences`** - Uploaded evidence metadata (Phase 1)
3. **`soss`** - Emergency SOS records (Phase 1)

---

## 🎯 Best Practices Implemented

✅ All scripts now use `require('dotenv').config()` to load environment variables
✅ All connections use `process.env.MONGODB_URI` as primary source
✅ All fallbacks use the same database: `aegis`
✅ Consistent use of `localhost:27017` (except delete-user.js uses `127.0.0.1` which is equivalent)

---

## 🧪 Testing Commands

To verify database consistency:

```bash
# Check if MongoDB is running
mongo --eval "db.version()"

# List all databases
mongo --eval "show dbs"

# Check users in aegis database
node backend/check-users.js

# List all users
node backend/list-users.js

# Check raw collection
node backend/check-raw-users.js
```

---

## ⚠️ Important Notes

1. **Database Name:** Always use `aegis` (not `aegis-dev`, `aegis_phase0`, etc.)
2. **Environment Variable:** Always use `MONGODB_URI` (not `MONGO_URI`)
3. **Connection String:** Use `mongodb://localhost:27017/aegis`
4. **Fallback:** All scripts have fallback to default connection string

---

## 🚀 Database is Now Consistent!

All files are pointing to the same database: **`aegis`**

No more issues with:
- ❌ Users being created in one database and searched in another
- ❌ Scripts connecting to different databases
- ❌ Inconsistent environment variable names
- ❌ Hardcoded connection strings

Everything is now using the centralized `.env` configuration! 🎉
