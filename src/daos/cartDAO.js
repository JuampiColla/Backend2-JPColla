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
   * Agregar producto al carrito
   */
  async addProduct(cartId, productId, quantity = 1, price = 0) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      // Verificar si el producto ya está en el carrito
      const existingProduct = cart.products.find(
        p => p.productId === productId
      );

      if (existingProduct) {
        // Incrementar cantidad
        existingProduct.quantity += quantity;
      } else {
        // Agregar nuevo producto
        cart.products.push({
          productId,
          quantity,
          price
        });
      }

      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(`Error al agregar producto: ${error.message}`);
    }
  }

  /**
   * Eliminar producto del carrito
   */
  async removeProduct(cartId, productId) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      // Filtrar el producto
      cart.products = cart.products.filter(
        p => p.productId !== productId
      );

      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

  /**
   * Actualizar cantidad de producto
   */
  async updateProductQuantity(cartId, productId, quantity) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      const product = cart.products.find(p => p.productId === productId);
      if (!product) {
        throw new Error('Producto no encontrado en el carrito');
      }

      if (quantity <= 0) {
        // Eliminar si la cantidad es 0 o negativa
        cart.products = cart.products.filter(p => p.productId !== productId);
      } else {
        product.quantity = quantity;
      }

      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(`Error al actualizar cantidad: ${error.message}`);
    }
  }

  /**
   * Vaciar carrito
   */
  async clearCart(cartId) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      cart.products = [];
      cart.totalPrice = 0;
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(`Error al vaciar carrito: ${error.message}`);
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
