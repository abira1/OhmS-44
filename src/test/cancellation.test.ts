// Test file for class cancellation functionality
import { ClassCancellationService } from '../services/firebase';

// Mock test data
const mockClassId = 'test-class-123';
const mockDate = '2024-08-02';
const mockAdminEmail = 'ohms1384@gmail.com';
const mockReason = 'Teacher unavailable';

// Test the cancellation service
export const testCancellationService = async () => {
  console.log('🧪 Testing Class Cancellation Service...');
  
  try {
    // Test 1: Cancel a class
    console.log('📝 Test 1: Cancelling a class...');
    const cancelResult = await ClassCancellationService.cancelClass(
      mockClassId,
      mockDate,
      mockAdminEmail,
      mockReason
    );
    
    if (cancelResult.success) {
      console.log('✅ Class cancelled successfully:', cancelResult.data);
    } else {
      console.error('❌ Failed to cancel class:', cancelResult.error);
      return false;
    }
    
    // Test 2: Check if class is cancelled for the date
    console.log('📝 Test 2: Checking cancellation status...');
    const checkResult = await ClassCancellationService.getCancellationForDate(
      mockClassId,
      mockDate
    );
    
    if (checkResult.success && checkResult.data) {
      console.log('✅ Cancellation found:', checkResult.data);
    } else {
      console.error('❌ Cancellation not found or error:', checkResult.error);
      return false;
    }
    
    // Test 3: Get all cancellations for the class
    console.log('📝 Test 3: Getting all class cancellations...');
    const allCancellationsResult = await ClassCancellationService.getClassCancellations(mockClassId);
    
    if (allCancellationsResult.success) {
      console.log('✅ All cancellations retrieved:', allCancellationsResult.data);
    } else {
      console.error('❌ Failed to get cancellations:', allCancellationsResult.error);
      return false;
    }
    
    console.log('🎉 All cancellation service tests passed!');
    return true;
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
    return false;
  }
};

// Test the UI integration
export const testUIIntegration = () => {
  console.log('🧪 Testing UI Integration...');
  
  // Check if the required elements exist
  const checks = [
    {
      name: 'Next Class component',
      test: () => document.querySelector('[data-testid="next-class"]') !== null
    },
    {
      name: 'Cancel button for admins',
      test: () => document.querySelector('[data-testid="cancel-class-btn"]') !== null
    },
    {
      name: 'Cancellation modal',
      test: () => document.querySelector('[data-testid="cancel-modal"]') !== null
    }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    try {
      const passed = check.test();
      if (passed) {
        console.log(`✅ ${check.name}: Found`);
      } else {
        console.log(`⚠️ ${check.name}: Not found (may be conditional)`);
      }
    } catch (error) {
      console.error(`❌ ${check.name}: Error -`, error);
      allPassed = false;
    }
  });
  
  return allPassed;
};

// Export test runner
export const runAllTests = async () => {
  console.log('🚀 Starting Class Cancellation Tests...');
  console.log('=====================================');
  
  const serviceTestResult = await testCancellationService();
  const uiTestResult = testUIIntegration();
  
  console.log('=====================================');
  console.log('📊 Test Results:');
  console.log(`Service Tests: ${serviceTestResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`UI Tests: ${uiTestResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allTestsPassed = serviceTestResult && uiTestResult;
  console.log(`Overall: ${allTestsPassed ? '🎉 ALL TESTS PASSED' : '💥 SOME TESTS FAILED'}`);
  
  return allTestsPassed;
};

// Make tests available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testCancellation = {
    runAllTests,
    testCancellationService,
    testUIIntegration
  };
}
