// Test account creation endpoint
const http = require('http');

function makeRequest(path, method, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
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
        
        req.write(postData);
        req.end();
    });
}

async function testAccountCreation() {
    console.log('🧪 Testing account creation endpoint...\n');
    
    try {
        // Test data for account creation
        const testData = {
            walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
            shardB: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            shardC: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        };
        
        console.log('📤 Testing account creation with data:');
        console.log('Wallet:', testData.walletAddress);
        console.log('Shard B length:', testData.shardB.length);
        console.log('Shard C length:', testData.shardC.length);
        console.log();
        
        const response = await makeRequest('/api/v1/account/create', 'POST', testData);
        
        console.log('✅ Account creation response:');
        console.log('Status:', response.statusCode);
        console.log('Response:', response.data);
        
    } catch (error) {
        console.error('❌ Account creation failed:', error.message);
    }
}

testAccountCreation();