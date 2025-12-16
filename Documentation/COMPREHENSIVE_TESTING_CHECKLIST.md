# Comprehensive Manual Testing Checklist - Registrar ODR System

## Table of Contents
1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [User Authentication Flows](#user-authentication-flows)
4. [Document Request Flows](#document-request-flows)
5. [Tracking Flows](#tracking-flows)
6. [Admin Authentication Flows](#admin-authentication-flows)
7. [Admin Dashboard Flows](#admin-dashboard-flows)
8. [Request Management Flows](#request-management-flows)
9. [Document Management Flows](#document-management-flows)
10. [Settings & Configuration Flows](#settings--configuration-flows)
11. [Integration Flows](#integration-flows)
12. [Error Handling & Edge Cases](#error-handling--edge-cases)
13. [Performance & Security Testing](#performance--security-testing)
14. [Mobile Responsiveness](#mobile-responsiveness)
15. [Cross-browser Testing](#cross-browser-testing)

---

## System Overview
**Application Type**: Document Request Management System  
**Key Components**: 
- User Portal (React frontend)
- Admin Portal (React frontend) 
- Flask Backend API
- Supabase Integration (File Storage)
- WhatsApp Integration (OTP & Notifications)

**User Roles**:
- Students/Outsiders (Requesters)
- Admin Staff (Manager, Admin, Staff with different permissions)

---

## Prerequisites

### Test Environment Setup
- [ ] Backend server running on correct port
- [ ] Frontend development server running
- [ ] Database connection established
- [ ] Supabase bucket configured and accessible
- [ ] WhatsApp API credentials configured
- [ ] Test student accounts created
- [ ] Test admin accounts with different roles created
- [ ] Test documents and requirements populated

### Browser Requirements
- [ ] Chrome (latest version)
- [ ] Firefox (latest version)
- [ ] Safari (latest version)
- [ ] Edge (latest version)
- [ ] Mobile browsers (iOS Safari, Android Chrome)

---

## User Authentication Flows

### Student ID Authentication
- [ ] **TC001**: Valid student ID verification
  - [ ] Enter valid student ID
  - [ ] Verify student exists in system
  - [ ] Check no liability restrictions
  - [ ] Verify OTP sent via WhatsApp
  - [ ] Verify masked phone number displayed
  - [ ] Verify JWT token created
  - [ ] Verify redirect to appropriate page

- [ ] **TC002**: Invalid student ID verification
  - [ ] Enter non-existent student ID
  - [ ] Verify appropriate error message
  - [ ] Verify no OTP sent
  - [ ] Verify user remains on login page

- [ ] **TC003**: Student with outstanding liabilities
  - [ ] Enter student ID with liability restrictions
  - [ ] Verify system detects liability
  - [ ] Verify appropriate restriction message
  - [ ] Verify user cannot proceed with request

### Name-based Authentication (Outsider Requests)
- [ ] **TC004**: Valid name verification
  - [ ] Enter valid first and last name
  - [ ] Enter requester WhatsApp number
  - [ ] Enter requester name
  - [ ] Verify name matches database records
  - [ ] Verify OTP sent to provided number
  - [ ] Verify outsider flag set correctly

- [ ] **TC005**: Name mismatch verification
  - [ ] Enter mismatched name combination
  - [ ] Verify appropriate error message
  - [ ] Verify user cannot proceed

### OTP Verification
- [ ] **TC006**: Valid OTP verification
  - [ ] Enter correct OTP code
  - [ ] Verify OTP validation successful
  - [ ] Verify session created
  - [ ] Verify JWT token issued
  - [ ] Verify user authenticated

- [ ] **TC007**: Invalid OTP verification
  - [ ] Enter incorrect OTP code
  - [ ] Verify error message displayed
  - [ ] Verify user remains unauthenticated
  - [ ] Verify retry attempts allowed

- [ ] **TC008**: OTP expiration handling
  - [ ] Wait for OTP expiration
  - [ ] Verify session expires appropriately
  - [ ] Verify user prompted to request new OTP

### OTP Resend Functionality
- [ ] **TC009**: OTP resend functionality
  - [ ] Request new OTP during active session
  - [ ] Verify new OTP sent successfully
  - [ ] Verify previous OTP invalidated
  - [ ] Verify resend limit respected

---

## Document Request Flows

### Request Initiation
- [ ] **TC010**: Valid user accessing request page
  - [ ] Navigate to request page as authenticated user
  - [ ] Verify student data populated correctly
  - [ ] Verify available documents loaded
  - [ ] Verify admin fee displayed

- [ ] **TC011**: Active requests check
  - [ ] User with existing active requests
  - [ ] Verify system detects active requests
  - [ ] Verify appropriate warning displayed
  - [ ] Verify user can/cannot proceed based on policy

### Document Selection
- [ ] **TC012**: Document selection functionality
  - [ ] Select multiple documents
  - [ ] Verify quantity selection works
  - [ ] Verify custom documents can be added
  - [ ] Verify total price calculation updates
  - [ ] Verify document requirements loaded

- [ ] **TC013**: Custom document handling
  - [ ] Add custom document
  - [ ] Enter document name and description
  - [ ] Verify custom document saved correctly
  - [ ] Verify custom document included in request

### Requirements Management
- [ ] **TC014**: Requirements loading
  - [ ] Select documents with requirements
  - [ ] Verify requirements displayed correctly
  - [ ] Verify unique requirements shown
  - [ ] Verify file upload fields available

- [ ] **TC015**: File upload functionality
  - [ ] Upload required files
  - [ ] Verify file validation works
  - [ ] Verify file size limits enforced
  - [ ] Verify file types accepted/rejected
  - [ ] Verify upload progress indication

### Request Submission
- [ ] **TC016**: Complete request submission
  - [ ] Fill all required fields
  - [ ] Upload all required files
  - [ ] Submit request
  - [ ] Verify request ID generated
  - [ ] Verify WhatsApp notification sent
  - [ ] Verify confirmation page displayed
  - [ ] Verify session data cleared appropriately

- [ ] **TC017**: Incomplete request submission
  - [ ] Submit with missing required fields
  - [ ] Submit with missing required files
  - [ ] Verify validation errors displayed
  - [ ] Verify request not submitted

### Payment Integration (If applicable)
- [ ] **TC018**: Payment initiation
  - [ ] Initiate payment process
  - [ ] Verify payment gateway integration
  - [ ] Verify payment amount calculation
  - [ ] Verify payment status tracking

- [ ] **TC019**: Payment completion handling
  - [ ] Complete payment successfully
  - [ ] Verify payment status updated
  - [ ] Verify request status updated
  - [ ] Verify confirmation sent

---

## Tracking Flows

### Tracking by Tracking Number
- [ ] **TC020**: Valid tracking number lookup
  - [ ] Enter valid tracking number
  - [ ] Verify tracking data displayed
  - [ ] Verify student authentication check
  - [ ] Verify OTP sent if not authenticated
  - [ ] Verify tracking history shown

- [ ] **TC021**: Invalid tracking number
  - [ ] Enter non-existent tracking number
  - [ ] Verify appropriate error message
  - [ ] Verify no sensitive data leaked

### Order Type Management
- [ ] **TC022**: Order type selection
  - [ ] Select order type for request
  - [ ] Verify selection saved
  - [ ] Verify confirmation received

### Document & Changes Tracking
- [ ] **TC023**: Requested documents viewing
  - [ ] View requested documents list
  - [ ] Verify document details displayed
  - [ ] Verify quantities shown correctly

- [ ] **TC024**: Request changes viewing
  - [ ] View any requested changes
  - [ ] Verify change details displayed
  - [ ] Verify file uploads for changes (if rejected)

### File Upload for Changes
- [ ] **TC025**: File upload for rejected requests
  - [ ] Upload files for rejected request changes
  - [ ] Verify upload restrictions (only REJECTED status)
  - [ ] Verify file saved correctly
  - [ ] Verify confirmation received

---

## Admin Authentication Flows

### Admin Login
- [ ] **TC026**: Valid admin login
  - [ ] Enter valid admin credentials
  - [ ] Verify authentication successful
  - [ ] Verify appropriate dashboard access
  - [ ] Verify role-based permissions applied

- [ ] **TC027**: Invalid admin login
  - [ ] Enter invalid credentials
  - [ ] Verify error message displayed
  - [ ] Verify access denied

### Admin Role Management
- [ ] **TC028**: Role-based access control
  - [ ] Test different admin roles
  - [ ] Verify appropriate menu/access shown
  - [ ] Verify restricted areas properly blocked
  - [ ] Verify permission messages appropriate

---

## Admin Dashboard Flows

### Dashboard Data Loading
- [ ] **TC029**: Dashboard statistics
  - [ ] Verify total requests count
  - [ ] Verify pending requests count
  - [ ] Verify unpaid requests amount
  - [ ] Verify documents ready count
  - [ ] Verify trend indicators accurate

- [ ] **TC030**: Recent activity display
  - [ ] Verify recent requests listed
  - [ ] Verify status colors correct
  - [ ] Verify date/time formatting
  - [ ] Verify pagination works

### Dashboard Interactions
- [ ] **TC031**: Card scrolling functionality
  - [ ] Test left/right scrolling
  - [ ] Verify scroll buttons appear/disappear correctly
  - [ ] Verify smooth scrolling behavior

- [ ] **TC032**: Notifications and profile dropdown
  - [ ] Test notifications dropdown
  - [ ] Test profile dropdown
  - [ ] Verify click-outside closes dropdowns

---

## Request Management Flows

### Request Listing & Filtering
- [ ] **TC033**: Request list display
  - [ ] Verify requests loaded with pagination
  - [ ] Verify search functionality works
  - [ ] Verify filtering by college code
  - [ ] Verify filtering by requester type
  - [ ] Verify filtering by others documents

### Request Status Management
- [ ] **TC034**: Status update functionality
  - [ ] Update request status (PENDING→IN-PROGRESS→DOC-READY→RELEASED)
  - [ ] Verify status change saved
  - [ ] Verify WhatsApp notification sent
  - [ ] Verify status history tracked

- [ ] **TC035**: Status-specific behaviors
  - [ ] Test each valid status transition
  - [ ] Test invalid status transitions blocked
  - [ ] Verify appropriate confirmation messages

### Request Assignment
- [ ] **TC036**: Auto-assignment functionality
  - [ ] Test auto-assign requests
  - [ ] Verify load balancing works
  - [ ] Verify assignment limits respected
  - [ ] Verify assignment notifications sent

- [ ] **TC037**: Manual assignment
  - [ ] Manually assign requests to admin
  - [ ] Verify assignment saved
  - [ ] Verify unassignment functionality
  - [ ] Verify assignment progress tracking

### Request Changes Management
- [ ] **TC038**: Request changes submission
  - [ ] Submit change requests
  - [ ] Verify request rejected automatically
  - [ ] Verify change details saved
  - [ ] Verify notifications sent

### Request Deletion
- [ ] **TC039**: Request deletion
  - [ ] Delete request with confirmation
  - [ ] Verify request removed from system
  - [ ] Verify associated data cleaned up
  - [ ] Verify deletion logged

### Document Completion Tracking
- [ ] **TC040**: Document completion toggle
  - [ ] Toggle document completion status
  - [ ] Verify status saved correctly
  - [ ] Verify visual indicators update

### Assignment Progress Tracking
- [ ] **TC041**: Assignment progress monitoring
  - [ ] View individual admin progress
  - [ ] View all admins progress
  - [ ] Verify completion counts accurate
  - [ ] Verify max request limits enforced

---

## Document Management Flows

### Document Listing
- [ ] **TC042**: Document list display
  - [ ] View all available documents
  - [ ] Verify document details shown
  - [ ] Verify document availability status

### Document Operations
- [ ] **TC043**: Document editing
  - [ ] Edit document details
  - [ ] Verify changes saved
  - [ ] Verify edit restrictions applied

- [ ] **TC044**: Document deletion
  - [ ] Delete unused document
  - [ ] Verify deletion blocked for documents in use
  - [ ] Verify appropriate error messages

- [ ] **TC045**: Document hiding/showing
  - [ ] Hide document from users
  - [ ] Verify hidden documents not selectable
  - [ ] Restore hidden document

---

## Settings & Configuration Flows

### Admin Management
- [ ] **TC046**: Admin user management
  - [ ] Add new admin user
  - [ ] Edit admin user details
  - [ ] Change admin roles
  - [ ] Delete admin user

### System Settings
- [ ] **TC047**: Admin settings configuration
  - [ ] Set max requests per admin
  - [ ] Verify settings saved
  - [ ] Verify settings applied

### Request Settings
- [ ] **TC048**: Request time restrictions
  - [ ] Configure request allowed times
  - [ ] Verify restrictions enforced
  - [ ] Verify bypass functionality (if any)

### Fee Management
- [ ] **TC049**: Admin fee configuration
  - [ ] Update admin fee amount
  - [ ] Verify fee calculation updates
  - [ ] Verify fee display updates

---

## Integration Flows

### WhatsApp Integration
- [ ] **TC050**: OTP delivery
  - [ ] Verify OTP sent to correct number
  - [ ] Verify OTP format correct
  - [ ] Verify delivery success/failure handling

- [ ] **TC051**: Status notification delivery
  - [ ] Verify status change notifications sent
  - [ ] Verify notification content correct
  - [ ] Verify delivery failure handling

### Supabase Integration
- [ ] **TC052**: File upload to Supabase
  - [ ] Upload requirement files
  - [ ] Upload authorization letters
  - [ ] Verify files stored correctly
  - [ ] Verify public URLs generated

- [ ] **TC053**: File access and retrieval
  - [ ] Access uploaded files
  - [ ] Verify file permissions correct
  - [ ] Verify file download works

### Database Integration
- [ ] **TC054**: Data persistence
  - [ ] Verify all data saved correctly
  - [ ] Verify data relationships maintained
  - [ ] Verify transaction integrity

---

## Error Handling & Edge Cases

### Input Validation
- [ ] **TC055**: Form validation
  - [ ] Test required field validation
  - [ ] Test field format validation
  - [ ] Test file type/size validation
  - [ ] Verify error messages clear and helpful

### Network Issues
- [ ] **TC056**: Connection failure handling
  - [ ] Test with poor network connection
  - [ ] Test with connection timeout
  - [ ] Test with server unavailable
  - [ ] Verify appropriate error messages
  - [ ] Verify graceful degradation

### Session Management
- [ ] **TC057**: Session timeout handling
  - [ ] Wait for session expiration
  - [ ] Verify timeout detection
  - [ ] Verify appropriate redirect/logout

- [ ] **TC058**: Concurrent sessions
  - [ ] Test multiple browser tabs
  - [ ] Test session conflict resolution
  - [ ] Verify data consistency

### Data Integrity
- [ ] **TC059**: Database constraint violations
  - [ ] Test duplicate submissions
  - [ ] Test invalid foreign keys
  - [ ] Test constraint violation handling

### File Handling
- [ ] **TC060**: File upload edge cases
  - [ ] Upload very large files
  - [ ] Upload unsupported file types
  - [ ] Upload empty files
  - [ ] Upload files with special characters
  - [ ] Verify appropriate error handling

---

## Performance & Security Testing

### Performance Testing
- [ ] **TC061**: Page load times
  - [ ] Measure initial page load times
  - [ ] Verify load times acceptable (<3 seconds)
  - [ ] Test with slow network conditions

- [ ] **TC062**: Database query performance
  - [ ] Test large dataset queries
  - [ ] Verify pagination works efficiently
  - [ ] Verify search performance acceptable

### Security Testing
- [ ] **TC063**: Authentication security
  - [ ] Test JWT token validation
  - [ ] Test session hijacking protection
  - [ ] Test privilege escalation attempts

- [ ] **TC064**: Input security
  - [ ] Test SQL injection attempts
  - [ ] Test XSS prevention
  - [ ] Test CSRF protection
  - [ ] Test file upload security

- [ ] **TC065**: Authorization testing
  - [ ] Test direct URL access attempts
  - [ ] Test role bypass attempts
  - [ ] Test admin area access controls

---

## Mobile Responsiveness

### Mobile Layout Testing
- [ ] **TC066**: Mobile navigation
  - [ ] Test hamburger menu functionality
  - [ ] Test mobile navigation flow
  - [ ] Test back button behavior

- [ ] **TC067**: Mobile form interactions
  - [ ] Test touch interactions
  - [ ] Test virtual keyboard behavior
  - [ ] Test form scrolling and layout

### Mobile-Specific Features
- [ ] **TC068**: Mobile file upload
  - [ ] Test camera access (if applicable)
  - [ ] Test file selection from device
  - [ ] Test upload progress indication

- [ ] **TC069**: Mobile performance
  - [ ] Test on various mobile devices
  - [ ] Test on different screen sizes
  - [ ] Test touch responsiveness

---

## Cross-browser Testing

### Desktop Browsers
- [ ] **TC070**: Chrome compatibility
  - [ ] Test all features in Chrome
  - [ ] Verify consistent behavior

- [ ] **TC071**: Firefox compatibility
  - [ ] Test all features in Firefox
  - [ ] Verify consistent behavior

- [ ] **TC072**: Safari compatibility
  - [ ] Test all features in Safari
  - [ ] Verify consistent behavior

- [ ] **TC073**: Edge compatibility
  - [ ] Test all features in Edge
  - [ ] Verify consistent behavior

### Mobile Browsers
- [ ] **TC074**: iOS Safari compatibility
  - [ ] Test all features in iOS Safari
  - [ ] Verify mobile-specific behaviors

- [ ] **TC075**: Android Chrome compatibility
  - [ ] Test all features in Android Chrome
  - [ ] Verify mobile-specific behaviors

---

## Testing Completion Checklist

### Pre-Release Testing
- [ ] All critical test cases passed
- [ ] Performance benchmarks met
- [ ] Security tests completed
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness confirmed
- [ ] Integration points tested
- [ ] Error handling validated
- [ ] User acceptance testing completed

### Documentation
- [ ] Test results documented
- [ ] Known issues logged
- [ ] Performance metrics recorded
- [ ] Security findings documented
- [ ] Recommendations provided

### Final Verification
- [ ] Production environment configuration verified
- [ ] Backup and recovery procedures tested
- [ ] Monitoring and alerting configured
- [ ] Support procedures documented

---

## Test Execution Notes

### Test Data Required
- [ ] Valid student IDs (multiple)
- [ ] Student IDs with liabilities
- [ ] Valid admin accounts (different roles)
- [ ] Test documents and requirements
- [ ] Sample files for upload testing
- [ ] WhatsApp test numbers

### Environment Setup
- [ ] Database populated with test data
- [ ] Supabase buckets configured
- [ ] WhatsApp API keys configured
- [ ] Email service configured (if applicable)
- [ ] SSL certificates installed

### Test Execution Order
1. Authentication flows (User & Admin)
2. Core business logic (Request submission, tracking)
3. Admin management features
4. Integration testing
5. Performance and security testing
6. Cross-browser and mobile testing

---

**Total Test Cases**: 75+ comprehensive test scenarios  

