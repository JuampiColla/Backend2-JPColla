import Cart from '../../models/cart.model.js';

class CartDAO {
  /**
   * Crear un nuevo carrito
   */
  async createCart(userId) {
    try {
      const cart = await Cart.create({
        userId,
        products: [],
        totalPrice: 0
      });
      return cart;
    } catch (error) {
      throw new Error(`Error al crear carrito: ${error.message}`);
    }
  }

  /**
   * Encontrar carrito por ID del usuario
   */
  async findByUserId(userId) {
    try {
      const cart = await Cart.findOne({ userId });
      return cart;
    } catch (error) {
      throw new Error(`Error al buscar carrito: ${error.message}`);
    }
  }

  /**
   * Encontrar carrito por ID del carrito
   */
  async findById(cartId) {
    try {
      const cart = await Cart.findById(cartId);
      return cart;
    } catch (error) {
      throw new Error(`Error al buscar carrito: ${error.message}`);
    }
  }

  /**
   * Actualizar todo el carrito
   */
  async updateCart(cartId, cartData) {
    try {
      const cart = await Cart.findByIdAndUpdate(cartId, cartData, { new: true });
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }
      return cart;
    } catch (error) {
      throw new Error(`Error al actualizar carrito: ${error.message}`);
    }
  }
}

export default new CartDAO();
