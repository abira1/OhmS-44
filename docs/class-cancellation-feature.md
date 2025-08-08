# Class Cancellation Feature Documentation

## Overview
The Class Cancellation feature allows admin users to cancel classes for specific dates. This feature provides real-time updates, persistence across page refreshes, and appropriate UI feedback.

## Features

### 1. Admin-Only Access
- Only users with admin permissions can cancel classes
- Regular users can view cancellation status but cannot cancel classes
- Permission is controlled through the `canCancelClasses` permission

### 2. Real-Time Status Display
- Current and upcoming classes show their cancellation status
- Cancelled classes display with:
  - Red background and border
  - Strikethrough text on class name
  - "Cancelled" badge with ban icon
  - Red-tinted text for all class information

### 3. Cancellation Workflow
- Admin users see "Click to cancel" hint on class components
- Clicking on a class opens a cancellation modal
- Modal includes:
  - Class details confirmation
  - Optional reason field
  - Cancel/Confirm buttons
  - Loading state during processing

### 4. Data Persistence
- Cancellations are stored in Firebase Realtime Database
- Status persists across page refreshes
- Real-time listeners update UI when cancellations change

## Technical Implementation

### Database Structure
```
classCancellations/
  {cancellationId}/
    id: string
    classId: string (format: "{subject}-{code}")
    date: string (YYYY-MM-DD format)
    reason?: string
    cancelledBy: string (admin email)
    cancelledAt: number (timestamp)
    isActive: boolean
```

### Key Components

#### 1. ClassCancellationService
- `cancelClass()` - Creates a new cancellation record
- `getCancellationForDate()` - Checks if a class is cancelled for a specific date
- `getClassCancellations()` - Gets all cancellations for a class
- `reactivateClass()` - Marks a cancellation as inactive

#### 2. useClassCancellations Hook
- Provides React hooks for cancellation operations
- Includes real-time listeners for automatic UI updates
- Handles loading states and error management

#### 3. RoutineSection Component Updates
- Enhanced Next Class display with cancellation status
- Cancellation modal for admin users
- Real-time status updates
- Proper permission checking

### Database Rules
```json
"classCancellations": {
  ".read": "auth != null && (admin_emails || approved_user)",
  ".write": "auth != null && admin_emails",
  ".indexOn": ["classId", "date", "isActive"]
}
```

## Usage Instructions

### For Admin Users
1. Navigate to the Class Routine section
2. Look for the "Next Class" or "Current Class" component
3. If you have admin permissions, you'll see "Click to cancel" text
4. Click on the class component to open the cancellation modal
5. Optionally enter a reason for cancellation
6. Click "Cancel Class" to confirm
7. The class will immediately show as cancelled

### For Regular Users
1. View the routine section normally
2. Cancelled classes will appear with red styling and "Cancelled" badge
3. No cancellation controls are available

## Testing

### Automated Tests
Run the test script in browser console:
```javascript
// Load the test script
testCancellation.runTests()

// Test cancellation workflow
testCancellation.helpers.simulateClassCancellation()
```

### Manual Testing Checklist
- [ ] Admin users can see cancel option
- [ ] Regular users cannot see cancel option
- [ ] Cancellation modal opens correctly
- [ ] Cancellation is processed and saved
- [ ] UI updates immediately after cancellation
- [ ] Cancelled status persists after page refresh
- [ ] Real-time updates work across browser tabs
- [ ] Database rules prevent unauthorized access

## Error Handling
- Network errors during cancellation show appropriate feedback
- Invalid permissions are handled gracefully
- Missing data scenarios are covered
- Loading states prevent multiple submissions

## Future Enhancements
- Bulk cancellation for multiple classes
- Cancellation history and audit trail
- Email notifications for cancellations
- Temporary cancellations with auto-reactivation
- Integration with calendar systems

## Security Considerations
- All cancellation operations require admin authentication
- Database rules enforce permission checking
- Client-side permissions are validated server-side
- Cancellation data includes audit information (who, when, why)
