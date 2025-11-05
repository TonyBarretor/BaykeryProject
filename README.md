# Baykery - Elegant E-commerce for Artisan Bakery in Peru

A production-ready, mobile-first e-commerce web application for Baykery, an artisan bakery in Lima, Peru. Customers can browse products, add to cart, pay online, and schedule weekend-only delivery. Admins have a complete dashboard to manage products, categories, inventory, and orders.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.18-2D3748)

## 🌟 Features

### Customer Features
- ✨ **Elegant Mobile-First Design** - Optimized for Instagram traffic
- 🛍️ **Product Browsing** - Categories, search, filters, featured products
- 🛒 **Shopping Cart** - Guest and authenticated checkout
- 📅 **Weekend-Only Delivery** - Smart date picker (Saturday/Sunday only)
- 💳 **Payment Integration** - Culqi (cards + Yape + PagoEfectivo) with Mercado Pago fallback
- 📧 **Email Receipts** - Branded order confirmations with ICS calendar attachment
- 🎟️ **Coupon System** - Percentage and fixed-amount discounts
- 🚚 **Delivery Zones** - District-based delivery fees
- 🔐 **Authentication** - Email magic link + optional Google OAuth

### Admin Features
- 📊 **Dashboard** - Order management, analytics
- 📦 **Product Management** - Full CRUD with rich text, images, inventory
- 🏷️ **Category Management** - Organize product catalog
- 📋 **Order Processing** - Status updates, fulfillment notes, refunds
- 🎫 **Coupon Management** - Create promotional codes
- 🚛 **Delivery Zones** - Configure districts and fees
- 👥 **Role-Based Access** - ADMIN vs CUSTOMER permissions

## 🛠️ Tech Stack

### Core
- **Framework**: Next.js 16 (App Router, SSR + ISR)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5
- **Styling**: Tailwind CSS + shadcn/ui components

### Key Libraries
- **Validation**: Zod
- **Forms**: React Hook Form + @hookform/resolvers
- **State Management**: TanStack Query (React Query)
- **Images**: Next/Image with AVIF/WebP, UploadThing
- **Email**: Resend with branded templates
- **Payments**: Culqi SDK (primary), Mercado Pago (backup)
- **Animation**: Framer Motion

### Development
- **Package Manager**: npm
- **Linting**: ESLint (Next.js config)
- **Formatting**: Prettier with Tailwind plugin
- **Testing**: Jest + Playwright

## 📁 Project Structure

```
BaykeryProject/
├── prisma/
│   ├── schema.prisma          # Database schema (User, Product, Order, etc.)
│   └── seed.ts                # Sample data seed script
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth handlers
│   │   │   ├── products/      # Product CRUD
│   │   │   ├── categories/    # Category management
│   │   │   └── checkout/      # Order creation
│   │   ├── globals.css        # Tailwind base styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── utils.ts           # Utility functions
│   │   └── validations.ts     # Zod schemas
│   ├── hooks/                 # Custom React hooks (future)
│   └── types/                 # TypeScript type definitions (future)
├── .env.example               # Environment variables template
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (local or hosted)
- Accounts: Resend (email), UploadThing (images), Culqi (payments)

### 1. Clone and Install

```bash
git clone https://github.com/TonyBarretor/BaykeryProject.git
cd BaykeryProject
npm install
```

### 2. Configure Environment

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/baykery?schema=public"

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="Baykery <pedidos@baykery.pe>"

# Upload (UploadThing)
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="..."

# Culqi (Payment Gateway)
CULQI_PUBLIC_KEY="pk_test_..."
CULQI_SECRET_KEY="sk_test_..."
CULQI_WEBHOOK_SECRET="..."

# Optional
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_MAX_ORDERS_PER_WINDOW="50"
```

### 3. Set Up Database

