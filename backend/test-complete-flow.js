// Test the complete flow: account creation + evidence upload
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

async function testCompleteFlow() {
    console.log('🧪 Testing complete AEGIS flow...\n');
    
    try {
        // Test 1: Health check
        console.log('1️⃣ Testing health endpoint...');
        const health = await makeRequest('/health', 'GET');
        console.log('✅ Health Status:', health.statusCode);
        
        if (health.statusCode === 200) {
            const healthData = JSON.parse(health.data);
            console.log('📊 Users in DB:', healthData.statistics.totalUsers);
            console.log('📊 NGO shards:', healthData.services.ngo.totalShards);
        }
        console.log();

        // Test 2: Account creation
        console.log('2️⃣ Testing account creation...');
        const testWallet = `0x${Math.random().toString(16).substr(2, 8)}${'0'.repeat(32)}`;
        const testData = {
            walletAddress: testWallet,
            shardB: "1:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            shardC: "2:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        };
        
        console.log('📤 Creating account for:', testWallet);
        const createResponse = await makeRequest('/api/v1/account/create', 'POST', testData);
        console.log('📥 Account creation status:', createResponse.statusCode);
        console.log('📥 Response:', createResponse.data);
        
        if (createResponse.statusCode !== 201) {
            console.error('❌ Account creation failed, stopping tests');
            return;
        }
        console.log();

        // Test 3: Shard retrieval for evidence upload
        console.log('3️⃣ Testing shard retrieval...');
        const shardResponse = await makeRequest('/api/v1/account/get-shard', 'POST', {
            walletAddress: testWallet
        });
        console.log('📥 Shard retrieval status:', shardResponse.statusCode);
        console.log('📥 Response:', shardResponse.data);
        
        if (shardResponse.statusCode === 200) {
            const shardData = JSON.parse(shardResponse.data);
            if (shardData.success) {
                console.log('✅ Shard B retrieved successfully!');
                console.log('🔍 Shard B length:', shardData.shardB ? shardData.shardB.length : 'missing');
            }
        }
        console.log();

        // Test 4: Debug endpoint for this user
        console.log('4️⃣ Testing debug endpoint...');
        const debugResponse = await makeRequest(`/api/v1/account/debug/${testWallet}`, 'GET');
        console.log('📥 Debug status:', debugResponse.statusCode);
        
        if (debugResponse.statusCode === 200) {
            const debugData = JSON.parse(debugResponse.data);
            console.log('🔍 Debug info:');
            console.log('  - Shard B exists:', debugData.debug.shards.shardB.exists);
            console.log('  - Shard C exists:', debugData.debug.shards.shardC.exists);
            console.log('  - NGO service shards:', debugData.debug.services.ngo.totalShards);
        }

        console.log('\n🎉 Test completed! Check the logs above for results.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCompleteFlow();