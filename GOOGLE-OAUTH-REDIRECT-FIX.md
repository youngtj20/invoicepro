# Google OAuth Redirect URI Mismatch - Quick Fix

## Error You're Seeing

```
Error 400: redirect_uri_mismatch
Request details: redirect_uri=http://invoicepro.com.ng/api/auth/callback/google
```

## Root Cause

The redirect URI being used (`http://invoicepro.com.ng`) doesn't match what's registered in Google Cloud Console. Production should use HTTPS, not HTTP.

## Quick Fix (5 minutes)

### Step 1: Update Google Cloud Console

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under **"Authorized redirect URIs"**, add these EXACT URLs:

```
http://localhost:3000/api/auth/callback/google
https://invoicepro.com.ng/api/auth/callback/google
```

**Critical:** Use `https://` (with 's') for invoicepro.com.ng

4. Click **"Save"**
5. Wait 1-2 minutes for changes to propagate

### Step 2: Update Authorized JavaScript Origins

While you're there, also add these under **"Authorized JavaScript origins"**:

```
http://localhost:3000
https://invoicepro.com.ng
```

### Step 3: Verify Production Environment Variables

On your production server, ensure your `.env` file has:

```env
NEXTAUTH_URL="https://invoicepro.com.ng"
APP_URL="https://invoicepro.com.ng"
```

**Important:** Both should use `https://` not `http://`

### Step 4: Restart Your Production Server

After updating environment variables:

```bash
# Restart your production server
# The exact command depends on your hosting setup
```

### Step 5: Test Again

1. Go to `https://invoicepro.com.ng/auth/signin`
2. Click "Continue with Google"
3. Should now work without redirect_uri_mismatch error

## Common Mistakes

❌ **Wrong:** `http://invoicepro.com.ng` (missing 's' in https)  
✅ **Correct:** `https://invoicepro.com.ng`

❌ **Wrong:** Trailing slash: `https://invoicepro.com.ng/`  
✅ **Correct:** No trailing slash: `https://invoicepro.com.ng`

❌ **Wrong:** Missing `/api/auth/callback/google` in redirect URI  
✅ **Correct:** Full path: `https://invoicepro.com.ng/api/auth/callback/google`

## Verification Checklist

- [ ] Added `https://invoicepro.com.ng/api/auth/callback/google` to Google Cloud Console
- [ ] Added `https://invoicepro.com.ng` to Authorized JavaScript origins
- [ ] Clicked "Save" in Google Cloud Console
- [ ] Waited 1-2 minutes for changes to propagate
- [ ] Production `.env` has `NEXTAUTH_URL="https://invoicepro.com.ng"`
- [ ] Production `.env` has `APP_URL="https://invoicepro.com.ng"`
- [ ] Restarted production server
- [ ] Tested Google sign-in on production site

## Still Having Issues?

### Check SSL Certificate

Ensure your domain has a valid SSL certificate:
```bash
# Test SSL
curl -I https://invoicepro.com.ng
```

Should return `200 OK` without SSL errors.

### Check Exact URL Being Used

Look at the browser's address bar when the error occurs. The exact redirect_uri in the error message tells you what URL your app is using.

### Force HTTPS Redirect

If your server is accessible via both HTTP and HTTPS, ensure it redirects HTTP to HTTPS. Add this to your server configuration or use middleware.

### Clear Browser Cache

Sometimes browsers cache OAuth redirects:
1. Clear browser cache and cookies
2. Try in incognito/private mode
3. Try a different browser

## For Development (localhost)

Development should use HTTP (without 's'):
```
NEXTAUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
```

And the redirect URI:
```
http://localhost:3000/api/auth/callback/google
```

## Summary

**The key issue:** Your production site must use HTTPS, and the redirect URI in Google Cloud Console must exactly match `https://invoicepro.com.ng/api/auth/callback/google` (with the 's' in https).
