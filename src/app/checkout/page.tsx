'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeekendDatePicker } from '@/components/weekend-date-picker';
import { useCart } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'Nombre requerido'),
  phone: z.string().min(9, 'Teléfono debe tener al menos 9 dígitos'),
  address: z.string().min(1, 'Dirección requerida'),
  district: z.string().min(1, 'Distrito requerido'),
  notes: z.string().optional(),
  deliveryDate: z.date(),
  deliveryWindow: z.enum(['MORNING', 'AFTERNOON']),
  zoneId: z.string().min(1, 'Zona de entrega requerida'),
  couponCode: z.string().optional(),
  tipPEN: z.coerce.number().min(0).default(0),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [zones, setZones] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState<Date>();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryWindow: 'MORNING',
      tipPEN: 0,
    },
  });

  const selectedZoneId = watch('zoneId');
  const selectedZone = zones.find((z) => z.id === selectedZoneId);
  const subtotal = getTotalPrice();
  const deliveryFee = selectedZone ? parseFloat(selectedZone.feePEN) : 0;
  const tip = watch('tipPEN') || 0;
  const total = subtotal + deliveryFee + tip;

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/productos');
      return;
    }

    // Fetch delivery zones
    fetch('/api/delivery-zones')
      .then((res) => res.json())
      .then((data) => {
        setZones(data);
        if (data.length > 0) {
          setValue('zoneId', data[0].id);
        }
      })
      .catch((error) => {
        console.error('Error fetching zones:', error);
        toast.error('Error al cargar zonas de entrega');
      });
  }, [items, router, setValue]);

  useEffect(() => {
    if (deliveryDate) {
      setValue('deliveryDate', deliveryDate);
    }
  }, [deliveryDate, setValue]);

  const onSubmit = async (data: CheckoutForm) => {
    if (!deliveryDate) {
      toast.error('Por favor selecciona una fecha de entrega');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          items: orderItems,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al procesar el pedido');
      }

      const order = await response.json();

      // Clear cart
      clearCart();

      // Redirect to order confirmation
      toast.success('¡Pedido creado exitosamente!');
      router.push(`/orden/${order.orderNumber}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al procesar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container">
        <h1 className="mb-8 font-serif text-3xl font-bold md:text-4xl">Finalizar Pedido</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Juan Pérez"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="987654321"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      {...register('address')}
                      placeholder="Av. Principal 123, Dpto 456"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-destructive">{errors.address.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="district">Distrito / Zona de Entrega</Label>
                    <select
                      id="district"
                      {...register('district')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onChange={(e) => {
                        const zone = zones.find((z) => z.name === e.target.value);
                        if (zone) {
                          setValue('zoneId', zone.id);
                          setValue('district', zone.name);
                        }
                      }}
                    >
                      <option value="">Selecciona un distrito</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.name}>
                          {zone.name} - {formatPrice(parseFloat(zone.feePEN))}
                        </option>
                      ))}
                    </select>
                    {errors.district && (
                      <p className="mt-1 text-sm text-destructive">{errors.district.message}</p>
                    )}
                  </div>

                  <WeekendDatePicker value={deliveryDate} onChange={setDeliveryDate} />

                  <div>
                    <Label>Horario de Entrega</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3">
                        <input
                          type="radio"
                          value="MORNING"
                          {...register('deliveryWindow')}
                          className="h-4 w-4"
                        />
                        <span>Mañana (9am - 1pm)</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3">
                        <input
                          type="radio"
                          value="AFTERNOON"
                          {...register('deliveryWindow')}
                          className="h-4 w-4"
                        />
                        <span>Tarde (2pm - 6pm)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                    <textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="Instrucciones especiales de entrega..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Propina (Opcional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 2, 5, 10].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={tip === amount ? 'default' : 'outline'}
                        onClick={() => setValue('tipPEN', amount)}
                      >
                        {amount === 0 ? 'Sin propina' : `S/ ${amount}`}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Envío</span>
                      <span>{formatPrice(deliveryFee)}</span>
                    </div>
                    {tip > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Propina</span>
                        <span>{formatPrice(tip)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || !deliveryDate}
                  >
                    {isSubmitting ? 'Procesando...' : 'Realizar Pedido'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Al realizar el pedido, serás redirigido a la página de pago
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
