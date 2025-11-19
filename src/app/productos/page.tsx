import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

async function getProducts(searchParams: { category?: string; search?: string }) {
  const where: any = {
    status: 'PUBLISHED',
  };

  if (searchParams.category) {
    where.category = { slug: searchParams.category };
  }

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: 'insensitive' } },
      { description: { contains: searchParams.search, mode: 'insensitive' } },
    ];
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    }),
  ]);

  return { products, categories };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const { products, categories } = await getProducts(searchParams);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Nuestros Productos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Productos artesanales horneados frescos cada fin de semana
          </p>
        </div>

        {/* Categories Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link href="/productos">
            <Button variant={!searchParams.category ? 'default' : 'outline'} size="sm">
              Todos
            </Button>
          </Link>
          {categories.map((category: any) => (
            <Link key={category.id} href={`/productos?category=${category.slug}`}>
              <Button
                variant={searchParams.category === category.slug ? 'default' : 'outline'}
                size="sm"
              >
                {category.name}
              </Button>
            </Link>
          ))}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron productos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product: any) => (
              <Link key={product.id} href={`/productos/${product.slug}`}>
                <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                  <CardHeader className="p-0">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          Sin imagen
                        </div>
                      )}
                      {product.featured && (
                        <div className="absolute left-2 top-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                          Destacado
                        </div>
                      )}
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="text-lg font-semibold text-white">Agotado</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {product.category && (
                      <p className="text-xs text-muted-foreground">{product.category.name}</p>
                    )}
                    <h3 className="mt-1 font-semibold text-foreground">{product.name}</h3>
                    <p className="mt-2 text-2xl font-bold text-primary">
                      {formatPrice(parseFloat(product.pricePEN.toString()))}
                    </p>
                    {product.allergens.length > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Contiene: {product.allergens.join(', ')}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full" disabled={product.stock <= 0}>
                      {product.stock <= 0 ? 'Agotado' : 'Ver Detalles'}
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
