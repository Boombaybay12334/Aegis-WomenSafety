// Simple test to check server health and debug endpoint
const http = require('http');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: data
                });
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing server connectivity...\n');
    
    // Test health endpoint first
    try {
        console.log('1️⃣ Testing health endpoint...');
        const health = await makeRequest('/health');
        console.log('✅ Health endpoint response:');
        console.log('Status:', health.statusCode);
        console.log('Data:', health.data);
        console.log();
    } catch (error) {
        console.error('❌ Health endpoint failed:', error.message);
        return;
    }

    // Test debug endpoint
    try {
        console.log('2️⃣ Testing debug endpoint...');
        const testWallet = '0x940f9388cc3ca0bc99e73817f910dcf5aeb48aa4';
        const debug = await makeRequest(`/api/v1/account/debug/${testWallet}`);
        console.log('✅ Debug endpoint response:');
        console.log('Status:', debug.statusCode);
        console.log('Data:', debug.data);
    } catch (error) {
        console.error('❌ Debug endpoint failed:', error.message);
    }
}

runTests();