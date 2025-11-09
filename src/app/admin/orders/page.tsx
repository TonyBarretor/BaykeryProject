import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function AdminOrdersPage() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
      zone: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-500',
      PAID: 'bg-green-500',
      PROCESSING: 'bg-blue-500',
      READY: 'bg-purple-500',
      DELIVERED: 'bg-gray-500',
      CANCELLED: 'bg-red-500',
      REFUNDED: 'bg-orange-500',
    };

    return (
      <span className={`rounded-full px-2 py-1 text-xs font-semibold text-white ${colors[status] || 'bg-gray-500'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold md:text-4xl">Pedidos</h1>
          <Link href="/admin">
            <Button variant="outline">Volver al Dashboard</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">#{order.orderNumber}</h3>
                      {getStatusBadge(order.status)}
                      {getStatusBadge(order.paymentStatus)}
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p><strong>Cliente:</strong> {order.name}</p>
                      <p><strong>Email:</strong> {order.email}</p>
                      <p><strong>Teléfono:</strong> {order.phone}</p>
                      <p><strong>Entrega:</strong> {formatDate(order.deliveryDate)} - {order.deliveryWindow === 'MORNING' ? 'Mañana' : 'Tarde'}</p>
                      <p><strong>Zona:</strong> {order.zone.name}</p>
                      <p><strong>Dirección:</strong> {order.address}, {order.district}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(parseFloat(order.totalPEN.toString()))}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button size="sm">Ver Detalles</Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {order.items.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <p className="mb-2 text-sm font-semibold">Productos:</p>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-sm text-muted-foreground">
                          {item.quantity}x {item.nameSnapshot} - {formatPrice(parseFloat(item.priceSnapshotPEN.toString()))}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {orders.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No hay pedidos registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
