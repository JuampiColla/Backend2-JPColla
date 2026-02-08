import cartDAO from '../daos/cartDAO.js';
import userDAO from '../daos/userDAO.js';

// Simulación de productos en memoria (en producción sería desde una BD)
const PRODUCTS = [
  { id: '1', name: 'Notebook', price: 1200 },
  { id: '2', name: 'Mouse', price: 25 },
  { id: '3', name: 'Teclado', price: 80 },
  { id: '4', name: 'Monitor 24"', price: 300 },
  { id: '5', name: 'Headset', price: 120 }
];

class CartService {
  /**
   * Obtener o crear carrito del usuario
   */
  async getOrCreateCart(userId) {
    try {
      let cart = await cartDAO.findByUserId(userId);

      if (!cart) {
        cart = await cartDAO.createCart(userId);
        // Actualizar usuario con referencia al carrito
        await userDAO.updateUser(userId, { cart: cart._id });
      }

      return cart;
    } catch (error) {
      throw new Error(`Error al obtener/crear carrito: ${error.message}`);
    }
  }

  /**
   * Agregar producto al carrito
   */
  async addProductToCart(userId, productId, quantity = 1) {
    try {
      const cart = await this.getOrCreateCart(userId);

      // Validar que el producto existe
      const product = PRODUCTS.find(p => p.id === productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Agregar al carrito
      const updatedCart = await cartDAO.addProduct(cart._id, productId, quantity);

      // Recalcular total
      const total = this.calculateCartTotal(updatedCart);

      return {
        cart: updatedCart,
        total
      };
    } catch (error) {
      throw new Error(`Error al agregar producto: ${error.message}`);
    }
  }

  /**
   * Eliminar producto del carrito
   */
  async removeProductFromCart(userId, productId) {
    try {
      const cart = await cartDAO.findByUserId(userId);

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      const updatedCart = await cartDAO.removeProduct(cart._id, productId);

      // Recalcular total
      const total = this.calculateCartTotal(updatedCart);

      return {
        cart: updatedCart,
        total
      };
    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

  /**
   * Actualizar cantidad de producto
   */
  async updateProductQuantity(userId, productId, quantity) {
    try {
      const cart = await cartDAO.findByUserId(userId);

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      const updatedCart = await cartDAO.updateProductQuantity(
        cart._id,
        productId,
        quantity
      );

      // Recalcular total
      const total = this.calculateCartTotal(updatedCart);

      return {
        cart: updatedCart,
        total
      };
    } catch (error) {
      throw new Error(`Error al actualizar cantidad: ${error.message}`);
    }
  }

  /**
   * Obtener carrito del usuario
   */
  async getCart(userId) {
    try {
      const cart = await cartDAO.findByUserId(userId);

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      // Enriquecer con información de productos
      const enrichedCart = this.enrichCartWithProducts(cart);

      return enrichedCart;
    } catch (error) {
      throw new Error(`Error al obtener carrito: ${error.message}`);
    }
  }

  /**
   * Enriquecer carrito con información de productos
   */
  enrichCartWithProducts(cart) {
    const enrichedProducts = cart.products.map(item => {
      const product = PRODUCTS.find(p => p.id === item.product);
      return {
        product: item.product,
        quantity: item.quantity,
        name: product?.name || 'Producto desconocido',
        price: product?.price || 0,
        subtotal: (product?.price || 0) * item.quantity
      };
    });

    const total = enrichedProducts.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      ...cart.toObject(),
      products: enrichedProducts,
      total
    };
  }

  /**
   * Calcular total del carrito
   */
  calculateCartTotal(cart) {
    return cart.products.reduce((total, item) => {
      const product = PRODUCTS.find(p => p.id === item.product);
      return total + ((product?.price || 0) * item.quantity);
    }, 0);
  }

  /**
   * Vaciar carrito
   */
  async clearCart(userId) {
    try {
      const cart = await cartDAO.findByUserId(userId);

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      return await cartDAO.clearCart(cart._id);
    } catch (error) {
      throw new Error(`Error al vaciar carrito: ${error.message}`);
    }
  }

  /**
   * Obtener lista de productos disponibles
   */
  getAvailableProducts() {
    return PRODUCTS;
  }
}

export default new CartService();
