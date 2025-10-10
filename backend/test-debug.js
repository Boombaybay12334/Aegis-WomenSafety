// Quick test script to check debug endpoint
const http = require('http');

async function testDebugEndpoint() {
    try {
        console.log('🧪 Testing debug endpoint...');
        
        const testWallet = '0x940f9388cc3ca0bc99e73817f910dcf5aeb48aa4';
        const path = `/api/v1/account/debug/${testWallet}`;
        
        console.log(`📞 Making request to: http://localhost:5000${path}`);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const response = await new Promise((resolve, reject) => {
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
            
            req.end();
        });
        
        console.log('✅ Response received:');
        console.log('Status:', response.statusCode);
        console.log('Data:', response.data);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testDebugEndpoint();