import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkoutSchema } from '@/lib/validations';
import { generateOrderNumber, isWeekend } from '@/lib/utils';

// POST /api/checkout - Create order draft and validate cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = checkoutSchema.parse(body);

    // Additional weekend validation (server-side)
    if (!isWeekend(validatedData.deliveryDate)) {
      return NextResponse.json(
        { error: 'La fecha de entrega debe ser sábado o domingo' },
        { status: 422 }
      );
    }

    // Check if delivery date is not in the past
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (validatedData.deliveryDate < tomorrow) {
      return NextResponse.json(
        { error: 'La fecha de entrega debe ser futura' },
        { status: 422 }
      );
    }

    // Check capacity for the selected delivery window
    const maxOrdersPerWindow = parseInt(
      process.env.NEXT_PUBLIC_MAX_ORDERS_PER_WINDOW || '50'
    );

    const existingOrders = await prisma.order.count({
      where: {
        deliveryDate: validatedData.deliveryDate,
        deliveryWindow: validatedData.deliveryWindow,
        status: {
          notIn: ['CANCELLED', 'REFUNDED'],
        },
      },
    });

    if (existingOrders >= maxOrdersPerWindow) {
      return NextResponse.json(
        { error: 'No hay cupos disponibles para esta fecha y horario' },
        { status: 422 }
      );
    }

    // Fetch products and validate availability
    const productIds = validatedData.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'PUBLISHED',
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Algunos productos no están disponibles' },
        { status: 400 }
      );
    }

    // Check stock availability
    for (const item of validatedData.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Producto ${item.productId} no encontrado` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    let subtotalPEN = 0;
    const orderItems = validatedData.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemTotal = parseFloat(product.pricePEN.toString()) * item.quantity;
      subtotalPEN += itemTotal;

      return {
        productId: product.id,
        nameSnapshot: product.name,
        priceSnapshotPEN: product.pricePEN,
        quantity: item.quantity,
      };
    });

    // Fetch delivery zone
    const zone = await prisma.deliveryZone.findUnique({
      where: { id: validatedData.zoneId, active: true },
    });

    if (!zone) {
      return NextResponse.json(
        { error: 'Zona de entrega no válida' },
        { status: 400 }
      );
    }

    const deliveryFeePEN = parseFloat(zone.feePEN.toString());

    // Apply coupon if provided
    let discountPEN = 0;
    if (validatedData.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: validatedData.couponCode.toUpperCase(), active: true },
      });

      if (coupon) {
        // Check if coupon is valid
        const now = new Date();
        if (
          (!coupon.startsAt || coupon.startsAt <= now) &&
          (!coupon.endsAt || coupon.endsAt >= now) &&
          (!coupon.maxUses || coupon.uses < coupon.maxUses) &&
          (!coupon.minSubtotalPEN || subtotalPEN >= parseFloat(coupon.minSubtotalPEN.toString()))
        ) {
          if (coupon.type === 'PERCENTAGE') {
            discountPEN = (subtotalPEN * parseFloat(coupon.value.toString())) / 100;
          } else {
            discountPEN = parseFloat(coupon.value.toString());
          }

          // Apply max discount if set
          if (coupon.maxDiscountPEN) {
            discountPEN = Math.min(discountPEN, parseFloat(coupon.maxDiscountPEN.toString()));
          }

          // Don't let discount exceed subtotal
          discountPEN = Math.min(discountPEN, subtotalPEN);
        }
      }
    }

    const totalPEN = subtotalPEN + deliveryFeePEN - discountPEN + validatedData.tipPEN;

    // Create order (start transaction)
    const order = await prisma.$transaction(async (tx) => {
      // Decrement product stock
      for (const item of validatedData.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Increment coupon usage if applicable
      if (validatedData.couponCode && discountPEN > 0) {
        await tx.coupon.update({
          where: { code: validatedData.couponCode.toUpperCase() },
          data: {
            uses: {
              increment: 1,
            },
          },
        });
      }

      // Create order
      return tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          email: validatedData.email,
          name: validatedData.name,
          phone: validatedData.phone,
          address: validatedData.address,
          district: validatedData.district,
          notes: validatedData.notes,
          subtotalPEN,
          deliveryFeePEN,
          discountPEN,
          tipPEN: validatedData.tipPEN,
          totalPEN,
          paymentProvider: 'CULQI', // Default provider
          deliveryDate: validatedData.deliveryDate,
          deliveryWindow: validatedData.deliveryWindow,
          zoneId: validatedData.zoneId,
          couponCode: validatedData.couponCode,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          zone: true,
        },
      });
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Datos inválidos', details: error }, { status: 400 });
    }

    return NextResponse.json({ error: 'Error al procesar el pedido' }, { status: 500 });
  }
}
