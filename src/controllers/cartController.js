import cartService from '../services/cartService.js';

class CartController {
  /**
   * Obtener carrito del usuario
   * GET /api/carts
   */
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await cartService.getCart(userId);

      return res.json({
        status: 'success',
        cart
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
   * POST /api/carts/add
   */
  async addProduct(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;
      const userId = req.user.id;

      // Validar datos
      if (!productId) {
        return res.status(400).json({
          status: 'error',
          message: 'productId es requerido'
        });
      }

      const { cart, total } = await cartService.addProductToCart(
        userId,
        productId,
        quantity
      );

      return res.status(200).json({
        status: 'success',
        message: 'Producto agregado al carrito',
        cart,
        total
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
   * Eliminar producto del carrito
   * POST /api/carts/remove
   */
  async removeProduct(req, res) {
    try {
      const { productId } = req.body;
      const userId = req.user.id;

      // Validar datos
      if (!productId) {
        return res.status(400).json({
          status: 'error',
          message: 'productId es requerido'
        });
      }

      const { cart, total } = await cartService.removeProductFromCart(
        userId,
        productId
      );

      return res.json({
        status: 'success',
        message: 'Producto eliminado del carrito',
        cart,
        total
      });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Error al eliminar producto'
      });
    }
  }

  /**
   * Actualizar cantidad de producto
   * PUT /api/carts/:productId
   */
  async updateQuantity(req, res) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const userId = req.user.id;

      // Validar datos
      if (!productId || quantity === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'productId y quantity son requeridos'
        });
      }

      const { cart, total } = await cartService.updateProductQuantity(
        userId,
        productId,
        quantity
      );

      return res.json({
        status: 'success',
        message: 'Cantidad actualizada',
        cart,
        total
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
   * DELETE /api/carts
   */
  async clearCart(req, res) {
    try {
      const userId = req.user.id;
      await cartService.clearCart(userId);

      return res.json({
        status: 'success',
        message: 'Carrito vaciado'
      });
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Error al vaciar carrito'
      });
    }
  }

  /**
   * Obtener productos disponibles
   * GET /api/carts/products
   */
  async getAvailableProducts(req, res) {
    try {
      const products = cartService.getAvailableProducts();
      return res.json({
        status: 'success',
        products
      });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Error al obtener productos'
      });
    }
  }
}

export default new CartController();
