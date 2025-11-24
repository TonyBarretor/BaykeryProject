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
  tipPEN: z.number().min(0),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [zones, setZones] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

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
    console.log('Form submitted with data:', data);

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

      console.log('Sending checkout request...');

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

      console.log('Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('API error:', error);
        throw new Error(error.error || 'Error al procesar el pedido');
      }

      const order = await response.json();
      console.log('Order created:', order);

      if (!order.orderNumber) {
        console.error('Order missing orderNumber:', order);
        throw new Error('Orden creada pero falta el número de pedido');
      }

      // Clear cart
      clearCart();

      // Show success message
      toast.success('¡Pedido creado exitosamente!');

      // Redirect to order confirmation
      console.log('Redirecting to:', `/orden/${order.orderNumber}`);
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

        <form
          onSubmit={(e) => {
            console.log('Form submit event triggered');
            console.log('Delivery date:', deliveryDate);
            console.log('Form errors:', errors);
            handleSubmit(onSubmit)(e);
          }}
          noValidate
        >
          {/* Form Errors Display */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-50 p-4">
              <h3 className="font-semibold text-red-700 mb-2">Por favor corrige los siguientes errores:</h3>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {error?.message as string}
                  </li>
                ))}
              </ul>
            </div>
          )}

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

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Método de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:bg-muted/50 ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod('cash')}
                        className="mt-1 h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className="font-semibold">Pago Contra Entrega</div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Paga en efectivo o con tarjeta cuando recibas tu pedido
                        </p>
                      </div>
                    </label>

                    <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:bg-muted/50 ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod('card')}
                        className="mt-1 h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className="font-semibold">Tarjeta de Crédito/Débito</div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Paga con Visa, Mastercard, Yape
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Credit Card Form */}
                  {paymentMethod === 'card' && (
                    <div className="mt-4 space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <h3 className="font-semibold text-sm">Información de la Tarjeta</h3>

                      <div>
                        <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                        <Input
                          id="cardNumber"
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
                        <Input
                          id="cardName"
                          type="text"
                          placeholder="JUAN PEREZ"
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cardExpiry">Fecha de Vencimiento</Label>
                          <Input
                            id="cardExpiry"
                            type="text"
                            placeholder="MM/AA"
                            maxLength={5}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardCvv">CVV</Label>
                          <Input
                            id="cardCvv"
                            type="text"
                            placeholder="123"
                            maxLength={4}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="rounded bg-blue-50 p-3 text-xs text-blue-700">
                        🔒 Tu información está segura y encriptada
                      </div>
                    </div>
                  )}

                  <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                    💡 <strong>Nota:</strong> Tu pedido se confirmará una vez que nuestro equipo lo revise. Te contactaremos para confirmar la entrega.
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
