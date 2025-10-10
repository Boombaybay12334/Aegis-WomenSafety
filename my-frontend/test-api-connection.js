// Test script to verify frontend-backend API connection
// Run this in browser console to test API functions

// Test wallet address
const testAddress = "0x742d35cc6ac0532d0c8dedc6c3b2993f0e99d8f2b";

// Import API functions (adjust path as needed)
// import { checkAvailability, createAccount, verifyAccount } from '../src/services/apiService.js';

console.log("🧪 Testing AEGIS Frontend-Backend Connection...");

// Test 1: Check Availability
async function testCheckAvailability() {
  try {
    console.log("1️⃣ Testing checkAvailability...");
    const response = await fetch('http://localhost:5000/api/v1/account/check-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: testAddress })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Check availability failed:", error);
      return false;
    }
    
    const result = await response.json();
    console.log("✅ Check availability success:", result);
    return result.available;
  } catch (error) {
    console.error("❌ Check availability error:", error);
    return false;
  }
}

// Test 2: Health Check
async function testHealth() {
  try {
    console.log("2️⃣ Testing health endpoint...");
    const response = await fetch('http://localhost:5000/health');
    const result = await response.json();
    console.log("✅ Health check success:", result.status);
    return result.status === 'healthy';
  } catch (error) {
    console.error("❌ Health check error:", error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting API connection tests...");
  
  const healthOk = await testHealth();
  const availabilityOk = await testCheckAvailability();
  
  console.log("\n📊 Test Results:");
  console.log(`Health Endpoint: ${healthOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Availability Endpoint: ${availabilityOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (healthOk && availabilityOk !== false) {
    console.log("\n🎉 Frontend-Backend connection is working!");
    console.log("🔗 API Base URL: http://localhost:5000/api/v1/account");
    console.log("💡 Ready to test account creation and login flows!");
  } else {
    console.log("\n❌ Some tests failed. Check backend server status.");
  }
}

// Export for use in browser console
window.runAPITests = runAllTests;

console.log("💡 Run 'runAPITests()' in browser console to test API connection");