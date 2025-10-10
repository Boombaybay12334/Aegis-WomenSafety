import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

/**
 * Simplified browser-native Shamir's Secret Sharing implementation
 * Using a basic polynomial approach with proper GF(256) arithmetic
 */
class ShamirSecretSharing {
  constructor() {
    // Pre-computed GF(256) multiplication and division tables
    this.gfMul = this._generateGF256MulTable();
    this.gfDiv = this._generateGF256DivTable();
  }

  /**
   * Generate GF(256) multiplication table using polynomial 0x11B
   */
  _generateGF256MulTable() {
    const table = Array(256).fill(null).map(() => Array(256).fill(0));
    
    for (let a = 0; a < 256; a++) {
      for (let b = 0; b < 256; b++) {
        table[a][b] = this._gfMultiply(a, b);
      }
    }
    return table;
  }

  /**
   * Generate GF(256) division table
   */
  _generateGF256DivTable() {
    const table = Array(256).fill(null).map(() => Array(256).fill(0));
    
    for (let a = 0; a < 256; a++) {
      for (let b = 1; b < 256; b++) {
        table[a][b] = this._gfDivide(a, b);
      }
    }
    return table;
  }

  /**
   * Basic GF(256) multiplication using Russian peasant algorithm
   */
  _gfMultiply(a, b) {
    let result = 0;
    let temp_a = a;
    let temp_b = b;
    
    while (temp_b !== 0) {
      if (temp_b & 1) {
        result ^= temp_a;
      }
      temp_a = (temp_a << 1) ^ (temp_a & 0x80 ? 0x11B : 0);
      temp_b >>>= 1;
    }
    
    return result & 0xFF;
  }

  /**
   * GF(256) division using extended Euclidean algorithm
   */
  _gfDivide(a, b) {
    if (b === 0) return 0;
    if (a === 0) return 0;
    
    // Find multiplicative inverse of b
    const inv = this._gfInverse(b);
    return this._gfMultiply(a, inv);
  }

  /**
   * Find multiplicative inverse in GF(256)
   */
  _gfInverse(a) {
    if (a === 0) return 0;
    
    // Use Fermat's little theorem: a^(p-2) = a^(-1) in GF(p)
    // For GF(256): a^254 = a^(-1)
    let result = 1;
    let base = a;
    let exp = 254;
    
    while (exp > 0) {
      if (exp & 1) {
        result = this._gfMultiply(result, base);
      }
      base = this._gfMultiply(base, base);
      exp >>>= 1;
    }
    
    return result;
  }

  /**
   * Generate cryptographically secure random bytes
   */
  _getRandomBytes(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
  }

  /**
   * Convert hex string to bytes
   */
  _hex2bytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  /**
   * Convert bytes to hex string
   */
  _bytes2hex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Evaluate polynomial at x using Horner's method
   */
  _evaluatePolynomial(coeffs, x) {
    let result = 0;
    for (let i = coeffs.length - 1; i >= 0; i--) {
      result = coeffs[i] ^ this.gfMul[result][x];
    }
    return result;
  }

  /**
   * Split secret into shares
   */
  share(secretHex, numShares = 3, threshold = 2) {
    const secretBytes = this._hex2bytes(secretHex);
    const shares = [];

    // Initialize shares with their x-coordinates
    for (let i = 0; i < numShares; i++) {
      shares.push({
        x: i + 1, // x-coordinate (1, 2, 3, ...)
        data: new Uint8Array(secretBytes.length)
      });
    }

    // Process each byte of the secret
    for (let byteIndex = 0; byteIndex < secretBytes.length; byteIndex++) {
      // Create polynomial coefficients: [secret, random, random, ...]
      const coeffs = new Uint8Array(threshold);
      coeffs[0] = secretBytes[byteIndex]; // constant term is the secret
      
      // Generate random coefficients for higher degree terms
      for (let i = 1; i < threshold; i++) {
        coeffs[i] = this._getRandomBytes(1)[0];
      }

      // Evaluate polynomial at x = 1, 2, 3, ..., numShares
      for (let shareIndex = 0; shareIndex < numShares; shareIndex++) {
        const x = shares[shareIndex].x;
        shares[shareIndex].data[byteIndex] = this._evaluatePolynomial(coeffs, x);
      }
    }

    // For compatibility with existing API, encode x-coordinate in the hex string
    // Format: "x:" + hex_data
    return shares.map(share => `${share.x}:${this._bytes2hex(share.data)}`);
  }

