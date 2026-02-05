# Google OAuth Setup Guide

This guide will help you activate Google OAuth authentication for your Invoice SaaS application.

## Overview

Your application already has Google OAuth integration built-in. You just need to:
1. Create a Google Cloud Project
2. Configure OAuth consent screen
3. Create OAuth credentials
4. Add credentials to your `.env` file

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click on the project dropdown at the top
4. Click **"New Project"**
5. Enter a project name (e.g., "InvoicePro OAuth")
6. Click **"Create"**
7. Wait for the project to be created and select it

### 2. Enable Google+ API

1. In the Google Cloud Console, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on **"Google+ API"**
4. Click **"Enable"**

### 3. Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** user type (unless you have a Google Workspace)
3. Click **"Create"**

#### Fill in the required information:

**App Information:**
- **App name:** InvoicePro (or your app name)
- **User support email:** Your email address
- **App logo:** (Optional) Upload your app logo

**App Domain:**
- **Application home page:** `http://localhost:3000` (for development)
- **Application privacy policy link:** `http://localhost:3000/privacy` (create this page or use your domain)
- **Application terms of service link:** `http://localhost:3000/terms` (create this page or use your domain)

**Authorized domains:**
- For development: Leave empty or add `localhost`
- For production: Add your domain (e.g., `yourdomain.com`)

**Developer contact information:**
- Add your email address

4. Click **"Save and Continue"**

#### Scopes:
1. Click **"Add or Remove Scopes"**
2. Select these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
3. Click **"Update"**
4. Click **"Save and Continue"**

#### Test Users (for development):
1. Click **"Add Users"**
2. Add email addresses of users who can test the OAuth (including yourself)
3. Click **"Save and Continue"**

5. Review the summary and click **"Back to Dashboard"**

### 4. Create OAuth Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Select **"Web application"** as the application type

#### Configure the OAuth client:

**Name:** InvoicePro Web Client (or any name you prefer)

**Authorized JavaScript origins:**
- For development: `http://localhost:3000`
- For production: `https://invoicepro.com.ng`

**Authorized redirect URIs:**
- For development: `http://localhost:3000/api/auth/callback/google`
- For production: `https://invoicepro.com.ng/api/auth/callback/google`

**Note:** You can add both development and production URLs at the same time in the same OAuth client.

4. Click **"Create"**

### 5. Copy Your Credentials

After creating the OAuth client, you'll see a dialog with:
- **Client ID** (looks like: `123456789-abc123def456.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123def456`)

**Important:** Copy both values immediately!

### 6. Update Your .env File

Open your `.env` file and update the Google OAuth section:

```env
# Google OAuth (Optional)
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"
```

Replace `YOUR_CLIENT_ID_HERE` and `YOUR_CLIENT_SECRET_HERE` with the actual values you copied.

### 7. Restart Your Application

After updating the `.env` file:

1. Stop your development server (Ctrl+C)
2. Restart it with `npm run dev`
3. The Google OAuth button should now be fully functional

## Testing Google OAuth

1. Go to `http://localhost:3000/auth/signin`
2. Click the **"Continue with Google"** button
3. You should be redirected to Google's sign-in page
4. Sign in with a Google account (must be a test user if in development mode)
5. Grant permissions to your app
6. You'll be redirected back to your app and signed in

## Important Notes

### Development vs Production

**Development Mode:**
- OAuth consent screen shows "This app isn't verified" warning
- Only test users can sign in
- Use `http://localhost:3000` URLs

**Production Mode:**
- Submit your app for verification (optional but recommended)
- Any Google user can sign in
- Use `https://yourdomain.com` URLs
- Update redirect URIs in Google Cloud Console

### Security Best Practices

1. **Never commit credentials to Git:**
   - Your `.env` file should be in `.gitignore`
   - Use environment variables in production

2. **Use different credentials for development and production:**
   - Create separate OAuth clients for each environment

3. **Regularly rotate secrets:**
   - Periodically regenerate your client secret

### Common Issues

#### "redirect_uri_mismatch" Error
- **Cause:** The redirect URI doesn't match what's configured in Google Cloud Console
- **Solution:** Ensure the redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/callback/google`

#### "Access blocked: This app's request is invalid"
- **Cause:** OAuth consent screen not properly configured
- **Solution:** Complete all required fields in the OAuth consent screen

#### "Google sign in failed"
- **Cause:** Missing or incorrect credentials in `.env`
- **Solution:** Double-check your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

#### User can sign in but gets errors
- **Cause:** Database schema might not support OAuth users
- **Solution:** Ensure your Prisma schema has the necessary fields for OAuth (already configured in your project)

## How It Works

When a user clicks "Continue with Google":

1. They're redirected to Google's OAuth consent screen
2. After granting permission, Google redirects back to your app with an authorization code
3. NextAuth exchanges the code for user information
4. If the user doesn't exist, a new account is created
5. If the user exists, they're signed in
6. The user is redirected to the dashboard

## Production Deployment

When deploying to production:

1. **Update OAuth Client in Google Cloud Console:**
   - Add production domain to Authorized JavaScript origins
   - Add production callback URL to Authorized redirect URIs

2. **Update Environment Variables:**
   - Set `NEXTAUTH_URL` to your production URL
   - Keep the same `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (or create new ones for production)

3. **Optional: Verify Your App:**
   - Submit your app for Google verification to remove the "unverified app" warning
   - This process can take several weeks

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Check your server logs
3. Verify all URLs match exactly (including http/https)
4. Ensure test users are added in Google Cloud Console (for development)

## Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Google Cloud Console](https://console.cloud.google.com/)
