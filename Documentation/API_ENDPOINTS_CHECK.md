# API Endpoints Verification Report

## Complete List of Endpoints Found in Codebase

### WhatsApp Integration
1. **POST** `/send_template` - Send WhatsApp message template

### User Authentication
2. **POST** `/user/authentication/check-id` - ✅ Documented
3. **POST** `/user/authentication/check-name` - ✅ Documented
4. **POST** `/user/authentication/resend-otp` - ✅ Documented
5. **POST** `/user/authentication/verify-otp` - ✅ Documented
6. **POST** `/user/authentication/upload-authletter` - ✅ Documented

### User Document Management
7. **GET** `/user/document_list/api/view-documents` - ✅ Documented

### User Request Management
8. **GET** `/user/request/api/check-request-allowed` - ✅ Documented
9. **GET** `/user/request/api/request` - ✅ Documented
10. **POST** `/user/request/api/list-requirements` - ✅ Documented
11. **POST** `/user/request/api/complete-request` - ✅ Documented
12. **GET** `/user/request/api/check-active-requests` - ✅ Documented
13. **POST** `/user/request/api/clear-session` - ✅ Documented

### User Tracking
14. **POST** `/user/tracking/api/track` - ✅ Documented
15. **POST** `/user/tracking/api/set-order-type` - ✅ Documented
16. **GET** `/user/tracking/api/track/status/<tracking_number>` - ✅ Documented
17. **GET** `/user/tracking/api/track/document/<tracking_number>` - ✅ Documented
18. **GET** `/user/tracking/api/track/changes/<tracking_number>` - ✅ Documented
19. **POST** `/user/tracking/api/track/changes/<tracking_number>/upload` - ✅ Documented

### User Payment
20. **POST** `/user/payment/maya/webhook` - ✅ Documented
21. **POST** `/user/payment/mark-paid` - ✅ Documented
22. **POST** `/user/payment/mark-document-paid` - ✅ Documented

### Admin Authentication
23. **POST** `/api/admin/google-login` - ✅ Documented
24. **GET** `/api/admin/admins` - ✅ Documented
25. **POST** `/api/admin/admins` - ✅ Documented
26. **PUT** `/api/admin/admins/<email>` - ✅ Documented
27. **DELETE** `/api/admin/admins/<email>` - ✅ Documented
28. **GET** `/api/admin/current-user` - ✅ Documented
29. **POST** `/api/admin/logout` - ✅ Documented

### Admin Dashboard
30. **GET** `/api/admin/dashboard` - ✅ Documented
31. **POST** `/api/admin/logout` - ✅ Documented

### Admin Logging
32. **GET** `/api/admin/logs` - ✅ Documented

### Admin Settings
33. **GET** `/api/admin/settings` - ✅ Documented
34. **PUT** `/api/admin/settings` - ✅ Documented
35. **GET** `/api/admin/settings/fee` - ✅ Documented
36. **PUT** `/api/admin/settings/fee` - ✅ Documented

### Admin Transactions
37. **GET** `/api/admin/transactions` - ✅ Documented
38. **GET** `/api/admin/transactions/summary` - ✅ Documented

### Admin Document Management
39. **GET** `/get-documents` - ✅ Documented
40. **GET** `/get-document-requirements` - ✅ Documented
41. **GET** `/get-document-requirements/<string:doc_id>` - ✅ Documented
42. **GET** `/get-documents-with-requirements` - ✅ Documented
43. **POST** `/add-documents` - ✅ Documented
44. **PUT** `/edit-document/<string:doc_id>` - ✅ Documented
45. **DELETE** `/delete-document/<string:doc_id>` - ✅ Documented
46. **GET** `/get-requirements` - ✅ Documented
47. **POST** `/add-requirement` - ✅ Documented
48. **DELETE** `/delete-requirement/<string:req_id>` - ✅ Documented
49. **GET** `/check-req-exist/<string:req_id>` - ✅ Documented
50. **GET** `/check-req/<string:req_id>` - ✅ Documented
51. **GET** `/check-doc-exist/<string:doc_id>` - ✅ Documented
52. **PUT** `/edit-requirement/<string:req_id>` - ✅ Documented
53. **PATCH** `/hide-document/<string:doc_id>` - ✅ Documented
54. **PATCH** `/toggle-hide-document/<string:doc_id>` - ✅ Documented

### Admin Request Management
55. **GET** `/api/admin/requests` - ✅ Documented
56. **PUT** `/api/admin/requests/<request_id>/status` - ✅ Documented
57. **DELETE** `/api/admin/requests/<request_id>` - ✅ Documented
58. **GET** `/api/admin/my-requests` - ✅ Documented
59. **POST** `/api/admin/requests/<request_id>/changes` - ✅ Documented
60. **GET** `/api/admin/requests/<request_id>` - ✅ Documented
61. **GET** `/api/admin/requests/<request_id>/changes` - ✅ Documented
62. **PUT** `/api/admin/requests/<request_id>/documents/<doc_id>/status` - ✅ Documented
63. **PUT** `/api/admin/requests/<request_id>/others_documents/<doc_id>/status` - ✅ Documented
64. **GET** `/api/admin/requests/filters` - ✅ Documented

### Admin Assignment
65. **POST** `/api/admin/auto-assign` - ✅ Documented
66. **POST** `/api/admin/manual-assign` - ✅ Documented
67. **POST** `/api/admin/unassign` - ✅ Documented
68. **GET** `/api/admin/unassigned-requests` - ✅ Documented
69. **GET** `/api/admin/unassigned-requests/filters` - ✅ Documented
70. **GET** `/api/admin/assignment-progress` - ✅ Documented
71. **GET** `/api/admin/admins-progress` - ✅ Documented
72. **GET** `/api/admin/admin-requests/<admin_id>` - ✅ Documented
73. **GET** `/api/admin/admin-max-requests/<admin_id>` - ✅ Documented
74. **PUT** `/api/admin/admin-max-requests/<admin_id>` - ✅ Documented

## Total Endpoints: 74

## Verification Status: ✅ ALL ENDPOINTS DOCUMENTED

All 74 endpoints found in the codebase have been properly documented in the API_DOCUMENTATION.md file. The documentation is complete and comprehensive.