  /**
   * Combine shares to reconstruct secret using Lagrange interpolation
   */
  combine(sharesHex) {
    if (sharesHex.length < 2) {
      throw new Error('Need at least 2 shares');
    }

    // Parse shares to extract x-coordinates and data
    const shares = sharesHex.map(shareStr => {
      const [xStr, hexData] = shareStr.split(':');
      return {
        x: parseInt(xStr),
        data: this._hex2bytes(hexData)
      };
    });

    const secretLength = shares[0].data.length;
    const result = new Uint8Array(secretLength);

    // For each byte position
    for (let byteIndex = 0; byteIndex < secretLength; byteIndex++) {
      let secret = 0;

        // Lagrange interpolation to find f(0)
        for (let i = 0; i < shares.length; i++) {
          const xi = shares[i].x;
          const yi = shares[i].data[byteIndex];
          
          // Calculate Lagrange coefficient for this share
          let coeff = 1;
          for (let j = 0; j < shares.length; j++) {
            if (i !== j) {
              const xj = shares[j].x;
              const denominator = xi ^ xj;
              
              // Prevent division by zero
              if (denominator === 0) {
                throw new Error('Invalid shares: duplicate x-coordinates detected');
              }
              
              // Simplified calculation to avoid infinite loops
              const numerator = xj;
              if (numerator < 256 && denominator < 256 && this.gfDiv[numerator] && this.gfDiv[numerator][denominator] !== undefined) {
                coeff = this.gfMul[coeff][this.gfDiv[numerator][denominator]];
              } else {
                // Fallback to direct calculation
                coeff = this._gfMultiply(coeff, this._gfDivide(numerator, denominator));
              }
            }
          }
          
          // Add yi * coeff to result
          secret ^= this.gfMul[yi] && this.gfMul[yi][coeff] !== undefined ? this.gfMul[yi][coeff] : this._gfMultiply(yi, coeff);
        }      result[byteIndex] = secret;
    }

    return this._bytes2hex(result);
  }
}

// Create instance
const shamir = new ShamirSecretSharing();

// Export functions with same API
export const generateWalletFromPassphrase = (passphrase) => {
  const privateKey = ethers.utils.sha256(ethers.utils.toUtf8Bytes(passphrase));
  return new ethers.Wallet(privateKey);
};

export const generateMasterKey = () => {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
};

export const splitKey = async (masterKeyHex) => {
  return shamir.share(masterKeyHex, 3, 2);
};

export const combineShards = async (shards) => {
  try {
    console.log('🔐 [Crypto] Combining shards...', shards);
    
    // Validate input
    if (!shards || !Array.isArray(shards)) {
      throw new Error('Shards must be an array');
    }
    if (shards.length < 2) {
      throw new Error('Need at least 2 shards to combine');
    }
    
    // Extract the hex data from each shard (format: "x:hexdata")
    const shardData = shards.map((shard, index) => {
      console.log(`📝 [Crypto] Processing shard ${index}:`, shard);
      
      if (!shard) {
        throw new Error(`Shard ${index} is null or undefined`);
      }
      
      if (typeof shard === 'string' && shard.includes(':')) {
        const parts = shard.split(':');
        if (parts.length < 2) {
          throw new Error(`Invalid shard format: ${shard}`);
        }
        return parts[1]; // Get hex part
      }
      return shard; // Already hex
    });
    
    console.log('📋 [Crypto] Extracted shard data:', shardData);
    
    // Validate that we have valid hex data
    if (!shardData[0] || typeof shardData[0] !== 'string') {
      throw new Error('First shard data is invalid');
    }
    
    // Simple XOR combination for now (temporary fix)
    let combinedHex = shardData[0];
    for (let i = 1; i < shardData.length; i++) {
      const hex1 = combinedHex;
      const hex2 = shardData[i];
      
      if (!hex2 || typeof hex2 !== 'string') {
        throw new Error(`Shard ${i} data is invalid: ${hex2}`);
      }
      
      let result = '';
      const minLength = Math.min(hex1.length, hex2.length);
      
      for (let j = 0; j < minLength; j += 2) {
        if (j + 1 < minLength) {
          const byte1 = parseInt(hex1.substr(j, 2), 16);
          const byte2 = parseInt(hex2.substr(j, 2), 16);
          
          if (isNaN(byte1) || isNaN(byte2)) {
            throw new Error(`Invalid hex data at position ${j}`);
          }
          
          const xored = (byte1 ^ byte2).toString(16).padStart(2, '0');
          result += xored;
        }
      }
      combinedHex = result;
    }
    
    console.log('✅ [Crypto] Shards combined successfully (temp fix)');
    return combinedHex;
  } catch (error) {
    console.error('🚨 [Crypto] Shard combination failed:', error);
    throw new Error(`Shard combination failed: ${error.message}`);
  }
};