```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Test Admin Access

**Admin credentials** (from seed):
- Email: `admin@baykery.pe`
- Password: `admin123`

## 📊 Database Schema

### Core Models

#### User
- Authentication and user management
- Roles: CUSTOMER (default), ADMIN
- Linked to orders and sessions

#### Product
- slug, name, description, pricePEN, costPEN
- status: DRAFT, PUBLISHED, ARCHIVED
- weekendOnly flag (enforced at API level)
- allergens, tags, images[], stock, SKU, nutrition
- Linked to category and order items

#### Category
- name, slug, description, image
- Order and active flags

#### Order
- orderNumber, email, name, phone, address, district
- subtotalPEN, deliveryFeePEN, discountPEN, tipPEN, totalPEN
- paymentProvider (CULQI/MERCADOPAGO), paymentStatus, providerRef
- status: PENDING, PAID, PROCESSING, READY, DELIVERED, CANCELLED, REFUNDED
- deliveryDate (weekend only), deliveryWindow (MORNING/AFTERNOON)
- Linked to user, zone, items, coupon

#### DeliveryZone
- name, description, feePEN, active
- Districts in Lima (Miraflores, San Isidro, etc.)

#### Coupon
- code, type (PERCENTAGE/FIXED), value
- minSubtotalPEN, maxDiscountPEN, startsAt, endsAt
- uses, maxUses, active

## 🔒 Security & Compliance

- **Server-side validation** with Zod for all inputs
- **HTTPS only** in production (enforced by Vercel)
- **CSRF protection** on mutations
- **Webhook signature verification** for payment providers
- **Role-based access control** (RBAC) for admin routes
- **Secure session handling** with NextAuth JWT
- **Environment secrets** never committed to Git
- **Privacy notice** and terms of service (to be added)

## 📱 Weekend-Only Delivery Business Rules

1. **Date Selection**: Only Saturday (6) and Sunday (0) can be selected
2. **Client-side**: Date picker disables all non-weekend dates
3. **Server-side**: API validates day and rejects weekdays with 422 status
4. **Future dates**: Must be at least tomorrow (today + 1 day)
5. **Capacity limits**: Max orders per window (configurable via env)

## 💳 Payment Integration

### Culqi (Primary)
- Cards (Visa, MasterCard, Amex, Diners)
- Yape (digital wallet)
- PagoEfectivo (cash payment codes)
- Fees: ~3.44% + $0.20 + IGV (verify with your plan)
- Webhooks for payment confirmation

### Mercado Pago (Backup)
- Optional fallback toggle in admin
- Supports installments and marketplace features
- Different settlement times and fees

## 📧 Email System

Powered by **Resend** with:
- Order confirmation emails
- ICS calendar attachment for delivery date
- Magic link authentication emails
- Branded HTML templates

## 🖼️ Image Management

- **UploadThing** or **Cloudinary** for product images
- Next/Image optimization (AVIF, WebP)
- Responsive sizes for mobile-first

## 🎨 Design System

### Colors (Tailwind CSS Variables)
- **Background**: Soft ivory/stone (30 20% 98%)
- **Primary**: Cacao (18 50% 35%)
- **Accent**: Burgundy (350 60% 45%)
- **Foreground**: Deep brown (30 10% 15%)

### Typography
- **Sans-serif**: Inter (body text)
- **Serif**: Playfair Display (headings)

### Components
Built with shadcn/ui patterns:
- Button, Card, Input, Label
- Form components (to be added)
- Dialog, Sheet, Dropdown (to be added)

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests (Playwright)
npm run test:e2e
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Vercel automatically:
- Builds with `npm run build`
- Runs `prisma generate` (postinstall)
- Enables Edge functions

### Database

Use a managed PostgreSQL service:
- **Neon** (serverless, free tier)
- **Supabase** (PostgreSQL + real-time)
- **PlanetScale** (MySQL-compatible if needed)

### Run Migrations in Production

```bash
npm run db:migrate:prod
```

## 📜 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to DB (dev)
npm run db:migrate       # Create migration (dev)
npm run db:migrate:prod  # Deploy migrations (prod)
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database
npm test                 # Run Jest tests
npm run test:e2e         # Run Playwright tests
```

## 🗺️ Roadmap

### Sprint 1: Foundation (Completed)
- ✅ Next.js setup with TypeScript
- ✅ Prisma schema and migrations
- ✅ NextAuth configuration
- ✅ API routes (products, categories, checkout)
- ✅ Validation schemas
- ✅ Database seed script

### Sprint 2: Storefront (Next)
- ⏳ Product listing page with filters
- ⏳ Product detail page with image gallery
- ⏳ Shopping cart state management
- ⏳ Weekend-only date picker
- ⏳ Checkout flow with delivery zones

### Sprint 3: Payments & Admin
- ⏳ Culqi payment integration
- ⏳ Payment webhooks
- ⏳ Admin dashboard
- ⏳ Product CRUD interface
- ⏳ Order management

### Sprint 4: Polish & Launch
- ⏳ Email templates (Resend)
- ⏳ Image upload (UploadThing)
- ⏳ SEO optimization
- ⏳ Performance optimization (Lighthouse 90+)
- ⏳ E2E tests
- ⏳ Production deployment

## 🤝 Contributing

This is a private project for Baykery. For questions or issues, contact the development team.

## 📄 License

Proprietary - All rights reserved by Baykery

## 📞 Support

For technical support:
- Email: dev@baykery.pe
- Issues: GitHub Issues (private repository)

---

**Built with ❤️ for Baykery**
