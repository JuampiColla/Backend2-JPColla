import cartRepository from '../repositories/cartRepository.js';
import productService from './productService.js';

class CartService {
  /**
   * Obtener carrito del usuario
   */
  async getCart(userId) {
    try {
      let cart = await cartRepository.findByUserId(userId);
      
      if (!cart) {
        cart = await cartRepository.create(userId);
      }

      return {
        success: true,
        cart
      };
    } catch (error) {
      throw new Error(`Error al obtener carrito: ${error.message}`);
    }
  }

  /**
   * Agregar producto al carrito (solo usuarios)
   */
  async addProductToCart(userId, productId, quantity, price = null, name = null) {
    try {
      let productPrice = price;

      // Si no se proporciona precio, intentar obtenerlo de la BD (solo si es ObjectId válido)
      if (!productPrice) {
        try {
          const productResult = await productService.getProductById(productId);
          
          if (productResult.success && productResult.product) {
            productPrice = productResult.product.price;
          }
        } catch (error) {
          // Si falla la búsqueda, simplemente continuar sin precio de validación
          console.log(`Producto ${productId} no validado en BD, usando precio del cliente`);
        }
      }

      // Validar que tenemos un precio válido
      if (!productPrice || productPrice < 0) {
        productPrice = 0;
      }

      // Obtener o crear carrito
      let cart = await cartRepository.findByUserId(userId);
      
      if (!cart) {
        cart = await cartRepository.create(userId);
      }

      // Verificar si el producto ya está en el carrito
      const existingProduct = cart.products.find(
        p => p.productId.toString() === productId.toString()
      );

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({
          productId,
          quantity,
          price: productPrice,
          name: name || `Producto ${productId}`
        });
      }

      // Recalcular total
      cart.totalPrice = cart.products.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      const updatedCart = await cartRepository.update(cart._id, cart);

      return {
        success: true,
        message: 'Producto agregado al carrito',
        cart: updatedCart
      };
    } catch (error) {
      throw new Error(`Error al agregar producto al carrito: ${error.message}`);
    }
  }

  /**
   * Remover producto del carrito
   */
  async removeProductFromCart(userId, productId) {
    try {
      const cart = await cartRepository.findByUserId(userId);
      
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      cart.products = cart.products.filter(
        p => p.productId.toString() !== productId
      );

      // Recalcular total
      cart.totalPrice = cart.products.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      const updatedCart = await cartRepository.update(cart._id, cart);

      return {
        success: true,
        message: 'Producto removido del carrito',
        cart: updatedCart
      };
    } catch (error) {
      throw new Error(`Error al remover producto: ${error.message}`);
    }
  }

  /**
   * Actualizar cantidad de producto en carrito
   */
  async updateProductQuantity(userId, productId, newQuantity) {
    try {
      if (newQuantity <= 0) {
        return this.removeProductFromCart(userId, productId);
      }

      // Verificar stock
      const stockCheck = await productService.checkStock(productId, newQuantity);
      
      if (!stockCheck.available) {
        throw new Error(stockCheck.message);
      }

      const cart = await cartRepository.findByUserId(userId);
      
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      const product = cart.products.find(
        p => p.productId.toString() === productId
      );

      if (!product) {
        throw new Error('Producto no está en el carrito');
      }

      product.quantity = newQuantity;

      // Recalcular total
      cart.totalPrice = cart.products.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      const updatedCart = await cartRepository.update(cart._id, cart);

      return {
        success: true,
        message: 'Cantidad actualizada',
        cart: updatedCart
      };
    } catch (error) {
      throw new Error(`Error al actualizar cantidad: ${error.message}`);
    }
  }

  /**
   * Vaciar carrito
   */
  async clearCart(userId) {
    try {
      const cart = await cartRepository.findByUserId(userId);
      
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      cart.products = [];
      cart.totalPrice = 0;

      const updatedCart = await cartRepository.update(cart._id, cart);

      return {
        success: true,
        message: 'Carrito vaciado',
        cart: updatedCart
      };
    } catch (error) {
      throw new Error(`Error al vaciar carrito: ${error.message}`);
    }
  }
}

export default new CartService();
