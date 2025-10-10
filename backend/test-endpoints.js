// Quick test using child_process to avoid terminal conflicts
const { exec } = require('child_process');

console.log('🧪 Testing debug endpoint with curl...');

const testWallet = '0x940f9388cc3ca0bc99e73817f910dcf5aeb48aa4';
const url = `http://localhost:5000/api/v1/account/debug/${testWallet}`;

// Use PowerShell Invoke-WebRequest
const command = `powershell -Command "try { $response = Invoke-WebRequest -Uri '${url}' -Method GET; Write-Output 'Status:'; Write-Output $response.StatusCode; Write-Output 'Content:'; Write-Output $response.Content } catch { Write-Output 'Error:'; Write-Output $_.Exception.Message }"`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Command error:', error.message);
        return;
    }
    if (stderr) {
        console.error('❌ Stderr:', stderr);
        return;
    }
    
    console.log('✅ Response:');
    console.log(stdout);
});

// Also test health endpoint
setTimeout(() => {
    console.log('\n🏥 Testing health endpoint...');
    const healthCommand = `powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/health' -Method GET; Write-Output 'Health Status:'; Write-Output $response.StatusCode; Write-Output 'Health Content:'; Write-Output $response.Content } catch { Write-Output 'Health Error:'; Write-Output $_.Exception.Message }"`;
    
    exec(healthCommand, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Health command error:', error.message);
            return;
        }
        if (stderr) {
            console.error('❌ Health stderr:', stderr);
            return;
        }
        
        console.log('✅ Health Response:');
        console.log(stdout);
    });
}, 2000);