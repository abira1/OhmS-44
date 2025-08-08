# Time Logic Testing Guide

## Overview
This guide explains how to test the Current Class and Next Class functionality in the RoutineSection component, including real-time updates and proper time-based logic.

## Fixed Issues

### 1. **12-Hour Time Format Parsing**
- **Problem**: The original code treated time slots as 24-hour format, but they're actually in 12-hour format with AM/PM
- **Solution**: Added `parseTimeToMinutes()` function that properly converts "10:00 AM", "1:45 PM" etc. to 24-hour minutes
- **Impact**: Current and next class detection now works correctly

### 2. **Improved Current/Next Class Logic**
- **Problem**: Simple time slot matching didn't account for proper class sequencing
- **Solution**: Added `getCurrentAndNextClass()` function that:
  - Sorts classes by start time
  - Finds current class based on time range (start ≤ current ≤ end)
  - Finds next upcoming class that hasn't started yet
  - Handles edge cases (no current class, no upcoming classes)

### 3. **Real-time Updates**
- **Problem**: Time updates only occurred every minute but didn't account for class transitions
- **Solution**: Enhanced `updateCurrentTime()` function that:
  - Updates every minute (60-second intervals)
  - Properly calculates current time slot
  - Triggers UI updates for class status changes

## Testing Tools

### 1. **Browser Console Debug Function**
```javascript
// Available in browser console
debugTimeLogic()
```
This function displays:
- Current system time
- Current time in minutes since midnight
- Current time slot
- All today's classes with their time ranges
- Which class is current and which is next

### 2. **Time Testing Utilities**
```javascript
// Set mock time for testing
timeTestUtils.setMockTime("10:30 AM")

// Clear mock time (return to real time)
timeTestUtils.clearMockTime()

// Run all test scenarios
timeTestUtils.runTimeTests()

// View available test scenarios
timeTestUtils.scenarios
```

### 3. **Development Visual Indicators**
In development mode, the TODAY card shows:
- Current system time
- Current time slot (if any)
- Updates in real-time

## Test Scenarios

### Scenario 1: Before First Class (9:00 AM)
```javascript
timeTestUtils.setMockTime("9:00 AM")
debugTimeLogic()
```
**Expected Results:**
- Current Class: None
- Next Class: "Physics-I Lab" (10:00 - 11:40 AM)
- Display: "Next Class" with "Upcoming" badge

### Scenario 2: During First Class (10:30 AM)
```javascript
timeTestUtils.setMockTime("10:30 AM")
debugTimeLogic()
```
**Expected Results:**
- Current Class: "Physics-I Lab"
- Next Class: "History of Bangladesh"
- Display: "Current Class" with "Now" badge

### Scenario 3: Between Classes (12:00 PM)
```javascript
timeTestUtils.setMockTime("12:00 PM")
debugTimeLogic()
```
**Expected Results:**
- Current Class: None
- Next Class: "History of Bangladesh" (1:45 - 3:00 PM)
- Display: "Next Class" with "Upcoming" badge

### Scenario 4: During Afternoon Class (2:00 PM)
```javascript
timeTestUtils.setMockTime("2:00 PM")
debugTimeLogic()
```
**Expected Results:**
- Current Class: "History of Bangladesh"
- Next Class: "Basic English"
- Display: "Current Class" with "Now" badge

### Scenario 5: After All Classes (6:00 PM)
```javascript
timeTestUtils.setMockTime("6:00 PM")
debugTimeLogic()
```
**Expected Results:**
- Current Class: None
- Next Class: None (or first class of next day)
- Display: "No classes scheduled" or next day's first class

## Manual Testing Steps

### 1. **Real-time Testing**
1. Open the application at different times of day
2. Verify the correct class is shown as current/next
3. Wait for minute transitions to see real-time updates
4. Check that badges change appropriately

### 2. **Time Slot Verification**
1. Check each time slot in `mockData.ts`:
   - `10:00 - 11:40 AM`
   - `1:45 - 3:00 PM`
   - `3:00 - 4:15 PM`
   - `4:15 - 5:30 PM`
2. Verify parsing works for each format
3. Test edge cases (exactly at start/end times)

### 3. **Cancellation Integration**
1. Test cancellation during current class
2. Test cancellation of next class
3. Verify cancelled classes still show time indicators
4. Check that cancelled styling overrides time-based styling

## Visual Indicators Checklist

### Current Class Display
- [ ] Shows "Current Class" title
- [ ] Displays "Now" badge in coral color
- [ ] Has coral background and border
- [ ] Shows correct class information
- [ ] Updates in real-time

### Next Class Display
- [ ] Shows "Next Class" title
- [ ] Displays "Upcoming" badge in gray
- [ ] Has gray background
- [ ] Shows correct next class information
- [ ] Updates when current class ends

### Cancelled Class Display
- [ ] Shows red background and border
- [ ] Has "Cancelled" badge with ban icon
- [ ] Text has strikethrough effect
- [ ] Still shows time-based indicators underneath
- [ ] Maintains cancellation state across refreshes

## Common Issues and Solutions

### Issue: Time not updating
**Solution**: Check browser console for errors, verify `setInterval` is working

### Issue: Wrong class shown as current
**Solution**: Use `debugTimeLogic()` to check time parsing and comparison logic

### Issue: Classes not transitioning
**Solution**: Verify time ranges don't overlap and are properly sorted

### Issue: Cancellation not working with time logic
**Solution**: Check that cancellation state is properly integrated with time-based display

## Performance Considerations

- Time updates occur every 60 seconds (not every second) to conserve battery
- Time calculations are lightweight (simple arithmetic)
- Real-time listeners are properly cleaned up on component unmount
- Debug functions are only available in development mode
