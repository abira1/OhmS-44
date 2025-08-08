// Browser console test script for class cancellation functionality
// Run this in the browser console to test the cancellation features

console.log('🧪 Class Cancellation Test Script Loaded');
console.log('========================================');

// Test helper functions
const testHelpers = {
  // Check if user is admin
  checkAdminStatus: () => {
    const isAdmin = window.localStorage.getItem('isAdmin') === 'true';
    console.log(`👤 Admin Status: ${isAdmin ? '✅ Admin' : '❌ Not Admin'}`);
    return isAdmin;
  },

  // Check if Next Class component exists
  checkNextClassComponent: () => {
    const nextClassElement = document.querySelector('[data-testid="next-class"]');
    const exists = nextClassElement !== null;
    console.log(`🏠 Next Class Component: ${exists ? '✅ Found' : '❌ Not Found'}`);
    return exists;
  },

  // Check if cancel button is visible (for admins)
  checkCancelButton: () => {
    const cancelBtn = document.querySelector('[data-testid="cancel-class-btn"]');
    const exists = cancelBtn !== null;
    console.log(`🔘 Cancel Button: ${exists ? '✅ Visible' : '❌ Not Visible'}`);
    return exists;
  },

  // Check if cancellation modal can be opened
  checkCancellationModal: () => {
    const modal = document.querySelector('[data-testid="cancel-modal"]');
    const exists = modal !== null;
    console.log(`📋 Cancellation Modal: ${exists ? '✅ Open' : '❌ Not Open'}`);
    return exists;
  },

  // Simulate clicking on Next Class to trigger cancellation
  simulateClassCancellation: () => {
    const nextClassElement = document.querySelector('[data-testid="next-class"]');
    if (nextClassElement) {
      console.log('🖱️ Simulating click on Next Class component...');
      nextClassElement.click();
      
      // Check if modal opened after a short delay
      setTimeout(() => {
        const modalOpened = testHelpers.checkCancellationModal();
        if (modalOpened) {
          console.log('✅ Cancellation workflow triggered successfully!');
        } else {
          console.log('❌ Cancellation modal did not open');
        }
      }, 500);
    } else {
      console.log('❌ Cannot simulate cancellation - Next Class component not found');
    }
  },

  // Check current class status
  checkClassStatus: () => {
    const nextClassElement = document.querySelector('[data-testid="next-class"]');
    if (nextClassElement) {
      const cancelledIndicator = nextClassElement.querySelector('[class*="line-through"]');
      const cancelledBadge = nextClassElement.querySelector('span:contains("Cancelled")');
      
      const isCancelled = cancelledIndicator !== null || cancelledBadge !== null;
      console.log(`📅 Class Status: ${isCancelled ? '❌ Cancelled' : '✅ Active'}`);
      return isCancelled;
    }
    return false;
  }
};

// Main test function
const runCancellationTests = () => {
  console.log('🚀 Running Class Cancellation Tests...');
  console.log('=====================================');

  const results = {
    adminStatus: testHelpers.checkAdminStatus(),
    nextClassComponent: testHelpers.checkNextClassComponent(),
    cancelButton: testHelpers.checkCancelButton(),
    classStatus: testHelpers.checkClassStatus()
  };

  console.log('=====================================');
  console.log('📊 Test Results Summary:');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${test}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  });

  const allTestsPassed = Object.values(results).every(result => result === true);
  console.log(`\n🎯 Overall Result: ${allTestsPassed ? '🎉 ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);

  if (results.adminStatus && results.nextClassComponent) {
    console.log('\n🔧 Additional Actions Available:');
    console.log('- Run testHelpers.simulateClassCancellation() to test the cancellation workflow');
    console.log('- Check the browser network tab for Firebase requests');
    console.log('- Refresh the page to test persistence');
  }

  return results;
};

// Manual test instructions
const showTestInstructions = () => {
  console.log('📋 Manual Testing Instructions:');
  console.log('==============================');
  console.log('1. Ensure you are logged in as an admin user');
  console.log('2. Navigate to the routine section');
  console.log('3. Look for the "Next Class" or "Current Class" component');
  console.log('4. If you are an admin, you should see "Click to cancel" text');
  console.log('5. Click on the class component to open the cancellation modal');
  console.log('6. Fill in the cancellation reason (optional)');
  console.log('7. Click "Cancel Class" to confirm');
  console.log('8. Verify the class shows as "Cancelled" with appropriate styling');
  console.log('9. Refresh the page to test persistence');
  console.log('10. Check that the cancellation persists across page reloads');
};

// Export functions to global scope for console access
window.testCancellation = {
  runTests: runCancellationTests,
  helpers: testHelpers,
  instructions: showTestInstructions
};

// Auto-run basic tests
console.log('🔄 Auto-running basic tests...');
runCancellationTests();

console.log('\n💡 Available Commands:');
console.log('- testCancellation.runTests() - Run all tests');
console.log('- testCancellation.helpers.simulateClassCancellation() - Test cancellation workflow');
console.log('- testCancellation.instructions() - Show manual testing guide');
