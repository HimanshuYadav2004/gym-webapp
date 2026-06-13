# 🚀 Deployment Guide

This guide will walk you through deploying your Gym Management System using Supabase, Render, and Vercel.

## 📋 Prerequisites

Before starting, create accounts on:
1. [Supabase](https://supabase.com) - Database & Storage (Free tier available)
2. [Render](https://render.com) - Backend hosting (Free tier available)
3. [Vercel](https://vercel.com) - Frontend hosting (Free tier available)

---

## 1️⃣ Supabase Setup (Database + Storage)

### Step 1: Create a New Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project Name**: `gym-management`
   - **Database Password**: (Save this securely!)
   - **Region**: Choose closest to your users
4. Wait for project to be provisioned (~2 minutes)

### Step 2: Get Database Connection String

1. In your project, go to **Settings** → **Database**
2. Scroll to **Connection String** section
3. Copy the **Connection Pooling** URI (Transaction mode)
4. It looks like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
5. Replace `[password]` with your actual database password

### Step 3: Create Storage Bucket

1. Go to **Storage** in left sidebar
2. Click **New bucket**
3. Name it: `gym-photos`
4. Make it **Public** (so photos are accessible)
5. Click **Create bucket**

### Step 4: Set Storage Policy

1. Click on `gym-photos` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Choose **"Allow public read access"**
5. Click **Review** and **Save**

### Step 5: Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **service_role key** (under "Project API keys")

---

## 2️⃣ Backend Deployment (Render)

### Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub and push
git remote add origin https://github.com/yourusername/gym-management.git
git branch -M main
git push -u origin main
```

### Step 2: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `gym-management-api`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run prisma:generate && npm run prisma:migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Add Environment Variables

In Render, add these environment variables:

```env
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NODE_ENV=production
USE_SUPABASE_STORAGE=true
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
PORT=5000
```

### Step 4: Deploy

1. Click **Create Web Service**
2. Wait for deployment (~5 minutes)
3. Your API will be available at: `https://gym-management-api.onrender.com`

---

## 3️⃣ Frontend Deployment (Vercel)

### Step 1: Update API URL

1. Create a `.env.production` file in the `frontend` folder:

```env
VITE_API_URL=https://gym-management-api.onrender.com
```

2. Update `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

3. Update API calls in `frontend/src/context/AuthContext.jsx`:

```javascript
import axios from 'axios';

// Set base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### Step 2: Deploy to Vercel

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Or use Vercel Dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - `VITE_API_URL`: `https://gym-management-api.onrender.com`
6. Click **Deploy**

Your app will be live at: `https://your-app.vercel.app`

---

## 4️⃣ Update CORS Settings

Update `backend/server.js` to allow your Vercel domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app', // Add your Vercel URL
  ],
  credentials: true
}));
```

Redeploy backend on Render (automatic if connected to GitHub).

---

## 5️⃣ Database Migration

Run migrations on Supabase:

```bash
cd backend

# Set DATABASE_URL to your Supabase connection string
export DATABASE_URL="your-supabase-connection-string"

# Run migrations
npm run prisma:migrate deploy

# Optional: Open Prisma Studio to view data
npm run prisma:studio
```

---

## ✅ Verification Checklist

- [ ] Supabase project created and configured
- [ ] Storage bucket `gym-photos` created and public
- [ ] Backend deployed on Render
- [ ] All environment variables set on Render
- [ ] Database migrations completed
- [ ] Frontend deployed on Vercel
- [ ] API URL configured in frontend
- [ ] CORS updated with Vercel domain
- [ ] Test login/signup works
- [ ] Test member creation with photo upload
- [ ] Test all features end-to-end

---

## 🔧 Troubleshooting

### Database Connection Issues
- Ensure you're using the **Pooler** connection string (port 6543)
- Check if database password is correct
- Verify network access in Supabase settings

### Photo Upload Not Working
- Verify `gym-photos` bucket is **public**
- Check storage policies allow public reads
- Ensure `SUPABASE_SERVICE_KEY` is the service_role key (not anon key)

### Backend 502 Error on Render
- Check logs in Render dashboard
- Ensure build command includes `prisma generate`
- Verify all environment variables are set

### Frontend Can't Connect to API
- Check `VITE_API_URL` is set correctly
- Verify CORS allows your Vercel domain
- Check browser console for errors

---

## 💰 Cost Estimate

**Free Tier Limits:**
- **Supabase**: 500MB database, 1GB storage, 2GB bandwidth/month
- **Render**: Sleeps after 15min inactivity, 750 hours/month
- **Vercel**: Unlimited sites, 100GB bandwidth/month

**Total Cost: $0/month** (within free tier limits)

For production with higher traffic:
- Supabase Pro: $25/month (8GB database, 100GB storage)
- Render Starter: $7/month (no sleep, 24/7 uptime)
- Vercel Pro: $20/month (1TB bandwidth)

---

## 🔐 Security Recommendations

1. **Change JWT_SECRET** to a strong random string (min 32 characters)
2. **Enable Row Level Security (RLS)** on Supabase tables
3. **Set up custom domain** with SSL for production
4. **Enable Supabase Auth** for additional security layer
5. **Add rate limiting** to API endpoints
6. **Regular backups** of database

---

## 📞 Support

If you encounter issues:
1. Check Render logs: Dashboard → Logs
2. Check Vercel logs: Dashboard → Deployments → View Logs
3. Check Supabase logs: Dashboard → Logs
4. Review browser console for frontend errors

---

## 🎉 Next Steps After Deployment

1. Test all features thoroughly
2. Add your custom domain
3. Set up monitoring (Render provides basic metrics)
4. Configure backup strategy
5. Add your branding/logo
6. Share with users!

---

**Your Gym Management System is now live! 🏋️‍♂️**
