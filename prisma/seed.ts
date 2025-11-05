import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@baykery.pe' },
    update: {},
    create: {
      email: 'admin@baykery.pe',
      name: 'Admin Baykery',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'panes' },
      update: {},
      create: {
        name: 'Panes',
        slug: 'panes',
        description: 'Panes artesanales recién horneados',
        order: 1,
        active: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'pasteles' },
      update: {},
      create: {
        name: 'Pasteles',
        slug: 'pasteles',
        description: 'Deliciosos pasteles caseros',
        order: 2,
        active: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'galletas' },
      update: {},
      create: {
        name: 'Galletas',
        slug: 'galletas',
        description: 'Galletas crujientes y suaves',
        order: 3,
        active: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'croissants' },
      update: {},
      create: {
        name: 'Croissants',
        slug: 'croissants',
        description: 'Croissants hojaldrados y mantequillosos',
        order: 4,
        active: true,
      },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Create delivery zones
  const zones = await Promise.all([
    prisma.deliveryZone.upsert({
      where: { id: 'miraflores-id' },
      update: {},
      create: {
        id: 'miraflores-id',
        name: 'Miraflores',
        description: 'Distrito de Miraflores',
        feePEN: 10.0,
        active: true,
        order: 1,
      },
    }),
    prisma.deliveryZone.upsert({
      where: { id: 'san-isidro-id' },
      update: {},
      create: {
        id: 'san-isidro-id',
        name: 'San Isidro',
        description: 'Distrito de San Isidro',
        feePEN: 10.0,
        active: true,
        order: 2,
      },
    }),
    prisma.deliveryZone.upsert({
      where: { id: 'barranco-id' },
      update: {},
      create: {
        id: 'barranco-id',
        name: 'Barranco',
        description: 'Distrito de Barranco',
        feePEN: 12.0,
        active: true,
        order: 3,
      },
    }),
    prisma.deliveryZone.upsert({
      where: { id: 'surco-id' },
      update: {},
      create: {
        id: 'surco-id',
        name: 'Surco',
        description: 'Distrito de Santiago de Surco',
        feePEN: 15.0,
        active: true,
        order: 4,
      },
    }),
  ]);
  console.log('✅ Delivery zones created:', zones.length);

  // Create sample products
  const products = [
    {
      slug: 'pan-de-masa-madre',
      name: 'Pan de Masa Madre',
      description:
        'Pan artesanal hecho con masa madre natural, fermentado lentamente durante 24 horas para un sabor profundo y corteza crujiente.',
      pricePEN: 18.0,
      costPEN: 8.0,
      status: 'PUBLISHED' as const,
      weekendOnly: true,
      allergens: ['gluten'],
      tags: ['artesanal', 'masa madre', 'sin conservantes'],
      images: ['https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800'],
      stock: 20,
      sku: 'PAN-MM-001',
      weight: 500,
      categoryId: categories[0].id,
      featured: true,
    },
    {
      slug: 'croissant-mantequilla',
      name: 'Croissant de Mantequilla',
      description:
        'Croissant francés tradicional con capas hojaldradas y mantequillosas. Horneado fresco cada mañana.',
      pricePEN: 8.0,
      costPEN: 3.5,
      status: 'PUBLISHED' as const,
      weekendOnly: true,
      allergens: ['gluten', 'lácteos'],
      tags: ['francés', 'mantequilla', 'hojaldrado'],
      images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800'],
      stock: 30,
      sku: 'CRO-MAN-001',
      weight: 80,
      categoryId: categories[3].id,
      featured: true,
    },
    {
      slug: 'pastel-chocolate',
      name: 'Pastel de Chocolate',
      description:
        'Pastel de chocolate húmedo y esponjoso con ganache de chocolate oscuro. Perfecto para celebraciones.',
      pricePEN: 45.0,
      costPEN: 20.0,
      status: 'PUBLISHED' as const,
      weekendOnly: true,
      allergens: ['gluten', 'lácteos', 'huevo'],
      tags: ['chocolate', 'celebración', 'premium'],
      images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'],
      stock: 10,
      sku: 'PAS-CHO-001',
      weight: 1000,
      categoryId: categories[1].id,
      featured: true,
    },
    {
      slug: 'galletas-chispas-chocolate',
      name: 'Galletas con Chispas de Chocolate',
      description:
        'Galletas clásicas americanas con generosas chispas de chocolate. Suaves por dentro, crujientes por fuera.',
      pricePEN: 12.0,
      costPEN: 5.0,
      status: 'PUBLISHED' as const,
      weekendOnly: true,
      allergens: ['gluten', 'lácteos', 'huevo'],
      tags: ['chocolate', 'galletas', 'clásico'],
      images: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800'],
      stock: 25,
      sku: 'GAL-CHO-001',
      weight: 200,
      categoryId: categories[2].id,
      featured: false,
    },
    {
      slug: 'pan-integral',
      name: 'Pan Integral',
      description:
        'Pan 100% integral con semillas de girasol, linaza y sésamo. Rico en fibra y nutrientes.',
      pricePEN: 15.0,
      costPEN: 7.0,
      status: 'PUBLISHED' as const,
      weekendOnly: true,
      allergens: ['gluten', 'semillas'],
      tags: ['integral', 'saludable', 'semillas'],
      images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'],
      stock: 15,
      sku: 'PAN-INT-001',
      weight: 450,
      categoryId: categories[0].id,
      featured: false,
    },
    {
      slug: 'croissant-almendras',
      name: 'Croissant de Almendras',
      description:
        'Croissant relleno con crema de almendras y cubierto con almendras laminadas. Un clásico francés.',
      pricePEN: 12.0,
      costPEN: 5.5,
      status: 'PUBLISHED' as const,
      weekendOnly: true,
      allergens: ['gluten', 'lácteos', 'frutos secos'],
      tags: ['almendras', 'francés', 'premium'],
      images: ['https://images.unsplash.com/photo-1623334044303-241021148842?w=800'],
      stock: 20,
      sku: 'CRO-ALM-001',
      weight: 120,
      categoryId: categories[3].id,
      featured: false,
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });
  }
  console.log('✅ Products created:', products.length);

  // Create sample coupons
  const coupons = await Promise.all([
    prisma.coupon.upsert({
      where: { code: 'WELCOME10' },
      update: {},
      create: {
        code: 'WELCOME10',
        type: 'PERCENTAGE',
        value: 10.0,
        minSubtotalPEN: 30.0,
        maxDiscountPEN: 15.0,
        maxUses: 100,
        active: true,
      },
    }),
    prisma.coupon.upsert({
      where: { code: 'PRIMERACOMPRA' },
      update: {},
      create: {
        code: 'PRIMERACOMPRA',
        type: 'FIXED',
        value: 10.0,
        minSubtotalPEN: 50.0,
        maxUses: 50,
        active: true,
      },
    }),
  ]);
  console.log('✅ Coupons created:', coupons.length);

  console.log('🎉 Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
