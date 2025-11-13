# 🍎 Running Baykery Locally on Mac

This guide will help you run the complete Baykery e-commerce platform on your Mac for testing before deploying to production.

**Time Required**: ~20-30 minutes

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Testing Features](#testing-features)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

#### 1. **Install Homebrew** (if not installed)
```bash
# Check if Homebrew is installed
brew --version

# If not installed, run:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. **Install Node.js** (v18 or higher)
```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed or version < 18:
brew install node

# Verify installation
node --version  # Should show v18.x or higher
npm --version   # Should show 9.x or higher
```

#### 3. **Install PostgreSQL**
```bash
# Check if PostgreSQL is installed
postgres --version

# If not installed:
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Verify it's running
brew services list | grep postgresql
```

#### 4. **Install Git** (usually pre-installed on Mac)
```bash
# Check Git version
git --version

# If not installed:
brew install git
```

---

## Initial Setup

### Step 1: Clone the Repository

```bash
# Navigate to where you want the project
cd ~/Documents  # or wherever you prefer

# Clone the repository
git clone https://github.com/TonyBarretor/BaykeryProject.git

# Enter the project directory
cd BaykeryProject

# Checkout the feature branch
git checkout claude/baykery-ecommerce-mvp-011CUpLGayuyvqopF8o8cAnB
```

### Step 2: Install Dependencies

```bash
# Install all Node.js packages
npm install

# This will take 2-3 minutes
# You should see "added XXX packages" when done
```

---

## Database Setup

### Option 1: Local PostgreSQL (Recommended for Mac)

#### Step 1: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# In the PostgreSQL prompt, run:
CREATE DATABASE baykery;
CREATE USER baykery_user WITH PASSWORD 'baykery_password';
GRANT ALL PRIVILEGES ON DATABASE baykery TO baykery_user;

# Grant schema permissions (PostgreSQL 15+)
\c baykery
GRANT ALL ON SCHEMA public TO baykery_user;

# Exit PostgreSQL
\q
```

#### Step 2: Test Connection

```bash
# Try connecting to your new database
psql -d baykery -U baykery_user -h localhost

# If prompted for password, enter: baykery_password
# You should see: baykery=>

# Exit
\q
```

### Option 2: Cloud Database (Easier Alternative)

If you have issues with local PostgreSQL, use Neon (free tier):

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create new project: `baykery-dev`
4. Copy the connection string
5. Skip to [Environment Configuration](#environment-configuration)

---

## Environment Configuration

### Step 1: Create .env File

```bash
# Copy the example file
cp .env.example .env

# Open in your default editor
nano .env
# or
code .env  # if you have VS Code
# or
open -e .env  # opens in TextEdit
```

### Step 2: Configure Environment Variables

Edit the `.env` file with these values:

```env
# Database - Use your local PostgreSQL
DATABASE_URL="postgresql://baykery_user:baykery_password@localhost:5432/baykery?schema=public"

# If using Neon instead, use their connection string:
# DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"

# NextAuth - Generate a random secret
NEXTAUTH_SECRET="your-super-secret-key-change-this-to-something-random"
NEXTAUTH_URL="http://localhost:3000"

# Email Service (Optional for local testing - leave as is)
RESEND_API_KEY="re_test_key"
EMAIL_FROM="Baykery <test@baykery.pe>"

# Upload Service (Optional for local testing - leave as is)
UPLOADTHING_SECRET="sk_test_key"
UPLOADTHING_APP_ID="test_app_id"

# Payment Gateway (Optional for local testing - leave as is)
CULQI_PUBLIC_KEY="pk_test_key"
CULQI_SECRET_KEY="sk_test_key"
CULQI_WEBHOOK_SECRET="test_webhook_secret"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Baykery"
NEXT_PUBLIC_MAX_ORDERS_PER_WINDOW="50"
```

### Step 3: Generate NEXTAUTH_SECRET

```bash
# Generate a secure random secret
openssl rand -base64 32

# Copy the output and paste it into .env as NEXTAUTH_SECRET
```

**Example**:
```env
NEXTAUTH_SECRET="abc123XYZ456def789GHI012jkl345MNO678pqr901="
```

---

## Running the Application

### Step 1: Set Up Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates all tables)
npm run db:push

# You should see:
# ✔ Generated Prisma Client
# Your database is now in sync with your Prisma schema
```

### Step 2: Seed Sample Data

```bash
# Load sample products, categories, and admin user
npm run db:seed

# You should see:
# 🌱 Starting database seed...
# ✅ Admin user created: admin@baykery.pe
# ✅ Categories created: 4
# ✅ Delivery zones created: 4
# ✅ Products created: 6
# ✅ Coupons created: 2
# 🎉 Seed completed successfully!
```

### Step 3: Start Development Server

```bash
# Start Next.js development server
npm run dev

# You should see:
# ▲ Next.js 16.0.1
# - Local:        http://localhost:3000
# - Environments: .env
# ✓ Ready in 2.5s
```

### Step 4: Open in Browser

```bash
# Open in default browser
open http://localhost:3000

# Or manually navigate to:
# http://localhost:3000
```

**🎉 Your Baykery site should now be running!**

---

## Testing Features

### 1. Test Homepage

✅ Navigate to: `http://localhost:3000`

**You should see**:
- Baykery header with logo
- "Panadería artesanal en Lima, Perú"
- Navigation menu (Inicio, Productos, Nosotros, Contacto)
- Cart icon in header

### 2. Test Product Listing

✅ Click **"Ver Productos"** or navigate to: `http://localhost:3000/productos`

**You should see**:
- 6 sample products (Pan de Masa Madre, Croissants, etc.)
- Category filter buttons (Todos, Panes, Pasteles, Galletas, Croissants)
- Product cards with images, prices, and "Ver Detalles" buttons

### 3. Test Product Detail

✅ Click on any product

**You should see**:
- Product image
- Product name and description
- Price in PEN (Peruvian Soles)
- Stock availability
- Allergen warnings (if applicable)
- Quantity selector
- "Agregar al Carrito" button

### 4. Test Shopping Cart

✅ Add a product to cart

**You should see**:
- Toast notification: "X agregado al carrito"
- Cart icon now shows item count (red badge)

✅ Click the cart icon (shopping bag)

**You should see**:
- Cart drawer slides in from right
- Product thumbnail and name
- Quantity controls (+/-)
- Running total
- "Proceder al Pago" button

### 5. Test Checkout Flow

✅ Click **"Proceder al Pago"** in cart

**You should see**:
- Contact information form (Email, Name, Phone)
- Delivery information form (Address, District)
- Weekend date picker (only Saturdays and Sundays clickable)
- Delivery window selector (Morning/Afternoon)
- Optional tip buttons
- Order summary on the right

✅ Fill out the form and submit

**Expected behavior**:
- If you select a weekday: Shows error
- If you select a weekend: Creates order
- Redirects to order confirmation

### 6. Test Admin Dashboard

✅ Navigate to: `http://localhost:3000/admin`

**Login credentials**:
- Email: `admin@baykery.pe`
- Password: `admin123`

**You should see**:
- Statistics cards (Products: 6, Orders, Categories: 4, etc.)
- Quick action cards
- "Ver Sitio" button to return to storefront

✅ Click **"Ver todos los productos"**

**You should see**:
- Grid of all 6 products
- Status badges (PUBLISHED)
- Stock counts

✅ Click **"Ver todos los pedidos"**

**You should see**:
- List of any orders you created during testing
- Order details (customer info, items, totals)
- Status badges

---

## Viewing Database Content

### Using Prisma Studio (Recommended)

```bash
# Open Prisma Studio in browser
npm run db:studio

# Opens at: http://localhost:5555
```

**You can now**:
- View all tables (User, Product, Order, etc.)
- Edit data directly
- See relationships
- Search and filter

### Using PostgreSQL Command Line

```bash
# Connect to database
psql -d baykery -U baykery_user -h localhost

# List all tables
\dt

# View products
SELECT id, name, "pricePEN", stock, status FROM products;

# View orders
SELECT "orderNumber", email, "totalPEN", status FROM orders;

# Exit
\q
```

---

## Testing Weekend-Only Validation

### Test 1: Try to Select a Weekday

1. Go to checkout
2. Try clicking on a Monday-Friday date
3. **Expected**: Date is not selectable (button is disabled or not shown)

### Test 2: Try to Submit Weekday via Browser DevTools

```javascript
// Open browser DevTools (Cmd + Option + I)
// Go to Console tab
// Try to manipulate the date (this should fail)

// Submit with a weekday date
fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deliveryDate: '2025-11-17', // Monday
    // ... other required fields
  })
})

// Expected response: 422 Unprocessable Entity
// Error: "La fecha de entrega debe ser sábado o domingo"
```

**✅ This confirms server-side validation works!**

---

## Troubleshooting

### Issue: "Port 3000 already in use"

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port
npm run dev -- -p 3001
```

### Issue: "Command not found: psql"

```bash
# Add PostgreSQL to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Try again
psql --version
```

### Issue: "Cannot connect to PostgreSQL"

```bash
# Check if PostgreSQL is running
brew services list

# If not running, start it
brew services start postgresql@16

# Check connection
psql -l
```

### Issue: "Prisma Client did not initialize"

```bash
# Regenerate Prisma Client
npm run db:generate

# Restart dev server
npm run dev
```

### Issue: "Module not found" errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: "Database does not exist"

```bash
# Recreate database
psql postgres
DROP DATABASE IF EXISTS baykery;
CREATE DATABASE baykery;
\q

# Push schema again
npm run db:push
npm run db:seed
```

### Issue: Images not loading

**This is normal in local development!**

The sample products use Unsplash URLs which may:
- Be blocked by privacy extensions
- Load slowly
- Not load if offline

**To fix**:
- Disable ad blockers for localhost
- Or replace with local images later
- Or use data URLs

### Issue: "Admin login doesn't work"

```bash
# Verify admin user exists
npm run db:studio

# Navigate to User table
# Check if admin@baykery.pe exists

# If not, run seed again
npm run db:seed
```

---

## Testing Payment Flow (Mock)

The payment integration requires Culqi API keys. For local testing:

1. **Checkout creates orders** - ✅ This works
2. **Orders show in admin** - ✅ This works
3. **Actual payment processing** - ⏳ Requires Culqi account

**To test the full flow later**:
1. Sign up at [culqi.com](https://culqi.com)
2. Get test API keys
3. Add to `.env`
4. Restart server
5. Complete a test purchase

---

## Stopping the Application

```bash
# In the terminal where dev server is running
# Press: Ctrl + C

# Stop PostgreSQL (optional)
brew services stop postgresql@16
```

---

## Next Steps After Local Testing

Once you've tested everything locally and it works:

1. ✅ **Verify all features work**
   - Products load
   - Cart works
   - Checkout accepts orders
   - Weekend validation works
   - Admin login works

2. ✅ **Customize your data**
   - Add your real products (via admin)
   - Upload actual product photos
   - Adjust delivery zones for your area
   - Update pricing

3. ✅ **Deploy to production**
   - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Use Neon for production database
   - Deploy to Vercel
   - Set up payment gateway

---

## Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Check code quality

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:seed          # Load sample data
npm run db:studio        # Open Prisma Studio
psql -d baykery -U baykery_user  # Connect to database

# Utilities
npm run format           # Format code with Prettier
npm test                 # Run tests (when added)
```

---

## Performance Tips for Mac

### Speed up development server

```bash
# Use SWC compiler (faster than Babel)
# Already configured in Next.js 16

# Increase Node.js memory (if needed)
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

### Monitor resource usage

```bash
# Check Node.js processes
ps aux | grep node

# Monitor CPU/RAM
Activity Monitor (Cmd + Space → "Activity Monitor")
```

---

## File Structure Overview

```
BaykeryProject/
├── .env                        # Your local environment variables
├── .env.example               # Template for environment variables
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data script
├── src/
│   ├── app/                   # Next.js pages and routes
│   │   ├── page.tsx           # Homepage (localhost:3000)
│   │   ├── productos/         # Product pages
│   │   ├── checkout/          # Checkout page
│   │   ├── admin/             # Admin dashboard
│   │   └── api/               # API routes
│   ├── components/            # React components
│   └── lib/                   # Utilities and configuration
├── public/                    # Static files (future images)
├── package.json               # Dependencies and scripts
└── LOCAL_SETUP.md            # This guide!
```

---

## Success Checklist

After following this guide, you should be able to:

- [x] Start the development server
- [x] View the homepage at localhost:3000
- [x] Browse products with category filters
- [x] Add items to cart
- [x] Complete checkout (creates order)
- [x] Login to admin dashboard
- [x] View products and orders in admin
- [x] See data in Prisma Studio
- [x] Weekend date picker only allows Sat/Sun

**If all checked, you're ready to customize and deploy! 🎉**

---

## Getting Help

### Common Questions

**Q: Do I need to pay for anything to test locally?**
A: No! Everything runs free on your Mac.

**Q: Can I test payments locally?**
A: You can test the checkout flow, but real payment processing requires a Culqi account.

**Q: How do I add my own products?**
A: Login to admin → Products → Create New (or edit via Prisma Studio)

**Q: Can I change the sample data?**
A: Yes! Edit `prisma/seed.ts` and run `npm run db:seed` again

**Q: What if I break something?**
A: No worries! Just recreate the database:
```bash
npm run db:push  # Recreates tables
npm run db:seed  # Reloads sample data
```

### Resources

- **Project Documentation**: [README.md](./README.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)

---

## Summary

You now have Baykery running locally on your Mac! 🎉

**What works**:
- ✅ Complete storefront
- ✅ Shopping cart
- ✅ Checkout (creates orders)
- ✅ Admin dashboard
- ✅ Weekend validation
- ✅ Database with sample data

**What's next**:
1. Play around and test all features
2. Add your real product data
3. Customize the design if needed
4. Deploy to production (when ready)

**Enjoy testing your bakery e-commerce platform!** 🥐🎂🍪

---

**Made with ❤️ for local development on Mac**

*Last updated: November 2025*
