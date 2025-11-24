import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, MapPin, Clock, Mail, Phone } from 'lucide-react';

export default async function OrderConfirmationPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      zone: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="font-serif text-3xl font-bold md:text-4xl">¡Pedido Confirmado!</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Gracias por tu compra. Hemos recibido tu pedido.
          </p>
        </div>

        {/* Order Number */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Número de Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold text-primary">
              #{order.orderNumber}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Guarda este número para rastrear tu pedido
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Nombre:</span> {order.name}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {order.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="font-semibold">Teléfono:</span> {order.phone}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Información de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Dirección:</span>
                <p className="mt-1">{order.address}</p>
                <p>{order.district}</p>
                <p className="text-muted-foreground">{order.zone.name}</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Clock className="h-4 w-4" />
                <div>
                  <span className="font-semibold">Fecha:</span>{' '}
                  {formatDate(order.deliveryDate)}
                  <p className="text-muted-foreground">
                    {order.deliveryWindow === 'MORNING' ? '9:00 AM - 1:00 PM' : '2:00 PM - 6:00 PM'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <p className="font-semibold">{item.nameSnapshot}</p>
                    <p className="text-sm text-muted-foreground">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(parseFloat(item.priceSnapshotPEN.toString()) * item.quantity)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(parseFloat(item.priceSnapshotPEN.toString()))} c/u
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(parseFloat(order.subtotalPEN.toString()))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span>{formatPrice(parseFloat(order.deliveryFeePEN.toString()))}</span>
              </div>
              {order.discountPEN && parseFloat(order.discountPEN.toString()) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento</span>
                  <span>-{formatPrice(parseFloat(order.discountPEN.toString()))}</span>
                </div>
              )}
              {order.tipPEN && parseFloat(order.tipPEN.toString()) > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Propina</span>
                  <span>{formatPrice(parseFloat(order.tipPEN.toString()))}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {formatPrice(parseFloat(order.totalPEN.toString()))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Notas Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mt-6 bg-muted/50">
          <CardHeader>
            <CardTitle>¿Qué sigue?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </div>
              <p>
                Recibirás un email de confirmación en <strong>{order.email}</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </div>
              <p>
                Preparamos tu pedido con amor el día de la entrega
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </div>
              <p>
                Lo entregamos en tu domicilio el {formatDate(order.deliveryDate)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/productos">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Seguir Comprando
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              Volver al Inicio
            </Button>
          </Link>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>¿Tienes alguna pregunta sobre tu pedido?</p>
          <p className="mt-1">
            Contáctanos en{' '}
            <a href="mailto:pedidos@baykery.pe" className="font-semibold text-foreground hover:underline">
              pedidos@baykery.pe
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
