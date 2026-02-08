import productService from '../services/productService.js';

class ProductController {
  /**
   * Obtener todos los productos
   */
  async getAll(req, res) {
    try {
      const { category, search } = req.query;
      const filters = {};
      
      if (category) filters.category = category;
      if (search) filters.search = search;

      const result = await productService.getAllProducts(filters);

      return res.json({
        status: 'success',
        total: result.total,
        products: result.products
      });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Error al obtener productos'
      });
    }
  }

  /**
   * Obtener producto por ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const result = await productService.getProductById(id);

      return res.json({
        status: 'success',
        product: result.product
      });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      return res.status(404).json({
        status: 'error',
        message: error.message || 'Producto no encontrado'
      });
    }
  }

  /**
   * Obtener productos por categoría
   */
  async getByCategory(req, res) {
    try {
      const { category } = req.params;

      const result = await productService.getProductsByCategory(category);

      return res.json({
        status: 'success',
        total: result.total,
        products: result.products
      });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Error al obtener productos'
      });
    }
  }

  /**
   * Crear nuevo producto (solo admin)
   */
  async create(req, res) {
    try {
      const productData = req.body;
      const adminId = req.user.id;

      // Validar campos requeridos
      if (!productData.title || !productData.description || !productData.price || !productData.stock) {
        return res.status(400).json({
          status: 'error',
          message: 'Titulo, descripción, precio y stock son requeridos'
        });
      }

      const result = await productService.createProduct(productData, adminId);

      return res.status(201).json({
        status: 'success',
        message: result.message,
        product: result.product
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Error al crear producto'
      });
    }
  }

  /**
   * Actualizar producto (solo admin)
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const adminId = req.user.id;

      const result = await productService.updateProduct(id, updateData, adminId);

      return res.json({
        status: 'success',
        message: result.message,
        product: result.product
      });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Error al actualizar producto'
      });
    }
  }

  /**
   * Eliminar producto (solo admin)
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const result = await productService.deleteProduct(id, adminId);

      return res.json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Error al eliminar producto'
      });
    }
  }
}

export default new ProductController();
