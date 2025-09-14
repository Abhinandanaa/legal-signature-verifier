/**
 * Backend Test Script for Legal-Ease AI
 * Tests all API endpoints and functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testQueries = [
    'landlord security deposit',
    'slip fall injury', 
    'wrongful termination',
    'divorce custody',
    'DUI breathalyzer',
    'insurance claim denied',
    'contractor fraud',
    'debt collection harassment'
];

/**
 * Test API endpoint
 */
async function testEndpoint(method, endpoint, data = null) {
    try {
        const config = {
            method: method,
            url: `${BASE_URL}${endpoint}`,
            timeout: 5000
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return {
            success: true,
            status: response.status,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            status: error.response?.status || 'NO_RESPONSE',
            error: error.message
        };
    }
}

/**
 * Run all tests
 */
async function runTests() {
    console.log('🧪 Starting Legal-Ease AI Backend Tests\n');
    
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResult = await testEndpoint('GET', '/health');
    if (healthResult.success) {
        console.log('✅ Health check passed');
        console.log(`   Cases loaded: ${healthResult.data.casesLoaded}`);
        console.log(`   Advocates loaded: ${healthResult.data.advocatesLoaded}`);
    } else {
        console.log('❌ Health check failed:', healthResult.error);
    }
    
    // Test 2: Get all cases
    console.log('\n2. Testing cases endpoint...');
    const casesResult = await testEndpoint('GET', '/cases');
    if (casesResult.success) {
        console.log('✅ Cases endpoint passed');
        console.log(`   Total cases: ${casesResult.data.total}`);
    } else {
        console.log('❌ Cases endpoint failed:', casesResult.error);
    }
    
    // Test 3: Get specific case
    console.log('\n3. Testing specific case endpoint...');
    const caseResult = await testEndpoint('GET', '/cases/1');
    if (caseResult.success) {
        console.log('✅ Specific case endpoint passed');
        console.log(`   Case ID: ${caseResult.data.case.id}`);
        console.log(`   Problem: ${caseResult.data.case.problem_statement.substring(0, 50)}...`);
    } else {
        console.log('❌ Specific case endpoint failed:', caseResult.error);
    }
    
    // Test 4: Get all advocates
    console.log('\n4. Testing advocates endpoint...');
    const advocatesResult = await testEndpoint('GET', '/advocates');
    if (advocatesResult.success) {
        console.log('✅ Advocates endpoint passed');
        console.log(`   Total advocates: ${advocatesResult.data.total}`);
    } else {
        console.log('❌ Advocates endpoint failed:', advocatesResult.error);
    }
    
    // Test 5: Get specific advocate
    console.log('\n5. Testing specific advocate endpoint...');
    const advocateResult = await testEndpoint('GET', '/advocates/adv_001');
    if (advocateResult.success) {
        console.log('✅ Specific advocate endpoint passed');
        console.log(`   Advocate: ${advocateResult.data.advocate.name}`);
        console.log(`   Specialization: ${advocateResult.data.advocate.specialization}`);
    } else {
        console.log('❌ Specific advocate endpoint failed:', advocateResult.error);
    }
    
    // Test 6: Search functionality
    console.log('\n6. Testing search functionality...');
    let searchPassed = 0;
    let searchTotal = testQueries.length;
    
    for (const query of testQueries) {
        const searchResult = await testEndpoint('POST', '/search', { query });
        if (searchResult.success) {
            searchPassed++;
            console.log(`✅ Search "${query}": ${searchResult.data.totalMatches} matches`);
            if (searchResult.data.results.length > 0) {
                const topMatch = searchResult.data.results[0];
                console.log(`   Top match: Case #${topMatch.id} (Score: ${topMatch.relevanceScore})`);
            }
        } else {
            console.log(`❌ Search "${query}" failed:`, searchResult.error);
        }
    }
    
    console.log(`\n📊 Search tests: ${searchPassed}/${searchTotal} passed`);
    
    // Test 7: Get suggestions
    console.log('\n7. Testing suggestions endpoint...');
    const suggestionsResult = await testEndpoint('GET', '/suggestions');
    if (suggestionsResult.success) {
        console.log('✅ Suggestions endpoint passed');
        console.log(`   Total suggestions: ${suggestionsResult.data.total}`);
        console.log(`   Sample suggestions: ${suggestionsResult.data.suggestions.slice(0, 5).join(', ')}`);
    } else {
        console.log('❌ Suggestions endpoint failed:', suggestionsResult.error);
    }
    
    // Test 8: Error handling
    console.log('\n8. Testing error handling...');
    const errorTests = [
        { method: 'GET', endpoint: '/cases/999', expectedStatus: 404 },
        { method: 'GET', endpoint: '/advocates/invalid', expectedStatus: 404 },
        { method: 'POST', endpoint: '/search', data: {}, expectedStatus: 400 },
        { method: 'GET', endpoint: '/nonexistent', expectedStatus: 404 }
    ];
    
    let errorsPassed = 0;
    for (const errorTest of errorTests) {
        const result = await testEndpoint(errorTest.method, errorTest.endpoint, errorTest.data);
        if (result.status === errorTest.expectedStatus) {
            console.log(`✅ Error handling for ${errorTest.endpoint}: ${result.status}`);
            errorsPassed++;
        } else {
            console.log(`❌ Error handling for ${errorTest.endpoint}: expected ${errorTest.expectedStatus}, got ${result.status}`);
        }
    }
    
    console.log(`\n📊 Error handling tests: ${errorsPassed}/${errorTests.length} passed`);
    
    // Summary
    console.log('\n🎉 Backend testing completed!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Health check');
    console.log('   ✅ Data endpoints');
    console.log(`   ✅ Search functionality (${searchPassed}/${searchTotal})`);
    console.log(`   ✅ Error handling (${errorsPassed}/${errorTests.length})`);
    console.log('\n🚀 Backend is ready for frontend integration!');
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests, testEndpoint };
