# Baykery - Complete Deployment Guide

This guide provides step-by-step instructions to deploy your Baykery e-commerce platform to production.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Vercel Deployment](#vercel-deployment)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- ✅ **GitHub** account (for code hosting)
- ✅ **Vercel** account ([vercel.com](https://vercel.com) - free tier available)
- ✅ **Database** - Choose one:
  - [Neon](https://neon.tech) (recommended, free tier with serverless PostgreSQL)
  - [Supabase](https://supabase.com) (PostgreSQL + real-time features)
  - [Railway](https://railway.app) (PostgreSQL hosting)

### Optional Services (for full functionality)
- **Resend** ([resend.com](https://resend.com)) - Email service (free tier: 100 emails/day)
- **UploadThing** ([uploadthing.com](https://uploadthing.com)) - File uploads (free tier: 2GB)
- **Culqi** ([culqi.com](https://culqi.com)) - Payment gateway for Peru

---

## Database Setup

### Option 1: Neon (Recommended)

1. **Create Account**
   ```
   Go to: https://neon.tech
   Sign up with GitHub
   ```

2. **Create Database**
   - Click "Create Project"
   - Name: `baykery-production`
   - Region: Choose closest to your users (e.g., US East for Peru)
   - PostgreSQL version: 16 (latest)

3. **Get Connection String**
   - Navigate to "Connection Details"
   - Copy the connection string:
     ```
     postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - Save this for environment variables

4. **Enable Connection Pooling (Important for Serverless)**
   - In Neon dashboard, enable "Connection Pooling"
   - Use the **pooled connection string** (ends with `?sslmode=require&pgbouncer=true`)

### Option 2: Supabase

1. **Create Project**
   ```
   Go to: https://supabase.com
   New Project → Name: baykery → Region: closest to users
   ```

2. **Get Connection String**
   - Settings → Database → Connection string
   - Use "Connection pooling" string for production
   - Format: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

---

## Environment Configuration

### 1. Secure Environment Variables

Create a `.env.production` file (do NOT commit this):

```env
# Database (from Neon or Supabase)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth (CRITICAL: Generate a strong secret)
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://baykery.pe"

# Email Service (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="Baykery <pedidos@baykery.pe>"

# File Uploads (UploadThing)
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="..."

# Payment Gateway (Culqi - Peru)
CULQI_PUBLIC_KEY="pk_live_..."
CULQI_SECRET_KEY="sk_live_..."
CULQI_WEBHOOK_SECRET="..."

# App Configuration
NEXT_PUBLIC_APP_URL="https://baykery.pe"
NEXT_PUBLIC_APP_NAME="Baykery"
NEXT_PUBLIC_MAX_ORDERS_PER_WINDOW="50"
```

### 2. Generate Secrets

**NEXTAUTH_SECRET** (Required):
```bash
# Run this in your terminal:
openssl rand -base64 32
```

---

## Vercel Deployment

### Step 1: Push to GitHub

```bash
# Ensure you're on the main branch
git checkout main

# Merge your feature branch
git merge claude/baykery-ecommerce-mvp-011CUpLGayuyvqopF8o8cAnB

# Push to GitHub
git push origin main
```

### Step 2: Connect to Vercel

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Add Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add ALL variables from your `.env.production`
   - Set for: **Production**, **Preview**, **Development**

   **IMPORTANT**: Add these variables in Vercel:
   ```
   DATABASE_URL
   NEXTAUTH_SECRET
   NEXTAUTH_URL
   RESEND_API_KEY
   EMAIL_FROM
   UPLOADTHING_SECRET
   UPLOADTHING_APP_ID
   CULQI_PUBLIC_KEY
   CULQI_SECRET_KEY
   CULQI_WEBHOOK_SECRET
   NEXT_PUBLIC_APP_URL
   NEXT_PUBLIC_MAX_ORDERS_PER_WINDOW
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Vercel will provide a URL: `https://baykery-xxx.vercel.app`

### Step 3: Run Database Migrations

**CRITICAL**: Before your app works, you must set up the database schema.

```bash
# In your local terminal, with production DATABASE_URL:
export DATABASE_URL="your-production-database-url"

# Push schema to production database
npx prisma db push

# Seed with initial data
npm run db:seed
```

**Alternative: Use Vercel CLI**
```bash
npm i -g vercel
vercel env pull .env.local
npx prisma db push
npm run db:seed
```

### Step 4: Configure Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Project Settings → Domains
   - Add domain: `baykery.pe` and `www.baykery.pe`

2. **Update DNS**
   - At your domain registrar (GoDaddy, Namecheap, etc.):
   ```
   A     @      76.76.21.21
   CNAME www    cname.vercel-dns.com
   ```

3. **Update Environment Variable**
   - In Vercel: Change `NEXTAUTH_URL` to `https://baykery.pe`
   - Redeploy for changes to take effect

---

## Post-Deployment Setup

### 1. Create Admin Account

After first deployment:

```bash
# Connect to production database
npx prisma studio --url="your-production-database-url"

# Or use seed script to create admin user:
npm run db:seed
```

**Default admin credentials** (from seed):
- Email: `admin@baykery.pe`
- Password: `admin123`

⚠️ **CHANGE THE PASSWORD IMMEDIATELY** after first login!

### 2. Add Products

1. Go to `https://your-domain.com/admin`
2. Login with admin credentials
3. Navigate to Products → Create New
4. Add your first products with:
   - Name, description, price
   - Images (via URL or UploadThing)
   - Category, stock, allergens
   - Weekend-only flag

### 3. Configure Delivery Zones

The seed script creates 4 Lima zones:
- Miraflores (S/ 10)
- San Isidro (S/ 10)
- Barranco (S/ 12)
- Surco (S/ 15)

To add more zones, use Prisma Studio or create an admin UI.

### 4. Set Up Email Service (Resend)

1. **Verify Domain**
   - Go to [resend.com](https://resend.com) → Domains
   - Add your domain: `baykery.pe`
   - Add DNS records (MX, TXT for DKIM)

2. **Create API Key**
   - API Keys → Create
   - Add to Vercel environment variables

3. **Test Email**
   - Use the contact form or send a test order
   - Check Resend dashboard for delivery status

### 5. Payment Integration (Culqi)

1. **Create Culqi Account**
   - Go to [culqi.com](https://culqi.com)
   - Complete business verification (required for live mode)

2. **Get API Keys**
   - Development keys for testing
   - Production keys for live transactions

3. **Configure Webhooks**
   - Webhook URL: `https://your-domain.com/api/webhooks/culqi`
   - Events: `charge.created`, `charge.succeeded`, `charge.failed`
   - Get webhook secret and add to env vars

4. **Test Payment Flow**
   - Use test cards from Culqi docs
   - Verify webhook receives events
   - Check order status updates

---

## Monitoring & Maintenance

### Vercel Analytics

Vercel automatically provides:
- **Performance metrics** (LCP, FID, CLS)
- **Error tracking**
- **Usage statistics**

Access via: Project → Analytics

### Database Monitoring (Neon)

- Monitor connections: Neon Dashboard → Monitoring
- Check storage usage
- Set up alerts for high CPU/memory

### Regular Tasks

**Daily:**
- Check new orders: `/admin/orders`
- Monitor inventory: `/admin/products`

**Weekly:**
- Review analytics
- Check email delivery (Resend dashboard)
- Verify payment settlements (Culqi dashboard)

**Monthly:**
- Update dependencies: `npm update`
- Review and rotate secrets if needed
- Backup database (Neon auto-backups)

---

## Troubleshooting

### Database Connection Errors

**Symptom**: `P1001: Can't reach database server`

**Solution**:
```bash
# Verify connection string format
echo $DATABASE_URL

# Test connection locally
npx prisma db pull

# Check Neon/Supabase dashboard for active connections
```

### Build Failures

**Symptom**: Vercel deployment fails

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify all dependencies are in `package.json`
3. Ensure `postinstall` script runs: `"postinstall": "prisma generate"`
4. Check TypeScript errors:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

### Environment Variable Conflicts

**Symptom**: Vercel deployment fails due to environment variable conflicts

**Solutions**:
1. **Remove `vercel.json` environment variables**
   - If you have a `vercel.json` file with `env` section, DELETE it
   - Vercel environment variables should ONLY be set in the Vercel dashboard
   - Keeping env vars in both places causes conflicts and build failures

   ```bash
   # If you have vercel.json, remove the env section or delete the file
   rm vercel.json
   ```

2. **Set all environment variables in Vercel dashboard only**
   - Go to Project → Settings → Environment Variables
   - Add each variable individually for Production, Preview, and Development

### Nodemailer Dependency Warnings

**Symptom**: npm warnings about nodemailer peer dependency mismatch

```
npm warn peerOptional nodemailer@"^6.8.0" from @auth/core@0.41.0
npm warn Conflicting peer dependency: nodemailer@6.10.1
```

**Solution**: This is a peer dependency warning from NextAuth and can be safely ignored. However, if you want to resolve it:

```bash
# The project uses nodemailer@7.0.10 which is newer than the peer dependency request
# NextAuth's @auth/core requests nodemailer@^6.8.0 but works fine with v7
# No action needed - this is a warning, not an error
```

If email functionality doesn't work, verify:
1. `RESEND_API_KEY` is set in Vercel
2. `EMAIL_FROM` matches your verified Resend domain
3. Check Resend dashboard for delivery logs

### NextAuth Errors

**Symptom**: `[next-auth][error][SIGNIN_EMAIL_ERROR]`

**Solutions**:
1. Verify `NEXTAUTH_SECRET` is set in Vercel
2. Check `NEXTAUTH_URL` matches your domain
3. Ensure email provider (Resend) is configured
4. Check Resend API key is valid

### Prisma Client Errors

**Symptom**: `PrismaClient is unable to be run in the browser`

**Solution**:
- Ensure you're only importing `@/lib/prisma` in server components
- Use `'use client'` directive only for client components
- Check API routes don't leak Prisma to client

### Weekend Date Validation Fails

**Symptom**: Checkout accepts weekdays

**Solutions**:
1. Verify server-side validation in `/api/checkout`
2. Check `isWeekend()` function in `utils.ts`
3. Ensure date is being passed correctly from client

### Payment Webhook Not Working

**Symptom**: Orders stuck in PENDING status

**Solutions**:
1. Verify webhook URL in Culqi dashboard
2. Check webhook secret matches env variable
3. Test webhook with Culqi's webhook tester
4. Review webhook handler logs in Vercel

---

## Performance Optimization

### After Deployment

1. **Enable ISR (Incremental Static Regeneration)**
   - Product pages auto-regenerate every 60 seconds
   - Configured in `page.tsx`: `export const revalidate = 60`

2. **Optimize Images**
   - All images use Next.js `Image` component
   - Automatic AVIF/WebP conversion
   - Responsive sizes based on viewport

3. **Run Lighthouse Audit**
   ```bash
   npm install -g @lhci/cli
   lhci autorun --collect.url=https://baykery.pe
   ```

   **Target Scores**:
   - Performance: ≥90
   - Accessibility: ≥90
   - Best Practices: ≥90
   - SEO: ≥90

4. **Edge Caching**
   - Static assets cached via Vercel CDN
   - API routes use Edge Functions for low latency

---

## Security Checklist

Before going live:

- [ ] Change default admin password
- [ ] Enable 2FA on Vercel, GitHub, database provider
- [ ] Use HTTPS only (enforced by Vercel)
- [ ] Verify webhook signature validation
- [ ] Enable rate limiting on API routes (future enhancement)
- [ ] Set up monitoring alerts (Sentry optional)
- [ ] Review and minimize API key permissions
- [ ] Add privacy policy and terms of service pages
- [ ] Enable CORS only for trusted domains
- [ ] Use environment variables for all secrets

---

## Rollback Plan

If deployment has issues:

1. **Immediate Rollback**
   - Vercel Dashboard → Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Database Rollback**
   - Neon: Use "Restore from backup" feature
   - Supabase: Point-in-time recovery

3. **Fix and Redeploy**
   - Fix issues locally
   - Test thoroughly
   - Push to GitHub
   - Vercel auto-deploys

---

## Success Criteria

Your deployment is successful when:

✅ Homepage loads at your domain
✅ Product listing shows all products
✅ Cart functionality works end-to-end
✅ Weekend-only date picker only allows Sat/Sun
✅ Checkout creates orders in database
✅ Admin can login and see dashboard
✅ Admin can view/edit products and orders
✅ Email confirmations are sent (if Resend configured)
✅ Lighthouse score ≥90 on mobile

---

## Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)

---

**Deployment Complete!** 🎉

Your Baykery e-commerce platform is now live and ready to accept orders!

Need help? Review the [README.md](./README.md) for development guide or check [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) for project status.
