import { z } from 'zod';
import { ProductStatus, OrderStatus, PaymentProvider, DeliveryWindow, CouponType } from '@prisma/client';

// Product validation
export const productSchema = z.object({
  slug: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  pricePEN: z.coerce.number().positive(),
  costPEN: z.coerce.number().positive().optional(),
  status: z.nativeEnum(ProductStatus),
  weekendOnly: z.boolean().default(true),
  allergens: z.array(z.string()),
  tags: z.array(z.string()),
  images: z.array(z.string().url()),
  stock: z.coerce.number().int().min(0),
  sku: z.string().optional(),
  weight: z.coerce.number().int().positive().optional(),
  nutrition: z.record(z.any()).optional(),
  categoryId: z.string().optional(),
  featured: z.boolean().default(false),
});

export const productCreateSchema = productSchema;
export const productUpdateSchema = productSchema.partial();

// Category validation
export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  image: z.string().url().optional(),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const categoryCreateSchema = categorySchema;
export const categoryUpdateSchema = categorySchema.partial();

// Delivery Zone validation
export const deliveryZoneSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  feePEN: z.coerce.number().min(0),
  active: z.boolean().default(true),
  order: z.coerce.number().int().min(0).default(0),
});

export const deliveryZoneCreateSchema = deliveryZoneSchema;
export const deliveryZoneUpdateSchema = deliveryZoneSchema.partial();

// Order validation
export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.coerce.number().int().positive(),
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().min(9),
  address: z.string().min(1),
  district: z.string().min(1),
  notes: z.string().optional(),
  deliveryDate: z.coerce.date(),
  deliveryWindow: z.nativeEnum(DeliveryWindow),
  zoneId: z.string(),
  items: z.array(orderItemSchema).min(1),
  couponCode: z.string().optional(),
  tipPEN: z.coerce.number().min(0).default(0),
}).refine((data) => {
  // Validate delivery date is a weekend
  const day = data.deliveryDate.getDay();
  return day === 0 || day === 6;
}, {
  message: 'La fecha de entrega debe ser sábado o domingo',
  path: ['deliveryDate'],
}).refine((data) => {
  // Validate delivery date is in the future
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return data.deliveryDate >= tomorrow;
}, {
  message: 'La fecha de entrega debe ser futura',
  path: ['deliveryDate'],
});

// Coupon validation
export const couponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  type: z.nativeEnum(CouponType),
  value: z.coerce.number().positive(),
  minSubtotalPEN: z.coerce.number().min(0).optional(),
  maxDiscountPEN: z.coerce.number().min(0).optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  maxUses: z.coerce.number().int().positive().optional(),
  active: z.boolean().default(true),
});

export const couponCreateSchema = couponSchema;
export const couponUpdateSchema = couponSchema.partial();
