// Test evidence upload flow step by step
const http = require('http');

function makeRequest(path, method, data) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : '';
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(data && { 'Content-Length': Buffer.byteLength(postData) })
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: responseData
                });
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        if (data) {
            req.write(postData);
        }
        req.end();
    });
}

async function testEvidenceUploadFlow() {
    console.log('🧪 Testing evidence upload flow...\n');
    
    try {
        // Create a test account first
        console.log('1️⃣ Creating test account...');
        const testWallet = `0x${Math.random().toString(16).substr(2, 8)}${'0'.repeat(32)}`;
        const accountData = {
            walletAddress: testWallet,
            shardB: "1:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            shardC: "2:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        };
        
        const createResponse = await makeRequest('/api/v1/account/create', 'POST', accountData);
        console.log('Account creation status:', createResponse.statusCode);
        
        if (createResponse.statusCode !== 201) {
            console.error('❌ Account creation failed:', createResponse.data);
            return;
        }
        console.log('✅ Account created successfully');

        // Test shard retrieval (this is where evidence upload might fail)
        console.log('\n2️⃣ Testing shard retrieval...');
        const shardResponse = await makeRequest('/api/v1/account/get-shard', 'POST', {
            walletAddress: testWallet
        });
        console.log('Shard retrieval status:', shardResponse.statusCode);
        console.log('Shard response:', shardResponse.data);
        
        if (shardResponse.statusCode !== 200) {
            console.error('❌ Shard retrieval failed - This is likely the evidence upload issue!');
            return;
        }
        
        const shardData = JSON.parse(shardResponse.data);
        if (!shardData.success || !shardData.shardB) {
            console.error('❌ Shard data invalid:', shardData);
            return;
        }
        console.log('✅ Shard B retrieved:', shardData.shardB);

        // Test evidence upload with minimal data
        console.log('\n3️⃣ Testing evidence upload...');
        const evidenceData = {
            walletAddress: testWallet,
            files: [{
                fileName: 'test.txt',
                fileType: 'text/plain',
                fileSize: 100,
                encryptedData: 'VGVzdCBlbmNyeXB0ZWQgZGF0YQ==', // Base64 encoded test data
                isDescription: false,
                timestamp: new Date().toISOString()
            }],
            steganographyEnabled: false,
            uploadedAt: new Date().toISOString()
        };
        
        const uploadResponse = await makeRequest('/api/v1/evidence/upload', 'POST', evidenceData);
        console.log('Evidence upload status:', uploadResponse.statusCode);
        console.log('Evidence response:', uploadResponse.data);
        
        if (uploadResponse.statusCode === 201) {
            console.log('✅ Evidence upload successful!');
        } else {
            console.error('❌ Evidence upload failed!');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testEvidenceUploadFlow();