import productRepository from '../repositories/productRepository.js';

class ProductService {
  /**
   * Crear un nuevo producto (solo admin)
   */
  async createProduct(productData, adminId) {
    try {
      const newProduct = await productRepository.create({
        ...productData,
        createdBy: adminId,
        createdAt: new Date()
      });

      return {
        success: true,
        message: 'Producto creado exitosamente',
        product: newProduct
      };
    } catch (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }
  }

  /**
   * Actualizar un producto (solo admin que lo creó)
   */
  async updateProduct(productId, updateData, adminId) {
    try {
      const product = await productRepository.findById(productId);
      
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Verificar que el admin sea quien creó el producto (opcional)
      // if (product.createdBy.toString() !== adminId) {
      //   throw new Error('No tienes permiso para actualizar este producto');
      // }

      const updatedProduct = await productRepository.update(productId, {
        ...updateData,
        updatedAt: new Date(),
        updatedBy: adminId
      });

      return {
        success: true,
        message: 'Producto actualizado exitosamente',
        product: updatedProduct
      };
    } catch (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
  }

  /**
   * Eliminar un producto (solo admin)
   */
  async deleteProduct(productId, adminId) {
    try {
      const product = await productRepository.findById(productId);
      
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      await productRepository.delete(productId);

      return {
        success: true,
        message: 'Producto eliminado exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

  /**
   * Obtener todos los productos (público)
   */
  async getAllProducts(filters = {}) {
    try {
      const products = await productRepository.findAll(filters);
      
      return {
        success: true,
        total: products.length,
        products
      };
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  /**
   * Obtener producto por ID (público)
   */
  async getProductById(productId) {
    try {
      const product = await productRepository.findById(productId);
      
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      return {
        success: true,
        product
      };
    } catch (error) {
      throw new Error(`Error al obtener producto: ${error.message}`);
    }
  }

  /**
   * Buscar productos por categoría
   */
  async getProductsByCategory(category) {
    try {
      const products = await productRepository.findByCategory(category);
      
      return {
        success: true,
        total: products.length,
        products
      };
    } catch (error) {
      throw new Error(`Error al obtener productos por categoría: ${error.message}`);
    }
  }

  /**
   * Verificar stock de un producto
   */
  async checkStock(productId, quantity) {
    try {
      const product = await productRepository.findById(productId);
      
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      if (product.stock < quantity) {
        return {
          available: false,
          message: `Stock insuficiente. Disponible: ${product.stock}`
        };
      }

      return {
        available: true,
        stock: product.stock,
        message: 'Stock disponible'
      };
    } catch (error) {
      throw new Error(`Error al verificar stock: ${error.message}`);
    }
  }

  /**
   * Actualizar stock de un producto
   */
  async updateStock(productId, quantity, operation = 'decrease') {
    try {
      const product = await productRepository.findById(productId);
      
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      let newStock = product.stock;
      
      if (operation === 'decrease') {
        newStock = product.stock - quantity;
      } else if (operation === 'increase') {
        newStock = product.stock + quantity;
      }

      if (newStock < 0) {
        throw new Error('Stock no puede ser negativo');
      }

      const updatedProduct = await productRepository.update(productId, {
        stock: newStock
      });

      return {
        success: true,
        message: 'Stock actualizado',
        product: updatedProduct
      };
    } catch (error) {
      throw new Error(`Error al actualizar stock: ${error.message}`);
    }
  }
}

export default new ProductService();