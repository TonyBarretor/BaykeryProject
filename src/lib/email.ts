import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderTotal: string;
  deliveryDate: string;
  deliveryWindow: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  // Only send if RESEND_API_KEY is configured
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping email');
    return { success: false, reason: 'not_configured' };
  }

  try {
    const itemsList = data.items
      .map((item) => `- ${item.quantity}x ${item.name} (${item.price})`)
      .join('\n');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8B4513; color: white; padding: 20px; text-center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-number { font-size: 24px; font-weight: bold; color: #8B4513; margin: 20px 0; }
            .section { margin: 20px 0; }
            .section-title { font-weight: bold; color: #8B4513; margin-bottom: 10px; }
            .items { background-color: white; padding: 15px; border-radius: 4px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🥐 Baykery</h1>
              <p style="margin: 10px 0 0 0;">Panadería Artesanal</p>
            </div>

            <div class="content">
              <h2>¡Gracias por tu pedido, ${data.customerName}!</h2>
              <p>Hemos recibido tu pedido y lo estamos preparando con amor.</p>

              <div class="order-number">
                Pedido #${data.orderNumber}
              </div>

              <div class="section">
                <div class="section-title">📦 Productos:</div>
                <div class="items">
                  <pre style="margin: 0; font-family: inherit;">${itemsList}</pre>
                </div>
              </div>

              <div class="section">
                <div class="section-title">🚚 Información de Entrega:</div>
                <p>
                  <strong>Fecha:</strong> ${data.deliveryDate}<br>
                  <strong>Horario:</strong> ${data.deliveryWindow === 'MORNING' ? 'Mañana (9am - 1pm)' : 'Tarde (2pm - 6pm)'}<br>
                  <strong>Total:</strong> ${data.orderTotal}
                </p>
              </div>

              <div class="section">
                <div class="section-title">✨ ¿Qué sigue?</div>
                <ol>
                  <li>Preparamos tu pedido fresco el día de la entrega</li>
                  <li>Lo horneamos con amor siguiendo nuestras recetas tradicionales</li>
                  <li>Lo entregamos en tu domicilio en el horario seleccionado</li>
                </ol>
              </div>

              <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin-top: 20px;">
                <strong>💡 Nota importante:</strong> Nuestro equipo revisará tu pedido y te contactará para confirmar todos los detalles de la entrega.
              </div>
            </div>

            <div class="footer">
              <p>¿Tienes alguna pregunta?</p>
              <p>Contáctanos en <a href="mailto:pedidos@baykery.pe">pedidos@baykery.pe</a></p>
              <p style="margin-top: 20px; font-size: 12px; color: #999;">
                Baykery - Panadería Artesanal en Lima, Perú
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Baykery <pedidos@baykery.pe>',
      to: data.customerEmail,
      subject: `Confirmación de Pedido #${data.orderNumber} - Baykery`,
      html: emailHtml,
    });

    console.log('Order confirmation email sent:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error };
  }
}

/**
 * Send order status update email to customer
 */
export async function sendOrderStatusEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  status: string,
  message: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping email');
    return { success: false, reason: 'not_configured' };
  }

  try {
    const statusEmoji = {
      PAID: '✅',
      PROCESSING: '👨‍🍳',
      READY: '📦',
      DELIVERED: '🎉',
      CANCELLED: '❌',
    }[status] || '📝';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8B4513; color: white; padding: 20px; text-center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .status { font-size: 24px; margin: 20px 0; text-align: center; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🥐 Baykery</h1>
            </div>

            <div class="content">
              <h2>Hola ${customerName},</h2>
              <p>Tu pedido #${orderNumber} ha sido actualizado.</p>

              <div class="status">
                ${statusEmoji} <strong>${message}</strong>
              </div>

              <p>Puedes seguir el estado de tu pedido contactándonos en cualquier momento.</p>
            </div>

            <div class="footer">
              <p>Contáctanos en <a href="mailto:pedidos@baykery.pe">pedidos@baykery.pe</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Baykery <pedidos@baykery.pe>',
      to: customerEmail,
      subject: `Actualización de Pedido #${orderNumber} - Baykery`,
      html: emailHtml,
    });

    console.log('Status update email sent:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send status update email:', error);
    return { success: false, error };
  }
}
