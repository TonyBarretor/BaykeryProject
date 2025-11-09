import { notFound } from 'next/navigation';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, status: 'PUBLISHED' },
    include: {
      category: true,
    },
  });

  if (!product) {
    return null;
  }

  return product;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-foreground">
            Productos
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/productos?category=${product.category.slug}`}
                className="hover:text-foreground"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Sin imagen
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-md bg-muted"
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 10vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.category && (
              <p className="text-sm text-muted-foreground">{product.category.name}</p>
            )}

            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {product.name}
              </h1>
              {product.featured && (
                <span className="mt-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  Producto Destacado
                </span>
              )}
            </div>

            <div className="text-3xl font-bold text-primary">
              {formatPrice(parseFloat(product.pricePEN.toString()))}
            </div>

            {product.description && (
              <div className="prose prose-stone max-w-none">
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {/* Stock Info */}
            <div className="rounded-lg border p-4">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">
                    {product.stock > 10
                      ? 'Disponible'
                      : `Solo ${product.stock} unidades disponibles`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">Agotado</span>
                </div>
              )}
            </div>

            {/* Allergens */}
            {product.allergens.length > 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <h3 className="font-semibold text-yellow-900">Alérgenos</h3>
                <p className="mt-1 text-sm text-yellow-800">
                  Contiene: {product.allergens.join(', ')}
                </p>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Add to Cart */}
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: parseFloat(product.pricePEN.toString()),
                image: product.images[0],
                stock: product.stock,
              }}
              disabled={product.stock <= 0}
            />

            {/* Weekend Only Notice */}
            {product.weekendOnly && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  📅 Este producto está disponible solo para entrega los fines de semana
                </p>
              </div>
            )}

            {/* Additional Info */}
            {product.weight && (
              <div className="text-sm text-muted-foreground">
                <strong>Peso:</strong> {product.weight}g
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
