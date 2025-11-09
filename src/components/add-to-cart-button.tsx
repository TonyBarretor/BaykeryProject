'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, type CartItem } from '@/lib/cart-store';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  product: CartItem;
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({ ...product, quantity });
    toast.success(`${product.name} agregado al carrito`, {
      description: `Cantidad: ${quantity}`,
    });
    setQuantity(1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(product.stock, prev + 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg border">
          <Button
            variant="ghost"
            size="icon"
            onClick={decrementQuantity}
            disabled={quantity <= 1 || disabled}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-semibold">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={incrementQuantity}
            disabled={quantity >= product.stock || disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={disabled}
          size="lg"
          className="flex-1"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Agregar al Carrito
        </Button>
      </div>
    </div>
  );
}
