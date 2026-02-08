import User from '../../models/user.model.js';

class UserDAO {
  /**
   * Crear un nuevo usuario
   */
  async createUser(userData) {
    try {
      const user = await User.create(userData);
      return user;
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  /**
   * Encontrar usuario por email
   */
  async findByEmail(email) {
    try {
      // Búsqueda case-insensitive
      const user = await User.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
      return user;
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
  }

  /**
   * Encontrar usuario por ID
   */
  async findById(id) {
    try {
      const user = await User.findById(id);
      return user;
    } catch (error) {
      throw new Error(`Error al buscar usuario por ID: ${error.message}`);
    }
  }

  /**
   * Obtener todos los usuarios
   */
  async findAll() {
    try {
      const users = await User.find().select('-password');
      return users;
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  /**
   * Actualizar usuario
   */
  async updateUser(id, updateData) {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      return user;
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  /**
   * Eliminar usuario
   */
  async deleteUser(id) {
    try {
      const user = await User.findByIdAndDelete(id);
      return user;
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }

  /**
   * Verificar si el usuario existe (case-insensitive)
   */
  async exists(email) {
    try {
      const user = await User.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
      return !!user;
    } catch (error) {
      throw new Error(`Error al verificar existencia del usuario: ${error.message}`);
    }
  }

  /**
   * Encontrar usuario por token de reseteo
   */
  async findByResetToken(token) {
    try {
      const user = await User.findOne({ 
        resetToken: token,
        resetTokenExpires: { $gt: new Date() }
      });
      return user;
    } catch (error) {
      throw new Error(`Error al buscar usuario por token: ${error.message}`);
    }
  }

  /**
   * Actualizar token de reseteo
   */
  async updateResetToken(id, token, expiresAt) {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { 
          resetToken: token,
          resetTokenExpires: expiresAt
        },
        { new: true }
      );
      return user;
    } catch (error) {
      throw new Error(`Error al actualizar token: ${error.message}`);
    }
  }

  /**
   * Limpiar token de reseteo
   */
  async clearResetToken(id) {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { 
          resetToken: null,
          resetTokenExpires: null,
          lastPasswordChange: new Date()
        },
        { new: true }
      );
      return user;
    } catch (error) {
      throw new Error(`Error al limpiar token: ${error.message}`);
    }
  }
}

export default new UserDAO();