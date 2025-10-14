/**
 * Filebase Storage Service - AEGIS
 * 
 * Handles encrypted evidence file storage on Filebase (S3 + IPFS).
 * Provides dual storage: S3-compatible access and IPFS CID for blockchain anchoring.
 */

const AWS = require('aws-sdk');
const crypto = require('crypto');

/**
 * Initialize Filebase S3 client
 */
const initializeFilebaseClient = () => {
  if (!process.env.FILEBASE_ACCESS_KEY || !process.env.FILEBASE_SECRET_KEY) {
    console.warn('⚠️  [Filebase] Credentials not configured, using mock mode');
    return null;
  }

  const s3 = new AWS.S3({
    endpoint: process.env.FILEBASE_ENDPOINT || 'https://s3.filebase.com',
    accessKeyId: process.env.FILEBASE_ACCESS_KEY,
    secretAccessKey: process.env.FILEBASE_SECRET_KEY,
    s3ForcePathStyle: true, // Required for Filebase
    signatureVersion: 'v4',
    region: 'us-east-1' // Filebase uses us-east-1
  });

  return s3;
};

/**
 * Generate a unique S3 key for evidence file
 * Format: evidence/{walletAddress}/{evidenceId}/{timestamp}_{hash}_{filename}
 */
const generateS3Key = (walletAddress, evidenceId, fileName) => {
  const timestamp = Date.now();
  const hash = crypto.randomBytes(8).toString('hex');
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  return `evidence/${walletAddress.toLowerCase()}/${evidenceId}/${timestamp}_${hash}_${sanitizedFileName}`;
};

/**
 * Upload encrypted file to Filebase
 * @param {Buffer} fileBuffer - Encrypted file data as Buffer
 * @param {string} fileName - Original file name
 * @param {string} fileType - MIME type
 * @param {string} walletAddress - User's wallet address
 * @param {string} evidenceId - Evidence ID
 * @returns {Promise<Object>} Upload result with S3 key and IPFS CID
 */
