import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag, FolderOpen, Users } from 'lucide-react';

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch statistics
  const [productCount, orderCount, categoryCount, pendingOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.category.count(),
    prisma.order.count({
      where: {
        status: {
          in: ['PENDING', 'PAID'],
        },
      },
    }),
  ]);

  const stats = [
    {
      title: 'Productos',
      value: productCount,
      icon: Package,
      href: '/admin/products',
    },
    {
      title: 'Pedidos',
      value: orderCount,
      icon: ShoppingBag,
      href: '/admin/orders',
    },
    {
      title: 'Categorías',
      value: categoryCount,
      icon: FolderOpen,
      href: '/admin/categories',
    },
    {
      title: 'Pedidos Pendientes',
      value: pendingOrders,
      icon: Users,
      href: '/admin/orders?status=pending',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold md:text-4xl">Panel de Administración</h1>
            <p className="mt-2 text-muted-foreground">Bienvenido, {session.user.name || session.user.email}</p>
          </div>
          <Link href="/">
            <Button variant="outline">Ver Sitio</Button>
          </Link>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="transition-shadow hover:shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/products">
                <Button variant="outline" className="w-full justify-start">
                  Ver todos los productos
                </Button>
              </Link>
              <Link href="/admin/products/new">
                <Button className="w-full justify-start">
                  Crear nuevo producto
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pedidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/orders">
                <Button variant="outline" className="w-full justify-start">
                  Ver todos los pedidos
                </Button>
              </Link>
              <Link href="/admin/orders?status=pending">
                <Button className="w-full justify-start">
                  Pedidos pendientes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categorías</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/categories">
                <Button variant="outline" className="w-full justify-start">
                  Ver todas las categorías
                </Button>
              </Link>
              <Link href="/admin/categories/new">
                <Button className="w-full justify-start">
                  Crear nueva categoría
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
