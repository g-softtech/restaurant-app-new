const axios = require('axios');

async function quickTest() {
  console.log('🧪 Quick Test Started...\n');

  // Test 1: Loyalty Program
  try {
    const res = await axios.get('http://localhost:5001/api/loyalty/program-info');
    console.log('✅ Test 1 - Loyalty Program Info: PASSED');
    console.log('   Program:', res.data.program.name);
  } catch (error) {
    console.log('❌ Test 1 FAILED:', error.message);
  }

  // Test 2: Coupon Validation
  try {
    const res = await axios.post('http://localhost:5001/api/coupons/validate', {
      code: 'TEST',
      orderAmount: 100
    });
    console.log('✅ Test 2 - Coupon Validate: PASSED');
  } catch (error) {
    if (error.response?.data?.message === 'Invalid coupon code') {
      console.log('✅ Test 2 - Coupon Validate: PASSED (Expected error for invalid code)');
    } else {
      console.log('❌ Test 2 FAILED:', error.message);
    }
  }

  console.log('\n✅ All tests complete!');
}

quickTest();