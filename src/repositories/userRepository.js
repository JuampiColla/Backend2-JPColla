import userDAO from '../daos/userDAO.js';

class UserRepository {
  /**
   * Crear nuevo usuario en la base de datos
   */
  async create(userData) {
    return await userDAO.createUser(userData);
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email) {
    return await userDAO.findByEmail(email);
  }

  /**
   * Buscar usuario por ID
   */
  async findById(id) {
    return await userDAO.findById(id);
  }

  /**
   * Obtener todos los usuarios
   */
  async findAll() {
    return await userDAO.findAll();
  }

  /**
   * Actualizar usuario
   */
  async update(id, updateData) {
    return await userDAO.updateUser(id, updateData);
  }

  /**
   * Eliminar usuario
   */
  async delete(id) {
    return await userDAO.deleteUser(id);
  }

  /**
   * Verificar si usuario existe
   */
  async exists(email) {
    return await userDAO.exists(email);
  }

  /**
   * Buscar usuario por token de recuperación
   */
  async findByResetToken(token) {
    return await userDAO.findByResetToken(token);
  }

  /**
   * Actualizar token de recuperación de contraseña
   */
  async updateResetToken(id, token, expiresAt) {
    return await userDAO.updateResetToken(id, token, expiresAt);
  }

  /**
   * Limpiar token de recuperación
   */
  async clearResetToken(id) {
    return await userDAO.clearResetToken(id);
  }
}

export default new UserRepository();