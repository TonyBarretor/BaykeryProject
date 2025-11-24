# Email & SMS Notifications Setup Guide

This guide explains how to configure email and SMS notifications for your Baykery e-commerce platform.

## 📧 Email Notifications (Resend)

### What Customers Receive:
- ✅ Order confirmation email immediately after checkout
- ✅ Order status updates (when admin changes status)
- ✅ Professional HTML emails with order details

### Step 1: Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Sign up with your email (FREE plan includes 3,000 emails/month)
3. Verify your email address

### Step 2: Add Your Domain (Recommended for Production)

**Option A: Use Your Own Domain**
1. In Resend dashboard → **Domains** → **Add Domain**
2. Enter your domain: `baykery.pe`
3. Add the DNS records Resend provides:
   ```
   Type: MX
   Name: @
   Value: feedback-smtp.us-east-1.amazonses.com
   Priority: 10

   Type: TXT
   Name: resend._domainkey
   Value: [provided by Resend]
   ```
4. Wait for verification (can take up to 48 hours)

**Option B: Use Resend's Test Domain (Quick Start)**
1. Skip domain setup
2. Emails will be sent from `onboarding@resend.dev`
3. Perfect for testing!

### Step 3: Get Your API Key

1. In Resend dashboard → **API Keys** → **Create API Key**
2. Name it: "Baykery Production"
3. Copy the API key (starts with `re_...`)
4. ⚠️ Save it securely - it won't be shown again!

### Step 4: Add to Vercel

