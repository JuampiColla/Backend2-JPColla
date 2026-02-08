import Product from '../../models/product.model.js';

class ProductDAO {
  async createProduct(productData) {
    try {
      const product = await Product.create(productData);
      return product;
    } catch (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const product = await Product.findById(id);
      return product;
    } catch (error) {
      throw new Error(`Error al buscar producto: ${error.message}`);
    }
  }

  async findAll(filters = {}) {
    try {
      let query = {};
      if (filters.category) query.category = filters.category;
      if (filters.search) query.title = new RegExp(filters.search, 'i');
      
      const products = await Product.find(query);
      return products;
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  async findByCategory(category) {
    try {
      const products = await Product.find({ category });
      return products;
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  async updateProduct(id, updateData) {
    try {
      const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
      return product;
    } catch (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
  }

  async deleteProduct(id) {
    try {
      const product = await Product.findByIdAndDelete(id);
      return product;
    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

  async findByName(name) {
    try {
      const product = await Product.findOne({ title: new RegExp(name, 'i') });
      return product;
    } catch (error) {
      throw new Error(`Error al buscar producto: ${error.message}`);
    }
  }

  async getFeaturedProducts() {
    try {
      const products = await Product.find({ featured: true });
      return products;
    } catch (error) {
      throw new Error(`Error al obtener productos destacados: ${error.message}`);
    }
  }

  async searchProducts(searchTerm, filters = {}) {
    try {
      let query = { title: new RegExp(searchTerm, 'i') };
      if (filters.category) query.category = filters.category;
      if (filters.minPrice) query.price = { $gte: filters.minPrice };
      if (filters.maxPrice) {
        query.price = { ...query.price, $lte: filters.maxPrice };
      }
      
      const products = await Product.find(query);
      return products;
    } catch (error) {
      throw new Error(`Error al buscar productos: ${error.message}`);
    }
  }
}

export default new ProductDAO();
