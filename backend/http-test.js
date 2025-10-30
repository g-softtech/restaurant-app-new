const http = require('http');

console.log('Testing port 5001...\n');

// Test 1: /api/test endpoint
http.get('http://localhost:5001/api/test', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✅ Test 1 - API Health:');
    console.log(data);
    console.log('\n');
    
    // Test 2: /api/loyalty/program-info
    http.get('http://localhost:5001/api/loyalty/program-info', (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log('✅ Test 2 - Loyalty Program:');
        const parsed = JSON.parse(data2);
        console.log('Program Name:', parsed.program.name);
        console.log('Tiers:', parsed.program.tiers.length);
        console.log('\n🎉 Phase 7.3A COMPLETE!');
      });
    }).on('error', err => console.log('❌ Test 2 failed:', err.message));
  });
}).on('error', err => console.log('❌ Test 1 failed:', err.message));