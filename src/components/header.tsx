'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { CartDrawer } from '@/components/cart-drawer';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="font-serif text-2xl font-bold text-foreground">Baykery</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Inicio
          </Link>
          <Link
            href="/productos"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Productos
          </Link>
          <Link
            href="/nosotros"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Nosotros
          </Link>
          <Link
            href="/contacto"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Contacto
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              Admin
            </Button>
          </Link>
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}