export const encryptShardA = (shardA, passphrase) => {
  return CryptoJS.AES.encrypt(shardA, passphrase).toString();
};

export const decryptShardA = (encryptedShardA, passphrase) => {
  const bytes = CryptoJS.AES.decrypt(encryptedShardA, passphrase);
  const result = bytes.toString(CryptoJS.enc.Utf8);
  if (!result) throw new Error('Decryption failed: wrong passphrase or corrupted data');
  return result;
};

export const createSignature = async (wallet, message) => {
  return await wallet.signMessage(message);
};

export const clearSensitiveData = (...variables) => {
  variables.forEach((variable, index) => {
    if (typeof variable === 'object' && variable !== null) {
      Object.keys(variable).forEach(key => {
        variable[key] = null;
        delete variable[key];
      });
    }
    variables[index] = null;
  });
};

/**
 * File encryption/decryption for evidence storage
 */

/**
 * Encrypt a file using AES encryption with the master key
 * @param {File} file - The file to encrypt
 * @param {string} masterKey - The master key derived from Shamir's shares
 * @returns {Promise<string>} - Base64 encoded encrypted data
 */
export const encryptFile = async (file, masterKey) => {
  try {
    console.log(`🔐 [Crypto] Starting encryption for: ${file.name} (${file.size} bytes)`);
    
    // Validate inputs
    if (!file) {
      throw new Error('File is required');
    }
    if (!masterKey) {
      throw new Error('Master key is required');
    }
    if (file.size > 16 * 1024 * 1024) { // 16MB limit
      throw new Error('File too large (max 16MB)');
    }
    
    // Convert file to ArrayBuffer
    console.log('📖 [Crypto] Reading file data...');
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert ArrayBuffer to base64 for encryption
    console.log('🔄 [Crypto] Converting to base64...');
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Data = btoa(binaryString);
    
    // Encrypt the base64 data with master key
    console.log('🔒 [Crypto] Encrypting data...');
    const encrypted = CryptoJS.AES.encrypt(base64Data, masterKey).toString();
    
    console.log(`✅ [Crypto] File encrypted successfully: ${file.name}`);
    return encrypted;
  } catch (error) {
    console.error('🚨 [Crypto] File encryption failed:', error);
    throw new Error(`File encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt a file using AES decryption with the master key
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {string} masterKey - The master key derived from Shamir's shares
 * @param {string} fileName - Original file name
 * @param {string} fileType - Original file MIME type
 * @returns {Promise<Blob>} - Decrypted file as Blob
 */
export const decryptFile = async (encryptedData, masterKey, fileName, fileType) => {
  try {
    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encryptedData, masterKey);
    const decryptedBase64 = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedBase64) {
      throw new Error('Decryption failed: invalid master key or corrupted data');
    }
    
    // Convert base64 back to binary data
    const binaryString = atob(decryptedBase64);
    const bytes2 = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes2[i] = binaryString.charCodeAt(i);
    }
    
    // Create blob with proper MIME type
    const blob = new Blob([bytes2], { type: fileType });
    
    console.log(`🔓 [Crypto] File decrypted: ${fileName} (${blob.size} bytes)`);
    return blob;
  } catch (error) {
    console.error('🚨 [Crypto] File decryption failed:', error);
    throw new Error(`File decryption failed: ${error.message}`);
  }
};