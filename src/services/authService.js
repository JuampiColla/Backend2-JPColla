import bcrypt from 'bcrypt';
import userDAO from '../daos/userDAO.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../../utils/jwt.utils.js';
import config from '../config/config.js';

class AuthService {
  /**
   * Registrar un nuevo usuario
   */
  async register(first_name, last_name, email, age, password) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await userDAO.exists(email);
      if (existingUser) {
        throw new Error('El usuario ya existe');
      }

      // Validar campos obligatorios
      if (!first_name || !last_name || !email || !password) {
        throw new Error('Todos los campos son obligatorios');
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, config.bcrypt.rounds);

      // Determinar el rol
      let role = 'user';
      if (email === config.admin?.email) {
        role = 'admin';
      }

      // Crear usuario
      const newUser = await userDAO.createUser({
        first_name,
        last_name,
        email,
        age,
        password: hashedPassword,
        role,
        provider: 'local'
      });

      return newUser;
    } catch (error) {
      throw new Error(`Error en registro: ${error.message}`);
    }
  }

  /**
   * Login del usuario
   */
  async login(email, password) {
    try {
      // Validar campos
      if (!email || !password) {
        throw new Error('Email y contraseña son obligatorios');
      }

      // Buscar usuario
      const user = await userDAO.findByEmail(email);
      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Credenciales inválidas');
      }

      return user;
    } catch (error) {
      throw new Error(`Error en login: ${error.message}`);
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(userId) {
    try {
      const user = await userDAO.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      throw new Error(`Error al obtener usuario actual: ${error.message}`);
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(userId, updateData, requestUserId, userRole) {
    try {
      // Verificar permisos
      if (userId !== requestUserId && userRole !== 'admin') {
        throw new Error('No tienes permisos para actualizar este usuario');
      }

      // Si se proporciona nueva contraseña, hashearla
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, config.bcrypt.rounds);
      }

      const updatedUser = await userDAO.updateUser(userId, updateData);
      if (!updatedUser) {
        throw new Error('Usuario no encontrado');
      }

      return updatedUser;
    } catch (error) {
      throw new Error(`Error al actualizar perfil: ${error.message}`);
    }
  }

  /**
   * Verificar contraseña
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error(`Error al verificar contraseña: ${error.message}`);
    }
  }

  /**
   * Generar token JWT
   */
  generateToken(user) {
    try {
      return generateToken(user);
    } catch (error) {
      throw new Error(`Error al generar token: ${error.message}`);
    }
  }
}

export default new AuthService();