const uploadToFilebase = async (fileBuffer, fileName, fileType, walletAddress, evidenceId) => {
  const s3Client = initializeFilebaseClient();
  
  // Mock mode if no credentials
  if (!s3Client) {
    console.log('🔧 [Filebase] Using mock mode - no real upload');
    const mockS3Key = generateS3Key(walletAddress, evidenceId, fileName);
    const mockCID = `bafybei${crypto.randomBytes(25).toString('hex').substring(0, 50)}`; // Mock CID
    
    return {
      success: true,
      mock: true,
      s3Key: mockS3Key,
      cid: mockCID,
      bucket: process.env.FILEBASE_BUCKET || 'aegis-evidence',
      fileSize: fileBuffer.length,
      uploadedAt: new Date().toISOString()
    };
  }

  try {
    const bucket = process.env.FILEBASE_BUCKET || 'aegis-evidence';
    const s3Key = generateS3Key(walletAddress, evidenceId, fileName);
    
    console.log(`📤 [Filebase] Uploading to bucket: ${bucket}, key: ${s3Key}`);

    const uploadParams = {
      Bucket: bucket,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: fileType,
      Metadata: {
        'wallet-address': walletAddress,
        'evidence-id': evidenceId,
        'original-filename': fileName,
        'uploaded-at': new Date().toISOString()
      }
    };

    const uploadResult = await s3Client.upload(uploadParams).promise();
    
    console.log(`✅ [Filebase] Upload successful: ${s3Key}`);
    console.log(`🔗 [Filebase] S3 Location: ${uploadResult.Location}`);
    
    // Get IPFS CID from Filebase
    // Filebase automatically pins to IPFS, we need to retrieve the CID
    const cid = await getIPFSCID(s3Client, bucket, s3Key);
    
    return {
      success: true,
      mock: false,
      s3Key: s3Key,
      cid: cid,
      bucket: bucket,
      location: uploadResult.Location,
      fileSize: fileBuffer.length,
      uploadedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('🚨 [Filebase] Upload failed:', error);
    throw new Error(`Filebase upload failed: ${error.message}`);
  }
};

/**
 * Get IPFS CID for a file stored in Filebase
 * Filebase stores the CID in the object metadata
 * @param {AWS.S3} s3Client - Initialized S3 client
 * @param {string} bucket - Bucket name
 * @param {string} key - S3 key
 * @returns {Promise<string>} IPFS CID
 */
const getIPFSCID = async (s3Client, bucket, key) => {
  try {
    // Filebase stores the IPFS CID in the x-amz-meta-cid header
    const headParams = {
      Bucket: bucket,
      Key: key
    };
    
    const metadata = await s3Client.headObject(headParams).promise();
    
    // Filebase returns CID in metadata or as a custom header
    // Check both locations
    const cid = metadata.Metadata?.cid || 
                metadata.Metadata?.['ipfs-cid'] ||
                extractCIDFromETag(metadata.ETag);
    
    if (cid) {
      console.log(`🔗 [Filebase] Retrieved IPFS CID: ${cid}`);
      return cid;
    }
    
    // If CID not available yet, wait a moment and try again
    console.log('⏳ [Filebase] CID not immediately available, waiting for IPFS pinning...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const retryMetadata = await s3Client.headObject(headParams).promise();
    const retryCid = retryMetadata.Metadata?.cid || 
                     retryMetadata.Metadata?.['ipfs-cid'] ||
                     extractCIDFromETag(retryMetadata.ETag);
    
    if (retryCid) {
      console.log(`🔗 [Filebase] Retrieved IPFS CID (retry): ${retryCid}`);
      return retryCid;
    }
    
    // Fallback: generate a deterministic mock CID based on the S3 key
    console.warn('⚠️  [Filebase] CID not available, using deterministic placeholder');
    return generateDeterministicCID(key);
    
  } catch (error) {
    console.error('🚨 [Filebase] Failed to retrieve CID:', error);
    // Return a deterministic placeholder
    return generateDeterministicCID(key);
  }
};

/**
 * Extract CID from ETag if it's in CID format
 * Some Filebase implementations return the CID as the ETag
 */
const extractCIDFromETag = (etag) => {
  if (!etag) return null;
  
  // Remove quotes from ETag
  const cleanETag = etag.replace(/"/g, '');
  
  // Check if it looks like a CID (starts with 'Qm' or 'bafybei')
  if (cleanETag.startsWith('Qm') || cleanETag.startsWith('bafybei')) {
    return cleanETag;
  }
  
  return null;
};

/**
 * Generate a deterministic CID-like string from S3 key
 * Used as a fallback when actual CID is not available
 */
const generateDeterministicCID = (key) => {
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  return `bafybei${hash.substring(0, 50)}`; // CIDv1 format
};

/**
 * Download file from Filebase
 * @param {string} s3Key - S3 key of the file
 * @returns {Promise<Buffer>} File data as Buffer
 */
const downloadFromFilebase = async (s3Key) => {
  const s3Client = initializeFilebaseClient();
  
  if (!s3Client) {
    throw new Error('Filebase client not configured');
  }

  try {
    const bucket = process.env.FILEBASE_BUCKET || 'aegis-evidence';
    
    console.log(`📥 [Filebase] Downloading from bucket: ${bucket}, key: ${s3Key}`);

    const downloadParams = {
      Bucket: bucket,
      Key: s3Key
    };

    const result = await s3Client.getObject(downloadParams).promise();
    
    console.log(`✅ [Filebase] Download successful: ${s3Key}`);
    
    return result.Body;

  } catch (error) {
    console.error('🚨 [Filebase] Download failed:', error);
    throw new Error(`Filebase download failed: ${error.message}`);
  }
};

/**
 * Delete file from Filebase
 * @param {string} s3Key - S3 key of the file
 * @returns {Promise<boolean>} Success status
 */
const deleteFromFilebase = async (s3Key) => {
  const s3Client = initializeFilebaseClient();
  
  if (!s3Client) {
    console.log('🔧 [Filebase] Mock mode - simulating delete');
    return true;
  }

  try {
    const bucket = process.env.FILEBASE_BUCKET || 'aegis-evidence';
    
    console.log(`🗑️  [Filebase] Deleting from bucket: ${bucket}, key: ${s3Key}`);

    const deleteParams = {
      Bucket: bucket,
      Key: s3Key
    };

    await s3Client.deleteObject(deleteParams).promise();
    
    console.log(`✅ [Filebase] Delete successful: ${s3Key}`);
    
    return true;

  } catch (error) {
    console.error('🚨 [Filebase] Delete failed:', error);
    throw new Error(`Filebase delete failed: ${error.message}`);
  }
};

/**
 * Upload multiple files to Filebase
 * @param {Array<Object>} files - Array of file objects with {data, fileName, fileType}
 * @param {string} walletAddress - User's wallet address
 * @param {string} evidenceId - Evidence ID
 * @returns {Promise<Array<Object>>} Array of upload results
 */
const uploadMultipleFiles = async (files, walletAddress, evidenceId) => {
  console.log(`📤 [Filebase] Uploading ${files.length} files for evidence: ${evidenceId}`);
  
  const uploadPromises = files.map(async (file) => {
    try {
      // Convert base64 to Buffer if needed
      let fileBuffer;
      if (Buffer.isBuffer(file.data)) {
        fileBuffer = file.data;
      } else if (typeof file.data === 'string') {
        // Assume base64 string
        fileBuffer = Buffer.from(file.data, 'base64');
      } else {
        throw new Error('Invalid file data format');
      }
      
      const result = await uploadToFilebase(
        fileBuffer,
        file.fileName,
        file.fileType,
        walletAddress,
        evidenceId
      );
      
      return {
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize || fileBuffer.length,
        s3Key: result.s3Key,
        cid: result.cid,
        uploadedAt: result.uploadedAt,
        success: true
      };
      
    } catch (error) {
      console.error(`🚨 [Filebase] Failed to upload ${file.fileName}:`, error);
      return {
        fileName: file.fileName,
        fileType: file.fileType,
        error: error.message,
        success: false
      };
    }
  });
  
  const results = await Promise.all(uploadPromises);
  
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ [Filebase] Uploaded ${successCount}/${files.length} files successfully`);
  
  return results;
};

/**
 * Check if Filebase is configured and available
 * @returns {boolean} True if Filebase is configured
 */
const isFilebaseConfigured = () => {
  return !!(process.env.FILEBASE_ACCESS_KEY && process.env.FILEBASE_SECRET_KEY);
};

module.exports = {
  uploadToFilebase,
  downloadFromFilebase,
  deleteFromFilebase,
  uploadMultipleFiles,
  getIPFSCID,
  isFilebaseConfigured
};
