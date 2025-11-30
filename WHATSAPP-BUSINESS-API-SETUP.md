# WhatsApp Business Cloud API Setup Guide

**Date:** 2025-11-29
**Feature:** Send Invoice PDFs Directly via WhatsApp

---

## 🎯 Overview

This guide explains how to set up WhatsApp Business Cloud API to send invoice PDFs **directly** to customers via WhatsApp - no manual attachment needed!

**What This Enables:**
- ✅ Send PDF files directly via WhatsApp
- ✅ Automatic delivery to customer's WhatsApp
- ✅ Professional branded messages
- ✅ No manual PDF attachment required
- ✅ Track delivery status

**Two Modes:**
1. **WhatsApp Business API Mode** (Automated) - Sends PDF automatically
2. **Manual Mode** (Fallback) - Downloads PDF for manual attachment

---

## 📋 Prerequisites

Before you start, you need:
- A Facebook Business Account
- A WhatsApp Business Account
- A verified phone number (can't be used with regular WhatsApp)
- A Meta Developer Account

---

## 🚀 Step-by-Step Setup

### Step 1: Create Meta Developer Account

1. Go to [https://developers.facebook.com](https://developers.facebook.com)
2. Click "Get Started" in top-right
3. Log in with your Facebook account
4. Complete the registration process

### Step 2: Create a New App

1. Go to [https://developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Click "Create App"
3. Select "Business" as app type
4. Fill in app details:
   - **App Name:** Your Invoice SaaS App
   - **App Contact Email:** your-email@example.com
   - **Business Account:** Select or create one
5. Click "Create App"

### Step 3: Add WhatsApp Product

1. In your app dashboard, find "Add Products to Your App"
2. Locate "WhatsApp" and click "Set Up"
3. You'll be taken to WhatsApp setup page

### Step 4: Get a Phone Number

You have two options:

**Option A: Use Test Number (for development)**
1. Meta provides a test phone number
2. You can send messages to up to 5 test numbers
3. Good for development and testing

**Option B: Add Your Own Number (for production)**
1. Click "Add Phone Number"
2. Verify you own the number via SMS/Call
3. This number can't be used with regular WhatsApp
4. Use a dedicated business line

### Step 5: Get Your Credentials

After setting up WhatsApp product, you'll see:

1. **Phone Number ID:**
   - Go to "WhatsApp" → "Getting Started"
   - Copy the "Phone Number ID" (e.g., `109876543210987`)

2. **WhatsApp Business Account ID:**
   - Found in the same section (e.g., `102938475609283`)

3. **Access Token (Temporary):**
   - Click "Generate Access Token"
   - Copy the temporary token
   - **Note:** This expires in 24 hours!

### Step 6: Create Permanent Access Token

For production, you need a permanent token:

1. Go to "WhatsApp" → "Configuration"
2. Under "System Users", click "Create System User"
3. Name it (e.g., "Invoice SaaS Bot")
4. Assign role: "Admin"
5. Click "Generate New Token"
6. Select your app
7. Select permissions:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
8. Copy and save the token securely
9. **Important:** This token doesn't expire but keep it secure!

### Step 7: Configure Environment Variables

Add to your `.env` file:

```env
# WhatsApp Business Cloud API (Meta/Facebook)
WHATSAPP_API_ENABLED="true"
WHATSAPP_BUSINESS_ACCOUNT_ID="102938475609283"
WHATSAPP_PHONE_NUMBER_ID="109876543210987"
WHATSAPP_ACCESS_TOKEN="EAAGpZ...your-permanent-token...ZD"
WHATSAPP_API_VERSION="v18.0"
```

**Security Note:** Never commit your access token to Git!

### Step 8: Verify Setup

Run this test to verify configuration:

```bash
# Test WhatsApp API connectivity
curl -X POST \
  "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "2348012345678",
    "type": "text",
    "text": {
      "body": "Test message from Invoice SaaS"
    }
  }'
```

If successful, you should receive a test message on WhatsApp!

---

## 💡 How It Works

### Automated Flow (API Mode):

```
User clicks "Send via WhatsApp"
    ↓
Enter customer's WhatsApp number
    ↓
Click "Send"
    ↓
System generates invoice PDF
    ↓
PDF uploaded to WhatsApp servers (gets media ID)
    ↓
WhatsApp message sent with PDF attached
    ↓
Customer receives PDF on WhatsApp instantly
    ↓
Success notification shown
```

### Manual Flow (Fallback):

If API is not configured:

```
User clicks "Send via WhatsApp"
    ↓
Enter customer's WhatsApp number
    ↓
Click "Send"
    ↓
PDF downloads to device
    ↓
WhatsApp opens with pre-filled message
    ↓
User manually attaches PDF
    ↓
User sends message
```

---

## 📱 Testing Your Setup

### Test 1: Send Test Message

1. Go to any invoice
2. Click actions menu (⋮)
3. Click "Send via WhatsApp"
4. Enter your own WhatsApp number (with +234 prefix)
5. Click "Send"

**Expected Result:**
- If API configured: "✅ Invoice sent successfully! The PDF has been delivered..."
- If not configured: "PDF downloaded! WhatsApp opened. Please attach..."

### Test 2: Check WhatsApp Receipt

1. Open WhatsApp on your phone
2. Check for message from your business number
3. Verify PDF is attached and can be opened

### Test 3: Verify Audit Log

Check database:
```sql
SELECT * FROM AuditLog
WHERE action = 'SEND_INVOICE_WHATSAPP'
ORDER BY createdAt DESC
LIMIT 5;
```

Should show:
- `method: 'whatsapp_business_api'` if sent via API
- `method: 'manual'` if fallback used

---

## 🔒 Security Best Practices

1. **Never expose your access token**
   - Keep it in `.env` file
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Use System User tokens**
   - Don't use personal user tokens
   - Create dedicated system user for the app

3. **Rotate tokens regularly**
   - Generate new tokens periodically
   - Revoke old tokens after rotation

4. **Monitor usage**
   - Check Meta Business Suite for message volume
   - Set up alerts for unusual activity

5. **Verify phone numbers**
   - Only send to verified numbers
   - Implement rate limiting

---

## 💰 Pricing

**Free Tier:**
- 1,000 free conversations per month
- Conversation = 24-hour window with a customer

**Paid Tier:**
- After 1,000 conversations
- Pricing varies by country
- Nigeria: ~₦4-8 per conversation
- [Check pricing](https://developers.facebook.com/docs/whatsapp/pricing)

**What Counts as a Conversation:**
- First message to a customer starts a 24-hour window
- All messages within 24 hours = 1 conversation
- After 24 hours, next message = new conversation

---

## 🐛 Troubleshooting

### Error: "WhatsApp API is not configured"

**Solution:** Check your `.env` file has all 4 variables:
```
WHATSAPP_API_ENABLED="true"
WHATSAPP_BUSINESS_ACCOUNT_ID="..."
WHATSAPP_PHONE_NUMBER_ID="..."
WHATSAPP_ACCESS_TOKEN="..."
```

### Error: "Invalid access token"

**Causes:**
- Token expired (temporary tokens last 24h)
- Token was revoked
- Wrong token copied

**Solution:** Generate a new permanent token (see Step 6)

### Error: "Phone number not registered"

**Causes:**
- Recipient's number not in E.164 format
- Number includes invalid characters

**Solution:**
- Format: +2348012345678 (no spaces, dashes, parentheses)
- Include country code

### Error: "Failed to upload media"

**Causes:**
- PDF file too large (max 16MB for documents)
- Network timeout

**Solution:**
- Optimize PDF size
- Retry the upload

### Error: "Message template not approved"

**Note:** This error only applies if using templates. Our implementation uses direct messaging, so this shouldn't occur.

### PDF Sends Successfully But Doesn't Arrive

**Check:**
1. Recipient's number is correct
2. Recipient has WhatsApp installed
3. Your business number is not blocked
4. Check Meta Business Suite for delivery status

---

## 📊 Monitoring & Analytics

### View Message Status

1. Go to [Meta Business Suite](https://business.facebook.com)
2. Navigate to WhatsApp Manager
3. Click "Insights"
4. See:
   - Messages sent
   - Messages delivered
   - Messages read
   - Failed messages

### Common Status Codes

- `sent` - Message sent to WhatsApp servers
- `delivered` - Message delivered to recipient
- `read` - Recipient opened the message
- `failed` - Message failed to send

---

## 🚀 Production Checklist

Before going live:

- [ ] Permanent access token generated and saved
- [ ] Environment variables configured in production
- [ ] Business phone number verified
- [ ] Test messages sent successfully
- [ ] Access token stored securely (not in code)
- [ ] Rate limiting implemented (optional)
- [ ] Monitoring set up
- [ ] Error handling tested
- [ ] Fallback to manual mode works
- [ ] Privacy policy updated (WhatsApp requirement)
- [ ] Terms of service include WhatsApp usage

---

## 📖 Additional Resources

- [WhatsApp Business Platform Docs](https://developers.facebook.com/docs/whatsapp)
- [Cloud API Getting Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/message-templates)
- [Webhook Setup](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Error Codes Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes)

---

## 🎉 Summary

**With WhatsApp Business API:**
- ✅ Customers receive PDF instantly on WhatsApp
- ✅ No manual attachment needed
- ✅ Professional automated delivery
- ✅ Track delivery status
- ✅ 1,000 free messages/month

**Without API (Fallback):**
- ✅ Still works - manual PDF attachment
- ✅ Free forever
- ✅ Good for low volume

**Recommendation:**
- Start with manual mode to test
- Set up API when sending >10 invoices/day
- API provides much better customer experience

---

*Last Updated: 2025-11-29*
*Status: Production Ready*
*Support: Check Meta Business Suite for issues*
