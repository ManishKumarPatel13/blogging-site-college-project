# Google OAuth Setup Guide

## Production Configuration

### ✅ Current Status
- **Service URL**: `https://blogging-site-college-project.onrender.com`
- **OAuth Callback URL**: `https://blogging-site-college-project.onrender.com/api/auth/google/callback`
- **Client ID**: `848776104400-ltl480cfua7hj4tqnicopvs03c2pfd5p.apps.googleusercontent.com`
- **Deployment Status**: 🔄 Redeploying with correct BACKEND_URL

---

## � Quick Start (Do This Now!)

### Step 1: Update Google Cloud Console (REQUIRED)

1. **Open Google Cloud Console**:
   
   👉 [Click here to open Credentials page](https://console.cloud.google.com/apis/credentials)

2. **Find your OAuth 2.0 Client ID**:
   - Look for: `848776104400-ltl480cfua7hj4tqnicopvs03c2pfd5p`
   - Click on it to edit

3. **Add Production Redirect URI**:
   
   Scroll down to **"Authorized redirect URIs"** and click **"+ ADD URI"**
   
   **Copy and paste this EXACT URL**:
   ```
   https://blogging-site-college-project.onrender.com/api/auth/google/callback
   ```
   
   **Also keep your development URL** (if not already there):
   ```
   http://localhost:5000/api/auth/google/callback
   ```
   
   Your list should look like:
   - ✅ `http://localhost:5000/api/auth/google/callback` (development)
   - ✅ `https://blogging-site-college-project.onrender.com/api/auth/google/callback` (production)

4. **Add Authorized JavaScript Origins** (Optional but recommended):
   ```
   https://blogging-site-college-project.onrender.com
   http://localhost:5000
   ```

5. **Click "SAVE"** at the bottom

---

## 🧪 Testing OAuth

### Test in Browser

1. **Navigate to the OAuth login endpoint**:
   ```
   https://blogging-site-college-project.onrender.com/api/auth/google
   ```

2. **Expected Flow**:
   - Redirects to Google login page
   - After login, redirects back to your callback URL
   - Returns JWT token or redirects to frontend

### Test with cURL

```bash
# Test OAuth endpoint is accessible
curl -I https://blogging-site-college-project.onrender.com/api/auth/google

# Should return 302 redirect to Google
```

---

## 🔧 Environment Variables (Already Configured)

These are already set on Render:

```env
BACKEND_URL=https://blogging-site-college-project.onrender.com
GOOGLE_CLIENT_ID=848776104400-ltl480cfua7hj4tqnicopvs03c2pfd5p.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-Tm6i9DiY-3mhs31JOhEqnDm0wqZ
FRONTEND_URL=http://localhost:3000
```

---

## ⚠️ Important Notes

### OAuth Callback URL Format

Your `config/passport.js` uses:
```javascript
callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
```

This resolves to:
- **Development**: `http://localhost:5000/api/auth/google/callback`
- **Production**: `https://blogging-site-college-project.onrender.com/api/auth/google/callback`

Both must be added to Google Cloud Console!

### HTTPS Required

Google OAuth requires HTTPS for production. Render automatically provides SSL certificates, so you're good to go! ✅

---

## 🚨 Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause**: The callback URL in Google Cloud Console doesn't match your service URL.

**Solution**:
1. Check the error message for the exact redirect URI being used
2. Add that exact URI to Google Cloud Console
3. Make sure there are no trailing slashes
4. Wait 5-10 minutes for Google to propagate changes

### Error: "Access Blocked: This app's request is invalid"

**Cause**: OAuth consent screen not configured or app in testing mode.

**Solution**:
1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
2. Add test users OR publish the app
3. Fill in all required fields

### Users Can't Login

**Check**:
1. Is the app in "Testing" mode? Add users as test users
2. Is the callback URL correct in both places?
3. Check Render logs for errors: https://dashboard.render.com/web/srv-d4dukqn5r7bs73fdbd40

---

## 📱 Integration with Frontend

When you deploy your frontend, update the `FRONTEND_URL` environment variable:

```bash
# On Render Dashboard
FRONTEND_URL=https://your-frontend-url.com
```

The OAuth callback in your code will redirect to:
```javascript
res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
```

---

## 🔗 Quick Links

- **Service Dashboard**: https://dashboard.render.com/web/srv-d4dukqn5r7bs73fdbd40
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent
- **API Base URL**: https://blogging-site-college-project.onrender.com

---

## ✨ Next Steps

1. ✅ Update Google Cloud Console redirect URIs
2. ✅ Test OAuth flow in browser
3. ⏳ Deploy frontend and update `FRONTEND_URL`
4. ⏳ Test full authentication flow
5. ⏳ (Optional) Publish OAuth app or add test users

---

**Last Updated**: November 18, 2025
**Status**: Ready for testing