1. Go to [vercel.com](https://vercel.com) → Your Project
2. **Settings** → **Environment Variables**
3. Add these variables:

```bash
# Required for email notifications
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email sender (use your verified domain or resend.dev for testing)
EMAIL_FROM=Baykery <pedidos@baykery.pe>
# or for testing: EMAIL_FROM=Baykery <onboarding@resend.dev>
```

4. Click **Save**
5. Go to **Deployments** → Click **Redeploy** on latest deployment

### Step 5: Test Email Notifications

1. Go to your website
2. Add a product to cart
3. Complete checkout with a real email address
4. Check your inbox - you should receive a confirmation email! 🎉

If no email arrives:
- Check spam/junk folder
- Verify RESEND_API_KEY is set correctly in Vercel
- Check Vercel function logs for errors

---

## 💳 Payment Integration (Culqi - Optional)

### Current State:
- Orders are created with "Payment on Delivery" method
- Customers pay when they receive the order (cash or card/transfer)
- Admin manually confirms payment

### To Enable Online Payments:

**Step 1: Sign Up for Culqi**

1. Go to [culqi.com](https://culqi.com)
2. Create a business account
3. Complete KYB (Know Your Business) verification
4. This process takes 2-3 business days for approval

**Step 2: Get API Keys**

1. In Culqi dashboard → **Developers** → **API Keys**
2. Copy both keys:
   - Public Key: `pk_test_...` (for frontend)
   - Secret Key: `sk_test_...` (for backend)

**Step 3: Add to Vercel**

```bash
# Culqi Payment Gateway (Peru)
CULQI_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
CULQI_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Step 4: Payment Methods Supported**

Once configured, customers can pay with:
- 💳 Visa, Mastercard, Amex, Diners
- 📱 Yape (very popular in Peru)
- 🏪 PagoEfectivo (cash payment at stores)

**Note:** Payment integration requires code changes to add the Culqi payment form to checkout. Contact your developer to implement this.

---

## 📱 SMS Notifications (Twilio - Optional)

### What You Can Send:
- Order confirmation via SMS
- Order ready for delivery notification
- Delivery on the way notification

### Step 1: Sign Up for Twilio

1. Go to [twilio.com](https://twilio.com)
2. Sign up (FREE trial includes $15 credit)
3. Get a phone number (Peru: +51 xxx xxx xxx)

### Step 2: Get Credentials

1. Dashboard → **Account Info**
2. Copy:
   - Account SID: `ACxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Auth Token: `xxxxxxxxxxxxxxxxxxxxxxxx`
   - Phone Number: `+51xxxxxxxxx`

### Step 3: Add to Vercel

```bash
# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+51xxxxxxxxx
```

### Step 4: SMS Cost in Peru

- Outbound SMS to Peru: ~$0.07 USD per message
- Monitor usage in Twilio dashboard

**Note:** SMS integration requires additional code. The email system is already implemented and working!

---

## 🧪 Testing

### Test Email Notifications:

1. **Place a test order:**
   ```
   Email: your-real-email@gmail.com
   Name: Test Customer
   ... complete checkout
   ```

2. **Check your inbox** - you should receive:
   - Subject: "Confirmación de Pedido #XXXXX - Baykery"
   - Beautiful HTML email with order details

3. **Check Resend Dashboard:**
   - Go to Resend → **Logs**
   - See all sent emails with delivery status

### Test Different Scenarios:

✅ **Successful order** → Confirmation email
✅ **Admin changes order status** → Status update email
✅ **Invalid email** → Order still created, email skipped

---

## 📊 Monitoring

### Resend Dashboard

Monitor email delivery:
- **Logs**: See all sent emails
- **Bounces**: Emails that failed
- **Complaints**: Spam reports
- **Opens**: Track email opens (optional)

### Vercel Function Logs

Check for email sending errors:
1. Vercel → Your Project → **Functions**
2. Click on `/api/checkout`
3. View logs for any email errors

---

## 🚨 Troubleshooting

### Email Not Sending

**Problem:** Customer doesn't receive confirmation email

**Solutions:**
1. **Check Vercel Environment Variables:**
   - Go to Vercel → Settings → Environment Variables
   - Verify `RESEND_API_KEY` is set
   - Verify `EMAIL_FROM` matches your verified domain

2. **Check Resend Dashboard:**
   - Go to Resend → Logs
   - Look for failed sends
   - Common issues: Unverified domain, invalid API key

3. **Check Function Logs:**
   - Vercel → Functions → `/api/checkout`
   - Look for "Failed to send confirmation email" errors

4. **Test API Key:**
   ```bash
   # In terminal, test your API key:
   curl https://api.resend.com/emails \
     -X POST \
     -H "Authorization: Bearer re_your_api_key" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "onboarding@resend.dev",
       "to": "your-email@example.com",
       "subject": "Test Email",
       "html": "<p>Test</p>"
     }'
   ```

### Email Goes to Spam

**Solutions:**
1. Verify your domain in Resend (add DNS records)
2. Use a custom domain instead of resend.dev
3. Ask recipients to add you to contacts

### Domain Verification Taking Long

- DNS propagation can take 24-48 hours
- Use `resend.dev` domain for immediate testing
- Check DNS with: [dnschecker.org](https://dnschecker.org)

---

## 💡 Best Practices

### Email Timing
- ✅ Send confirmation immediately after order
- ✅ Send status updates when admin changes order
- ❌ Don't send too many emails (avoid spam)

### Email Content
- ✅ Include order number (for tracking)
- ✅ Show delivery date and time
- ✅ List all items clearly
- ✅ Provide contact information
- ✅ Keep design simple and mobile-friendly

### Monitoring
- Check Resend dashboard daily for bounces
- Monitor delivery rates (should be >95%)
- Act on spam complaints immediately

---

## 📞 SMS Integration (Future Enhancement)

To add SMS notifications, you'll need to:

1. Install Twilio SDK:
   ```bash
   npm install twilio
   ```

2. Create SMS utility (`src/lib/sms.ts`):
   ```typescript
   import twilio from 'twilio';

   const client = twilio(
     process.env.TWILIO_ACCOUNT_SID,
     process.env.TWILIO_AUTH_TOKEN
   );

   export async function sendOrderSMS(phone: string, orderNumber: string) {
     await client.messages.create({
       body: `¡Pedido confirmado! #${orderNumber}. Te contactaremos pronto. - Baykery`,
       from: process.env.TWILIO_PHONE_NUMBER,
       to: phone
     });
   }
   ```

3. Call from checkout API (similar to email)

---

## ✅ Quick Checklist

**For Production Deployment:**

- [ ] Resend account created
- [ ] Domain verified (or using resend.dev)
- [ ] API key added to Vercel
- [ ] EMAIL_FROM configured
- [ ] Test email received successfully
- [ ] Monitored first 10 orders for email delivery

**Optional:**
- [ ] Culqi account created for payments
- [ ] Twilio account created for SMS
- [ ] Payment integration implemented
- [ ] SMS notifications implemented

---

## 🎉 You're All Set!

Once RESEND_API_KEY is configured in Vercel:
- ✅ Customers automatically receive confirmation emails
- ✅ Professional branded emails with order details
- ✅ Email logs available in Resend dashboard
- ✅ No code changes needed - it's already integrated!

**Next Steps:**
1. Add RESEND_API_KEY to Vercel (takes 2 minutes)
2. Redeploy your site
3. Place a test order
4. Check your inbox! 📬

---

Need help? Email pedidos@baykery.pe or check the documentation at:
- Resend Docs: https://resend.com/docs
- Culqi Docs: https://culqi.com/docs
- Twilio Docs: https://twilio.com/docs
