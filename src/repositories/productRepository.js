import productDAO from '../daos/productDAO.js';

class ProductRepository {
  /**
   * Crear un nuevo producto
   */
  async create(productData) {
    return await productDAO.createProduct(productData);
  }

  /**
   * Buscar producto por ID
   */
  async findById(id) {
    return await productDAO.findById(id);
  }

  /**
   * Obtener todos los productos
   */
  async findAll(filters = {}) {
    return await productDAO.findAll(filters);
  }

  /**
   * Buscar productos por categoría
   */
  async findByCategory(category) {
    return await productDAO.findByCategory(category);
  }

  /**
   * Actualizar producto
   */
  async update(id, updateData) {
    return await productDAO.updateProduct(id, updateData);
  }

  /**
   * Eliminar producto
   */
  async delete(id) {
    return await productDAO.deleteProduct(id);
  }

  /**
   * Buscar productos por nombre
   */
  async findByName(name) {
    return await productDAO.findByName(name);
  }

  /**
   * Obtener productos destacados
   */
  async getFeaturedProducts() {
    return await productDAO.getFeaturedProducts();
  }

  /**
   * Buscar productos con filtros avanzados
   */
  async searchProducts(searchTerm, filters = {}) {
    return await productDAO.searchProducts(searchTerm, filters);
  }
}

export default new ProductRepository();