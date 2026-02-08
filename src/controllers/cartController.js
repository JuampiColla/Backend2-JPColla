import cartService from '../services/cartService.js';

class CartController {
  /**
   * Obtener carrito del usuario
   */
  async getCart(req, res) {
    try {
      const { userId } = req.params;

      // Verificar que el usuario accede su propio carrito
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permiso para acceder a este carrito'
        });
      }

      const result = await cartService.getCart(userId);

      return res.json({
        status: 'success',
        cart: result.cart
      });
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Error al obtener carrito'
      });
    }
  }

  /**
   * Agregar producto al carrito
   */
  async addProduct(req, res) {
    try {
      const { userId } = req.params;
      const { productId, quantity, price, name } = req.body;

      console.log(`[CARRITO] Agregando producto: userId=${userId}, user.id=${req.user.id}, productId=${productId}, quantity=${quantity}`);

      // Verificar que el usuario agrega a su propio carrito
      // Convertir ambos a strings para comparar correctamente
      if (req.user.id.toString() !== userId.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'No puedes agregar productos al carrito de otro usuario'
        });
      }

      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Producto ID y cantidad válida son requeridos'
        });
      }

      const result = await cartService.addProductToCart(userId, productId, quantity, price, name);

      return res.json({
        status: 'success',
        message: result.message,
        cart: result.cart
      });
    } catch (error) {
      console.error('Error al agregar producto:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Error al agregar producto'
      });
    }
  }

  /**
   * Remover producto del carrito
   */
  async removeProduct(req, res) {
    try {
      const { userId, productId } = req.params;

      // Verificar que el usuario remueve de su propio carrito
      if (req.user.id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'No puedes remover productos del carrito de otro usuario'
        });
      }

      const result = await cartService.removeProductFromCart(userId, productId);

      return res.json({
        status: 'success',
        message: result.message,
        cart: result.cart
      });
    } catch (error) {
      console.error('Error al remover producto:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Error al remover producto'
      });
    }
  }

  /**
   * Actualizar cantidad de producto
   */
  async updateQuantity(req, res) {
    try {
      const { userId, productId } = req.params;
      const { quantity } = req.body;

      // Verificar que el usuario actualiza su propio carrito
      if (req.user.id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'No puedes actualizar el carrito de otro usuario'
        });
      }

      if (!quantity || quantity < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cantidad válida es requerida'
        });
      }

      const result = await cartService.updateProductQuantity(userId, productId, quantity);

      return res.json({
        status: 'success',
        message: result.message,
        cart: result.cart
      });
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Error al actualizar cantidad'
      });
    }
  }

  /**
   * Vaciar carrito
   */
  async clearCart(req, res) {
    try {
      const { userId } = req.params;

      // Verificar que el usuario vacía su propio carrito
      if (req.user.id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'No puedes vaciar el carrito de otro usuario'
        });
      }

      const result = await cartService.clearCart(userId);

      return res.json({
        status: 'success',
        message: result.message,
        cart: result.cart
      });
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Error al vaciar carrito'
      });
    }
  }
}

export default new CartController();
