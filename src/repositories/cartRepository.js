import cartDAO from '../daos/cartDAO.js';

class CartRepository {
  /**
   * Crear un nuevo carrito
   */
  async create(cartData) {
    return await cartDAO.createCart(cartData);
  }

  /**
   * Buscar carrito por ID
   */
  async findById(id) {
    return await cartDAO.findById(id);
  }

  /**
   * Buscar carrito por usuario ID
   */
  async findByUserId(userId) {
    return await cartDAO.findByUserId(userId);
  }

  /**
   * Actualizar carrito
   */
  async update(id, updateData) {
    return await cartDAO.updateCart(id, updateData);
  }

  /**
   * Eliminar carrito
   */
  async delete(id) {
    return await cartDAO.deleteCart(id);
  }

  /**
   * Obtener todos los carritos
   */
  async findAll() {
    return await cartDAO.findAll();
  }
}

export default new CartRepository();
