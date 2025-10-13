# Wallet Funding Logic Update

## Summary
Updated the wallet funding logic to fund user wallets up to a target balance (1 ETH by default) instead of sending a fixed amount. This ensures wallets always reach the target balance on account creation and evidence uploads.

## Changes Made

### 1. Environment Variables (`.env`)
**Changed:**
- `FUNDING_AMOUNT` → `TARGET_WALLET_BALANCE` (default: 1 ETH)
- `MIN_BALANCE_THRESHOLD` updated to 1 ETH (from 0.0005 ETH)

**New Configuration:**
```env
# Target balance for user wallets (fund up to this amount)
TARGET_WALLET_BALANCE=1
# Minimum balance threshold before funding is triggered
MIN_BALANCE_THRESHOLD=1
```

### 2. Backend Configuration (`backend/config/blockchain.js`)
**Changed:**
- `FUNDING_AMOUNT` → `TARGET_BALANCE`
- Updated logging to show target balance and threshold

**Configuration Object:**
```javascript
FUNDING_WALLET: {
  PRIVATE_KEY: process.env.FUNDING_WALLET_PRIVATE_KEY || '0xac0974...',
  TARGET_BALANCE: process.env.TARGET_WALLET_BALANCE || '1',
  MIN_BALANCE_THRESHOLD: process.env.MIN_BALANCE_THRESHOLD || '1'
}
```

### 3. Blockchain Service (`backend/services/blockchainService.js`)
**Updated `fundUserWallet` function:**
- Calculates the exact amount needed to reach target balance
- Only sends the difference between current and target balance
- Skips funding if wallet is already at or above target
- Updated logs and return values to include target balance info

**Key Logic:**
```javascript
const targetBalance = BLOCKCHAIN_CONFIG.FUNDING_WALLET.TARGET_BALANCE;
const currentBalance = parseFloat(balanceCheck.balance);
const fundingAmount = Math.max(0, parseFloat(targetBalance) - currentBalance);
```

### 4. Account Creation (`backend/routes/account.js`)
**Added automatic funding on account creation:**
- Imports `fundUserWallet` from blockchain service
- Calls funding after user account is created
- Non-critical error handling (account creation succeeds even if funding fails)
- Returns funding result in API response

**Flow:**
1. Create user account in database
2. Check wallet balance
3. Fund wallet to reach target balance if needed
4. Return success with funding status

## Benefits

1. **Predictable Balances:** All user wallets reach the same target balance
2. **Efficient Funding:** Only sends the amount needed, not a fixed amount
3. **Cost Savings:** Prevents over-funding wallets that already have ETH
4. **Flexible Configuration:** Target balance and threshold are adjustable via environment variables
5. **Better Logging:** Clear logs show funding calculations and results

## Environment Variable Adjustments

You can now adjust these values in `.env`:

```env
# Set target balance (e.g., 0.5 ETH, 2 ETH, etc.)
TARGET_WALLET_BALANCE=1

# Set threshold (should be <= TARGET_BALANCE)
MIN_BALANCE_THRESHOLD=1
```

## Testing Recommendations

1. Test account creation with empty wallet
2. Test account creation with partially funded wallet
3. Test account creation with fully funded wallet
4. Test evidence upload with low balance
5. Verify funding wallet has sufficient balance

## Migration Notes

- Existing accounts are not affected
- Next account creation or evidence upload will trigger the new logic
- Funding wallet must have sufficient balance for multiple users
- Consider setting `MIN_BALANCE_THRESHOLD` slightly below `TARGET_BALANCE` to reduce unnecessary funding attempts

## Example Scenarios

### Scenario 1: Empty Wallet
- Current: 0 ETH
- Target: 1 ETH
- **Funds: 1 ETH**

### Scenario 2: Partially Funded
- Current: 0.3 ETH
- Target: 1 ETH
- **Funds: 0.7 ETH**

### Scenario 3: Already Funded
- Current: 1.2 ETH
- Target: 1 ETH
- **Funds: 0 ETH (skipped)**

## Rollback Instructions

If needed, revert to fixed funding amount by:
1. Change `TARGET_WALLET_BALANCE` back to `FUNDING_AMOUNT` in `.env`
2. Update `FUNDING_WALLET` config in `blockchain.js`
3. Revert funding calculation logic in `blockchainService.js`
4. Remove funding call from `account.js` if desired

---

**Date:** October 13, 2025
**Status:** ✅ Implemented and Ready for Testing
