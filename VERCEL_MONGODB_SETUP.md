# 🔧 Fix MongoDB Connection on Vercel

## ❌ Current Issue

The error "Account not found or unable to process deposit. Please ensure MongoDB is connected." means:
- MongoDB environment variable (`MONGODB_URI`) is **NOT set** in Vercel, OR
- MongoDB connection string is **incorrect** in Vercel

## ✅ Solution: Set MONGODB_URI in Vercel

### Step 1: Go to Vercel Dashboard
1. Go to https://vercel.com
2. Sign in to your account
3. Find and click on your project: **webbank**

### Step 2: Navigate to Environment Variables
1. Click on **Settings** tab (left sidebar)
2. Click on **Environment Variables** (in Settings menu)

### Step 3: Add MONGODB_URI
1. Click **"Add New"** button
2. **Key:** Enter `MONGODB_URI`
3. **Value:** Enter your complete MongoDB connection string:
   ```
   mongodb+srv://webbankuser:Siddh%40299@webbank.4rxwnhv.mongodb.net/webbank?retryWrites=true&w=majority
   ```

### Step 4: Select Environments
**IMPORTANT:** Make sure to check ALL three environments:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### Step 5: Save
1. Click **"Save"** button
2. The variable will be added to all selected environments

### Step 6: Redeploy
**CRITICAL:** After adding the environment variable, you MUST redeploy:

**Option 1: Automatic Redeploy**
- Vercel will show a banner saying "Environment variable added"
- Click **"Redeploy"** button

**Option 2: Manual Redeploy**
1. Go to **Deployments** tab
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**

**Option 3: Trigger via Git**
- Just push any change to GitHub (it will auto-deploy)

## ✅ Verify It's Working

After redeploy, check:

1. **Go to Deployments → Latest Deployment → Functions → Logs**
2. Look for: `Connected to MongoDB successfully`
3. If you see: `MongoDB connection error` → Connection string is wrong
4. If you see: `MongoDB URI not configured` → Environment variable not set

## 🔍 Verify Environment Variable

To verify the variable is set:

1. Go to **Settings → Environment Variables**
2. You should see:
   - **MONGODB_URI** 
   - Value should start with: `mongodb+srv://...`
   - Should have checkmarks in: Production, Preview, Development

## ⚠️ Common Mistakes

❌ **Mistake 1:** Only added to Production
- ✅ **Fix:** Add to ALL environments (Production, Preview, Development)

❌ **Mistake 2:** Connection string is incomplete/cut off
- ✅ **Fix:** Make sure the FULL string is copied:
  ```
  mongodb+srv://webbankuser:Siddh%40299@webbank.4rxwnhv.mongodb.net/webbank?retryWrites=true&w=majority
  ```

❌ **Mistake 3:** Forgot to redeploy after adding variable
- ✅ **Fix:** MUST redeploy after adding environment variables

❌ **Mistake 4:** Typo in variable name
- ✅ **Fix:** Must be exactly: `MONGODB_URI` (all caps, with underscore)

## 📝 Your MongoDB Connection String

```
mongodb+srv://webbankuser:Siddh%40299@webbank.4rxwnhv.mongodb.net/webbank?retryWrites=true&w=majority
```

**Notes:**
- Username: `webbankuser`
- Password: `Siddh@299` (URL-encoded as `Siddh%40299`)
- Cluster: `webbank.4rxwnhv.mongodb.net`
- Database: `webbank`

## 🧪 Test After Setup

1. **Redeploy your application**
2. **Wait for deployment to complete** (2-3 minutes)
3. **Visit your Vercel URL**
4. **Login:** `george.tsang@senecapolytechnic.ca` / `pass123`
5. **Try Deposit:**
   - Select an account from dropdown
   - Enter amount (e.g., 100)
   - Click "Deposit"
   - Should work now! ✅

## 📊 Check MongoDB Atlas

Also verify in MongoDB Atlas:
1. Go to https://cloud.mongodb.com
2. **Network Access** → Make sure `0.0.0.0/0` is allowed
3. **Database Access** → User `webbankuser` exists and has read/write permissions

## 🆘 Still Not Working?

If you still see errors after setting the environment variable:

1. **Check Vercel Function Logs:**
   - Go to Deployments → Latest → Functions → Logs
   - Look for error messages

2. **Verify Connection String:**
   - Try connecting locally with the same string
   - Run: `node verifyMongoDB.js`

3. **Check MongoDB Atlas:**
   - Ensure cluster is running
   - Network access is configured
   - Database user has correct permissions

## ✅ Summary

**To fix the deposit/withdraw errors:**

1. ✅ Add `MONGODB_URI` environment variable in Vercel
2. ✅ Add to ALL environments (Production, Preview, Development)
3. ✅ Use the complete connection string
4. ✅ **Redeploy after adding the variable**
5. ✅ Verify in logs: "Connected to MongoDB successfully"

After this, deposit and withdraw should work! 🎉

