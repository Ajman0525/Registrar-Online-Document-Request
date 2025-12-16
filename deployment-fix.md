# Fix for Render Deployment - localhost:3000 Issue

## Problem
When deploying to Render, the application was still trying to connect to localhost:3000 even though FRONTEND_URL was provided in environment variables.

## Root Causes Identified and Fixed

### 1. Backend CORS Configuration (FIXED ✅)
**File:** `app/__init__.py`
- **Issue:** Hardcoded CORS origins: `["http://localhost:3000", "https://registrar-odr.onrender.com"]`
- **Fix:** Changed to use dynamic `FRONTEND_URL` environment variable
- **Change:** Added `FRONTEND_URL` import and updated CORS origins to `[FRONTEND_URL]`

### 2. Frontend API URL Configuration (FIXED ✅)
**File:** `frontend/src/pages/admin/AdminLogin.jsx`
- **Issue:** Hardcoded fallback to `http://localhost:8000`
- **Fix:** Changed to use `window.location.origin` as fallback
- **Change:** API URL now dynamically uses the same domain as the frontend

## Required Environment Variables for Render

### Backend Environment Variables (Flask)
Set these in your Render dashboard under Environment Variables:

```env
FLASK_ENV=production
FLASK_SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
DB_NAME=your-database-name
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
DB_HOST=your-db-host
DB_PORT=5432
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
FRONTEND_URL=https://your-frontend-domain.onrender.com
```

### Frontend Environment Variables (React)
For the frontend build process, you need to set these during the build:

```env
REACT_APP_API_URL=https://your-backend-domain.onrender.com
```

## Render Deployment Steps

### 1. Backend Service (Flask)
1. Create a new Web Service in Render
2. Connect your repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python run.py`
5. Add all the backend environment variables listed above
6. **Important:** Set `FRONTEND_URL` to your frontend service URL

### 2. Frontend Service (React)
1. Create another Web Service in Render
2. Connect the same repository
3. Set build command: `cd frontend && npm install && npm run build`
4. Set start command: `npx serve -s build -l 3000`
5. Add frontend environment variables during build:
   - `REACT_APP_API_URL=https://your-backend-service.onrender.com`
   - Or set it in the Render environment variables with build-time access

### 3. Alternative: Single Service Deployment
If you want to deploy both frontend and backend in one service:

1. Create one Web Service
2. Build command:
   ```bash
   # Install backend deps
   pip install -r requirements.txt
   
   # Install frontend deps and build
   cd frontend && npm install && npm run build
   cd ..
   ```
3. Start command: `python run.py`
4. This way both services run on the same domain and relative URLs will work perfectly

## Verification Steps

After deployment, verify these URLs work:
1. Frontend: `https://your-frontend-url.onrender.com`
2. Backend API: `https://your-backend-url.onrender.com/api/health` (create this endpoint if needed)
3. Admin login should redirect to Google OAuth properly
4. CORS should work without errors

## Additional Notes

- The `window.location.origin` fallback in AdminLogin.jsx ensures that in production, the API calls go to the same domain
- The backend now properly uses the `FRONTEND_URL` environment variable for CORS configuration
- All API calls in the frontend (except the AdminLogin redirect) use relative URLs, which is the correct approach for same-domain deployment

## Testing the Fix

1. Deploy with the updated code
2. Check browser console for CORS errors
3. Try the admin login flow
4. Verify that API calls go to the correct domain (not localhost)
