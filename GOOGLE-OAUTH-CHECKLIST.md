# Google OAuth Quick Setup Checklist

## ✅ Quick Steps to Activate Google OAuth

### 1. Google Cloud Console Setup (5-10 minutes)

- [ ] Go to https://console.cloud.google.com/
- [ ] Create a new project or select existing one
- [ ] Enable Google+ API or Google Identity API
- [ ] Configure OAuth consent screen:
  - [ ] Choose "External" user type
  - [ ] Fill in app name: "InvoicePro"
  - [ ] Add your email as support email
  - [ ] Add developer contact email
  - [ ] Add scopes: `userinfo.email`, `userinfo.profile`, `openid`
  - [ ] Add test users (your email)
- [ ] Create OAuth credentials:
  - [ ] Type: Web application
  - [ ] Authorized JavaScript origins: 
    - `http://localhost:3000` (development)
    - `https://invoicepro.com.ng` (production)
  - [ ] Authorized redirect URIs: 
    - `http://localhost:3000/api/auth/callback/google` (development)
    - `https://invoicepro.com.ng/api/auth/callback/google` (production)
- [ ] Copy Client ID and Client Secret

### 2. Update .env File

```env
GOOGLE_CLIENT_ID="paste-your-client-id-here"
GOOGLE_CLIENT_SECRET="paste-your-client-secret-here"
```

### 3. Restart Application

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### 4. Test

- [ ] Go to http://localhost:3000/auth/signin
- [ ] Click "Continue with Google"
- [ ] Sign in with Google account
- [ ] Verify successful login

## 🎯 What You Get

Once activated, users can:
- Sign in with their Google account (one-click)
- Sign up with Google (automatic account creation)
- No need to remember another password
- Faster onboarding experience

## 🔗 Important URLs

**Google Cloud Console:** https://console.cloud.google.com/

**OAuth Consent Screen:** 
https://console.cloud.google.com/apis/credentials/consent

**Credentials Page:** 
https://console.cloud.google.com/apis/credentials

## 📝 Redirect URI Format

**Development:**
```
http://localhost:3000/api/auth/callback/google
```

**Production:**
```
https://invoicepro.com.ng/api/auth/callback/google
```

**💡 Tip:** Add both URLs to the same OAuth client in Google Cloud Console so it works in both environments.

## ⚠️ Common Mistakes to Avoid

1. ❌ Forgetting to add test users in development mode
2. ❌ Incorrect redirect URI (must match exactly)
3. ❌ Not restarting the server after updating .env
4. ❌ **Using http instead of https in production** (CRITICAL!)
5. ❌ Committing .env file to Git (keep it private!)
6. ❌ Adding trailing slashes to URLs
7. ❌ Not waiting 1-2 minutes after saving changes in Google Cloud Console

## 🚨 Production MUST Use HTTPS

**Wrong:** `http://invoicepro.com.ng` ❌  
**Correct:** `https://invoicepro.com.ng` ✅

If you get `redirect_uri_mismatch` error, see `GOOGLE-OAUTH-REDIRECT-FIX.md`

## 🚀 Production Checklist (For Later)

When deploying to production:

- [ ] Create production OAuth client (or update existing)
- [ ] Add production domain to authorized origins
- [ ] Add production callback URL to redirect URIs
- [ ] Update NEXTAUTH_URL in production .env
- [ ] Consider submitting app for Google verification
- [ ] Test with real users

## 💡 Pro Tips

- Use different OAuth clients for dev and production
- Keep your client secret secure (never expose in frontend)
- Add multiple test users during development
- The "unverified app" warning is normal in development

## 📚 Full Documentation

See `GOOGLE-OAUTH-SETUP.md` for detailed instructions and troubleshooting.
