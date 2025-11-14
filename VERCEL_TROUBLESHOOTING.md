# 🔧 Vercel Internal Server Error - Troubleshooting Guide

## ✅ What I Just Fixed

1. ✅ **Pushed updated server.js** with:
   - dotenv support
   - Proper Vercel exports
   - Fixed Handlebars views paths for serverless

2. ✅ **Committed to GitHub:**
   - server.js (latest version)
   - package.json (with dotenv)
   - setupMongoDB.js

## 🔍 Steps to Fix Internal Server Error

### Step 1: Verify Environment Variable in Vercel

**CRITICAL:** Check if `MONGODB_URI` is set correctly in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check `MONGODB_URI` exists
3. **Full value should be:**
   ```
   mongodb+srv://webbankuser:Siddh%40299@webbank.4rxwnhv.mongodb.net/webbank?retryWrites=true&w=majority
   ```
4. Make sure it's added to **all environments**: Production, Preview, Development

### Step 2: Redeploy on Vercel

After pushing the fix:

1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click "..." (three dots) on the latest deployment
5. Click "Redeploy"
6. Or Vercel should auto-deploy when it detects the GitHub push

### Step 3: Check Vercel Function Logs

To see the actual error:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click on "Functions" tab
4. Click on the function that's failing
5. Check the "Logs" tab to see the actual error message

Common errors you might see:
- `MONGODB_URI is not defined` → Environment variable not set
- `Cannot find module` → Missing dependency
- `Views directory not found` → Path issue (should be fixed now)
- `MongoDB connection failed` → Connection string issue

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Fails
**Error:** `MongoDB connection error` or `querySrv ENOTFOUND`

**Solutions:**
- Verify `MONGODB_URI` is complete in Vercel
- Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- Verify database user credentials are correct
- URL encode special characters in password (`@` → `%40`)

### Issue 2: Views Not Found
**Error:** `Cannot find module './views'` or similar

**Solution:** ✅ **Fixed!** Views path is now explicitly set

### Issue 3: Module Not Found
**Error:** `Cannot find module 'express-handlebars'` or similar

**Solution:**
- All dependencies should be in `package.json`
- Vercel runs `npm install` automatically
- Check `package.json` has all required modules

### Issue 4: Environment Variable Not Loading
**Error:** `MONGODB_URI is undefined`

**Solutions:**
1. Verify `.env` is NOT committed (it's in .gitignore - correct!)
2. Add `MONGODB_URI` in Vercel Dashboard → Environment Variables
3. Redeploy after adding environment variable
4. Make sure it's added to all environments

## 📋 Pre-Deployment Checklist

Before redeploying, verify:

- [ ] `MONGODB_URI` is set in Vercel Environment Variables (all environments)
- [ ] Connection string is **complete** (not cut off)
- [ ] Password is URL-encoded (`@` → `%40`)
- [ ] Database name is included (`/webbank`)
- [ ] All code changes are pushed to GitHub
- [ ] Vercel is connected to the correct GitHub branch (`main`)

## 🚀 Manual Redeploy Steps

If auto-deploy doesn't work:

1. **Via Dashboard:**
   - Vercel Dashboard → Project → Deployments
   - Click "Redeploy" on latest deployment

2. **Via CLI:**
   ```bash
   vercel --prod
   ```

3. **Trigger via Git:**
   ```bash
   git commit --allow-empty -m "Trigger Vercel redeploy"
   git push origin main
   ```

## 🔍 Debugging Steps

1. **Check Deployment Logs:**
   - Vercel Dashboard → Deployment → Build Logs
   - Look for errors during build/install

2. **Check Function Logs:**
   - Vercel Dashboard → Deployment → Functions → Logs
   - See runtime errors

3. **Test Locally First:**
   ```bash
   npm install
   npm start
   ```
   Visit `http://localhost:3000` to verify it works locally

4. **Check MongoDB Atlas:**
   - Verify database user exists
   - Check Network Access allows all IPs
   - Verify cluster is running

## 📝 Next Steps

After the fix is deployed:

1. Wait for deployment to complete (2-3 minutes)
2. Visit your Vercel URL
3. Try logging in with: `george.tsang@senecapolytechnic.ca` / `pass123`
4. If still error, check Function Logs for specific error message

## ⚠️ Important Notes

- **.env file is NOT in GitHub** (correct - it's in .gitignore)
- **Environment variables MUST be set in Vercel Dashboard**
- **Redeploy is required** after adding environment variables
- **Password must be URL-encoded** in connection string

