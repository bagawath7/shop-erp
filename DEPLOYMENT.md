# Shop ERP Deployment Guide

This guide will help you deploy the Shop ERP application to Render for free hosting.

## Prerequisites

1. A GitHub account
2. A Render account (sign up at https://render.com - free tier available)
3. Git installed locally

## Deployment Steps

### Step 1: Push Your Code to GitHub

If you haven't already, initialize a git repository and push to GitHub:

```bash
# Initialize git (if not already done)
cd /Users/bagawath-16695/Documents/Projects/shop-erp
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Shop ERP ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/shop-erp.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

1. **Sign up/Login to Render**
   - Go to https://render.com
   - Sign up or login (you can use your GitHub account)

2. **Create New Blueprint**
   - Click "New +" button in the dashboard
   - Select "Blueprint"
   - Connect your GitHub account if you haven't
   - Select the `shop-erp` repository
   - Render will automatically detect the `render.yaml` file

3. **Review and Deploy**
   - Review the services that will be created:
     - PostgreSQL Database (shop-erp-db)
     - Backend API (shop-erp-api)
     - Frontend (shop-erp-frontend)
   - Click "Apply" to start deployment

4. **Wait for Deployment**
   - Database: ~2-3 minutes
   - Backend API: ~3-5 minutes
   - Frontend: ~5-7 minutes
   - First deployment may take longer

### Step 3: Initialize Database

After deployment completes:

1. Go to your Render Dashboard
2. Click on "shop-erp-db" (PostgreSQL service)
3. Click "Connect" and copy the "External Database URL"
4. Use a PostgreSQL client (like pgAdmin, DBeaver, or psql CLI) to connect:
   ```bash
   psql "YOUR_DATABASE_URL_HERE"
   ```
5. Run the initialization script:
   ```bash
   \i database/init.sql
   ```

   Or copy-paste the contents of `database/init.sql` into your SQL client

### Step 4: Update Backend Environment Variable

1. Go to "shop-erp-api" service in Render Dashboard
2. Click "Environment"
3. Add a new environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: Your frontend URL (e.g., `https://shop-erp-frontend.onrender.com`)
4. Save and wait for the service to redeploy

### Step 5: Access Your Application

Your services will be available at:
- **Frontend**: `https://shop-erp-frontend.onrender.com`
- **Backend API**: `https://shop-erp-api.onrender.com`
- **Database**: Connection string available in Render Dashboard

Share the frontend URL with your friend!

## Important Notes

### Free Tier Limitations

1. **Backend Cold Starts**:
   - Free web services spin down after 15 minutes of inactivity
   - First request after inactivity takes 30-60 seconds to wake up
   - Subsequent requests are fast

2. **Database**:
   - Free PostgreSQL expires after 90 days
   - 1GB storage limit
   - Backed up daily

3. **Build Minutes**:
   - 500 build minutes/month on free tier
   - Typically sufficient for demo/testing

### Keeping Services Active

For important demos, you can:
1. Visit the URL 5-10 minutes before sharing
2. Use a service like UptimeRobot or cron-job.org to ping your backend every 10 minutes
3. Upgrade to paid tier ($7/month) for always-on service

### Troubleshooting

**Backend not connecting to database:**
- Check that database environment variables are set correctly
- Verify database is running in Render Dashboard

**Frontend showing connection errors:**
- Check that `REACT_APP_API_URL` is set correctly in frontend service
- Verify backend API health: `https://YOUR-API-URL.onrender.com/api/health`

**CORS errors:**
- Ensure `FRONTEND_URL` environment variable is set in backend
- Check browser console for specific error messages

**Build failures:**
- Check build logs in Render Dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### Logs and Monitoring

- Click on any service in Render Dashboard
- Go to "Logs" tab to see real-time logs
- Use logs to debug any issues

## Manual Deployment Alternative

If you prefer not to use render.yaml (Blueprint), you can deploy manually:

1. **Create PostgreSQL Database**
   - New + → PostgreSQL
   - Name: shop-erp-db
   - Plan: Free

2. **Create Backend Web Service**
   - New + → Web Service
   - Connect repository
   - Name: shop-erp-api
   - Root Directory: `backend`
   - Environment: Docker
   - Plan: Free
   - Add environment variables manually

3. **Create Frontend Static Site**
   - New + → Static Site
   - Connect repository
   - Name: shop-erp-frontend
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`
   - Add environment variable: `REACT_APP_API_URL`

## Updating Your Deployment

After making code changes:

```bash
git add .
git commit -m "Your commit message"
git push
```

Render will automatically detect the push and redeploy your services.

## Alternative Free Hosting Options

If you want to explore other options:

1. **Railway** (https://railway.app)
   - Similar to Render
   - $5 free credit monthly
   - Good for demos

2. **Fly.io** (https://fly.io)
   - More technical setup
   - Generous free tier
   - Better cold start times

3. **Vercel + Supabase**
   - Vercel for frontend (free)
   - Supabase for database + backend (free tier)
   - Requires backend refactoring to serverless functions

## Support

If you encounter issues:
1. Check Render status page: https://status.render.com
2. Review Render documentation: https://render.com/docs
3. Check service logs in Render Dashboard
4. Verify all environment variables are set correctly

## Cost Optimization

To stay on free tier:
- Use services only when needed
- Monitor build minutes usage
- Consider upgrading only backend ($7/month) if cold starts are problematic
- Frontend static hosting is always fast on free tier

---

**Estimated Total Time**: 15-20 minutes for complete deployment

**Best for**: Demos, testing, sharing with friends, portfolio projects
