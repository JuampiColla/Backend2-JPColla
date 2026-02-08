import nodemailer from 'nodemailer';
import config from '../config/config.js';

class EmailService {
  constructor() {
    // Usar Mailtrap para desarrollo/testing
    this.transporter = nodemailer.createTransport({
      host: config.email.smtpHost,
      port: config.email.smtpPort,
      auth: {
        user: config.email.smtpUser,
        pass: config.email.smtpPass
      }
    });
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async sendPasswordResetEmail(userEmail, firstName, resetToken) {
    try {
      const resetLink = `${config.app.frontendUrl}/users/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: config.email.smtpFrom,
        to: userEmail,
        subject: '🔐 Recuperación de Contraseña - Tu Ecommerce',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; text-align: center;">Recuperación de Contraseña</h2>
              
              <p style="color: #666; font-size: 16px;">
                Hola <strong>${firstName}</strong>,
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Recibimos una solicitud para restablecer tu contraseña. 
                Haz clic en el botón de abajo para crear una nueva contraseña.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #4caf50; color: white; padding: 12px 30px; 
                   text-decoration: none; border-radius: 5px; font-weight: bold; 
                   display: inline-block;">
                  Restablecer Contraseña
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px;">
                <strong>⚠️ Este enlace expirará en 1 hora.</strong>
              </p>
              
              <p style="color: #666; font-size: 14px; line-height: 1.5;">
                Si no solicitaste este cambio, ignora este correo. 
                Tu contraseña permanecerá sin cambios.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Tu Ecommerce. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      throw new Error(`Error al enviar email: ${error.message}`);
    }
  }

  /**
   * Enviar email de confirmación de cambio de contraseña
   */
  async sendPasswordChangedEmail(userEmail, firstName) {
    try {
      const mailOptions = {
        from: config.email.smtpFrom,
        to: userEmail,
        subject: '✅ Contraseña Actualizada - Tu Ecommerce',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4caf50; text-align: center;">✅ Contraseña Actualizada</h2>
              
              <p style="color: #666; font-size: 16px;">
                Hola <strong>${firstName}</strong>,
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Tu contraseña ha sido actualizada exitosamente.
              </p>
              
              <p style="color: #666; font-size: 14px; line-height: 1.5;">
                Si no realizaste este cambio, 
                <a href="${config.app.frontendUrl}/contact-support" style="color: #4caf50;">contacta al soporte</a> 
                inmediatamente.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Tu Ecommerce. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      throw new Error(`Error al enviar email: ${error.message}`);
    }
  }

  /**
   * Enviar email de confirmación de compra
   */
  async sendPurchaseConfirmationEmail(userEmail, firstName, ticket, products) {
    try {
      const productsHTML = products.map(product => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.productId}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">$${product.price}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">$${product.price * product.quantity}</td>
        </tr>
      `).join('');

      const mailOptions = {
        from: config.email.smtpFrom,
        to: userEmail,
        subject: '✓ Compra Realizada - Tu Ecommerce',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; max-width: 800px; margin: 0 auto;">
              <h2 style="color: #4caf50; text-align: center;">✓ ¡Compra Realizada Exitosamente!</h2>
              
              <p style="color: #666; font-size: 16px;">
                Hola <strong>${firstName}</strong>,
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Gracias por tu compra. Aquí está el detalle de tu pedido:
              </p>
              
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Número de Ticket:</strong> ${ticket.code}</p>
                <p><strong>Fecha de Compra:</strong> ${new Date(ticket.purchaseDate).toLocaleDateString()}</p>
                <p><strong>Monto Total:</strong> $${ticket.amount}</p>
                <p><strong>Estado:</strong> ${ticket.status}</p>
              </div>
              
              <h3 style="color: #333; margin-top: 30px;">Productos Comprados:</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #f0f0f0;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Producto</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Cantidad</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Precio</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Subtotal</th>
                </tr>
                ${productsHTML}
                <tr style="background-color: #f9f9f9; font-weight: bold;">
                  <td colspan="3" style="padding: 10px; text-align: right; border-top: 2px solid #ddd;">Total:</td>
                  <td style="padding: 10px; border-top: 2px solid #ddd;">$${ticket.amount}</td>
                </tr>
              </table>
              
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin-top: 20px;">
                Tu pedido ha sido registrado y será procesado pronto. 
                Recibirás actualizaciones sobre el estado de tu envío.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Tu Ecommerce. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      throw new Error(`Error al enviar email de compra: ${error.message}`);
    }
  }

  /**
   * Enviar email de notificación de envío
   */
  async sendShippingNotificationEmail(userEmail, firstName, ticketCode, trackingNumber) {
    try {
      const mailOptions = {
        from: config.email.smtpFrom,
        to: userEmail,
        subject: '📦 Tu Pedido ha sido Enviado - Tu Ecommerce',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2196F3; text-align: center;">📦 ¡Tu Pedido ha sido Enviado!</h2>
              
              <p style="color: #666; font-size: 16px;">
                Hola <strong>${firstName}</strong>,
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Tu pedido ha sido despachado y está en camino hacia ti.
              </p>
              
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Número de Ticket:</strong> ${ticketCode}</p>
                <p><strong>Número de Seguimiento:</strong> ${trackingNumber}</p>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.5;">
                Puedes rastrear tu pedido usando el número de seguimiento anterior.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Tu Ecommerce. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      throw new Error(`Error al enviar email de envío: ${error.message}`);
    }
  }
}

export default new EmailService();