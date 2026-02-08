import ticketRepository from '../repositories/ticketRepository.js';
import cartRepository from '../repositories/cartRepository.js';
import productService from './productService.js';
import emailService from './emailService.js';
import userRepository from '../repositories/userRepository.js';

class PurchaseService {
  /**
   * Procesar una compra
   */
  async processPurchase(userId) {
    try {
      // Obtener carrito del usuario
      const cart = await cartRepository.findByUserId(userId);
      
      if (!cart || cart.products.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // Obtener usuario
      const user = await userRepository.findById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Validar stock disponible para todos los productos antes de procesar
      // Intentar obtener detalles de productos reales en la BD, pero no es obligatorio
      const productsToUpdateStock = [];
      for (const item of cart.products) {
        try {
          // Intentar buscar el producto en la BD
          const product = await productService.getProductById(item.productId);
          
          if (product && product.product) {
            const availableStock = product.product.stock;
            if (availableStock < item.quantity) {
              throw new Error(`Stock insuficiente para ${product.product.title}. Disponible: ${availableStock}, Solicitado: ${item.quantity}`);
            }

            productsToUpdateStock.push({
              productId: item.productId,
              quantity: item.quantity,
              product: product.product
            });
          }
        } catch (productError) {
          // Si es error de stock insuficiente, DETENER la compra
          if (productError.message.includes('Stock insuficiente')) {
            throw productError;
          }
          // Si el producto no está en la BD (ej: ID simple como "1", "2", "3"), 
          // simplemente continuamos sin actualizar stock
          console.log(`[STOCK] Producto ${item.productId} no encontrado en BD, continuando sin validación de stock`);
        }
      }

      // Generar código de ticket único
      const code = this.generateTicketCode();

      // Crear constancia de los productos comprados
      const purchasedProducts = cart.products.map(item => ({
        productId: item.productId,
        name: item.name || `Producto ${item.productId}`,
        quantity: item.quantity,
        price: item.price || 0
      }));

      // Crear ticket
      const ticket = await ticketRepository.create({
        code,
        purchaseDate: new Date(),
        amount: cart.totalPrice,
        purchaser: userId,
        products: purchasedProducts,
        status: 'completed'
      });

      // Actualizar stock de los productos encontrados en BD
      for (const item of productsToUpdateStock) {
        try {
          const newStock = item.product.stock - item.quantity;
          await productService.updateProduct(item.productId, { stock: newStock }, userId);
          console.log(`[STOCK] Producto ${item.product.title}: ${item.product.stock} -> ${newStock}`);
        } catch (updateError) {
          console.log(`[STOCK] Error actualizando stock del producto ${item.productId}:`, updateError.message);
        }
      }

      // Enviar email con confirmación
      try {
        await emailService.sendPurchaseConfirmationEmail(
          user.email,
          user.first_name,
          ticket,
          purchasedProducts
        );
      } catch (emailError) {
        console.log('Advertencia: No se pudo enviar email:', emailError.message);
        // Continuar aunque faille el email
      }

      // Vaciar carrito
      cart.products = [];
      cart.totalPrice = 0;
      await cartRepository.update(cart._id, cart);

      return {
        success: true,
        message: 'Compra realizada exitosamente',
        ticket: {
          code: ticket.code,
          purchaseDate: ticket.purchaseDate,
          amount: ticket.amount,
          status: ticket.status,
          products: purchasedProducts
        }
      };
    } catch (error) {
      throw new Error(`Error al procesar compra: ${error.message}`);
    }
  }

  /**
   * Obtener todos los tickets del usuario
   */
  async getUserTickets(userId) {
    try {
      const tickets = await ticketRepository.findByUserId(userId);
      
      return {
        success: true,
        total: tickets.length,
        tickets
      };
    } catch (error) {
      throw new Error(`Error al obtener tickets: ${error.message}`);
    }
  }

  /**
   * Obtener ticket por código
   */
  async getTicketByCode(code) {
    try {
      const ticket = await ticketRepository.findByCode(code);
      
      if (!ticket) {
        throw new Error('Ticket no encontrado');
      }

      return {
        success: true,
        ticket
      };
    } catch (error) {
      throw new Error(`Error al obtener ticket: ${error.message}`);
    }
  }

  /**
   * Obtener todos los tickets (solo admin)
   */
  async getAllTickets() {
    try {
      const tickets = await ticketRepository.findAll();
      
      return {
        success: true,
        total: tickets.length,
        tickets
      };
    } catch (error) {
      throw new Error(`Error al obtener tickets: ${error.message}`);
    }
  }

  /**
   * Generar código único para ticket
   */
  generateTicketCode() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TICKET-${timestamp}-${randomStr}`;
  }

  /**
   * Obtener estadísticas de compras
   */
  async getPurchaseStatistics() {
    try {
      const tickets = await ticketRepository.findAll();
      
      const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.amount, 0);
      const totalPurchases = tickets.length;
      const averageOrder = totalRevenue / totalPurchases || 0;

      return {
        success: true,
        statistics: {
          totalRevenue,
          totalPurchases,
          averageOrder,
          lastUpdate: new Date()
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
}

export default new PurchaseService();