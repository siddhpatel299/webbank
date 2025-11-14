# ✅ Vercel Deployment Validation Checklist

## Configuration Validation

### 1. Project Settings (From Images)
✅ **Repository:** `siddhpatel299/webbank` - Correct
✅ **Branch:** `main` - Correct
✅ **Framework Preset:** `Express` - Correct
✅ **Root Directory:** `./` - Correct
✅ **Build Command:** `None` - Correct (serverless functions don't need build)
✅ **Output Directory:** `N/A` - Correct (serverless functions)
✅ **Install Command:** `npm install` - Correct

### 2. Environment Variables
⚠️ **MONGODB_URI** - REQUIRED CHECK:
   - **Full value should be:**
   ```
   mongodb+srv://webbankuser:Siddh%40299@webbank.4rxwnhv.mongodb.net/webbank?retryWrites=true&w=majority
   ```
   
   **IMPORTANT:** In your Vercel dashboard, make sure the FULL connection string is entered (not cut off). The value shown in the image appears incomplete.

### 3. Code Validation

✅ **vercel.json** - Correctly configured:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

✅ **server.js** - Exports correctly:
```javascript
module.exports = app; // For Vercel serverless
```

✅ **Package.json** - All dependencies present:
- express ✓
- express-handlebars ✓
- mongodb ✓
- mongoose ✓
- client-sessions ✓
- dotenv ✓

✅ **All Required Files Present:**
- server.js ✓
- routes/banking.js ✓
- views/*.hbs (all 8 files) ✓
- dbConfig.js ✓
- package.json ✓

## ⚠️ CRITICAL: Environment Variable Check

**BEFORE DEPLOYING, verify in Vercel:**

1. Go to Environment Variables section
2. Click on `MONGODB_URI` to edit
3. Ensure the **complete** value is:
   ```
   mongodb+srv://webbankuser:Siddh%40299@webbank.4rxwnhv.mongodb.net/webbank?retryWrites=true&w=majority
   ```
4. Check all environments: Production, Preview, Development

## ✅ Pre-Deployment Checklist

- [ ] MONGODB_URI environment variable is complete and correct
- [ ] Root directory is `./`
- [ ] Framework preset is `Express`
- [ ] Build command is `None` or empty
- [ ] Output directory is `N/A` or empty
- [ ] Install command is `npm install` (or leave default)
- [ ] All code files are committed to GitHub
- [ ] vercel.json is in the repository

## 🚀 Ready to Deploy!

Once the environment variable is verified, click **"Deploy"** button.

## 🧪 Post-Deployment Testing

After deployment:
1. Visit your Vercel URL
2. Test login with: `george.tsang@senecapolytechnic.ca` / `pass123`
3. Check if MongoDB connection works (should see data from MongoDB, not JSON files)
4. Test all 4 banking functions:
   - Balance check
   - Deposit
   - Withdraw
   - Open Account

## 🐛 Common Issues

**Issue:** MongoDB connection fails
- **Solution:** Check MONGODB_URI is complete and URL-encoded properly

**Issue:** Routes not working
- **Solution:** Verify vercel.json routes configuration

**Issue:** Views not rendering
- **Solution:** Ensure all .hbs files are in the repository

**Issue:** Environment variables not loading
- **Solution:** Redeploy after adding environment variables

