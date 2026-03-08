# Vercel Deployment Guide

## Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- Environment variables configured

## Deployment Steps

### 1. Connect GitHub Repository to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select "GitHub" and authorize
4. Select the Intellicook repository
5. Click "Import"

### 2. Configure Environment Variables
In the Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables by clicking "Add New":
   - **Key**: `GEMINI_API_KEY`
     **Value**: Your Google Gemini API key (from https://makersuite.google.com/app/apikey)
     **Environments**: Production, Preview, Development
   
   - **Key**: `JWT_SECRET`
     **Value**: Your JWT secret string (any secure random string)
     **Environments**: Production, Preview, Development
   
   - **Key**: `PORT`
     **Value**: `3000`
     **Environments**: Production, Preview, Development

3. Click "Save" for each variable

### 3. Configure Build Settings
- **Framework Preset**: Other
- **Build Command**: `cd backend && npm install`
- **Output Directory**: Leave empty
- **Install Command**: (default)

### 4. Deploy
After configuration, Vercel will automatically:
1. Build your project
2. Deploy to a preview URL
3. Promote to production after approval

### 5. Post-Deployment
- Your app will be available at `https://your-app.vercel.app`
- Frontend will be served from the root path
- API endpoints will route through `/api`

## Important Notes
- ✅ The `.gitignore` file protects `.env` from being committed
- ✅ Use `.env.example` as reference for required variables
- ✅ Never commit actual `.env` files to GitHub
- ✅ Vercel environment variables override `.env` files in production

## Troubleshooting
- **Build fails**: Check that Node.js version matches (v18+)
- **API not working**: Verify environment variables in Vercel dashboard
- **CORS issues**: Check backend CORS configuration in `backend/index.js`
- **Database issues**: SQLite works locally but may need cloud database for production (consider MongoDB/PostgreSQL)

## Recommended Improvements for Production
1. Replace SQLite with a cloud database (MongoDB, PostgreSQL)
2. Add rate limiting to API endpoints
3. Implement proper error handling and logging
4. Add API authentication/authorization
5. Use HTTPS only
