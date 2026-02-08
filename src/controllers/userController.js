import authService from '../services/authService.js';
import userDAO from '../daos/userDAO.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../../utils/jwt.utils.js';

class UserController {
  /**
   * Registrar nuevo usuario
   * POST /api/users/register
   */
  async register(req, res) {
    try {
      const { first_name, last_name, email, age, password } = req.body;

      const newUser = await authService.register(
        first_name,
        last_name,
        email,
        age,
        password
      );

      // Generar token y establecer cookie
      const token = authService.generateToken(newUser);
      setTokenCookie(res, token);

      return res.status(201).json({
        status: 'success',
        message: 'Usuario registrado correctamente',
        user: newUser.toJSON(),
        redirect: '/products'
      });
    } catch (error) {
      console.error('Error en registro:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Error al registrar usuario'
      });
    }
  }

  /**
   * Login del usuario
   * POST /api/users/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await authService.login(email, password);

      // Generar token y establecer cookie
      const token = authService.generateToken(user);
      setTokenCookie(res, token);

      return res.json({
        status: 'success',
        message: 'Login exitoso',
        user: user.toJSON(),
        redirect: '/products'
      });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(401).json({
        status: 'error',
        message: error.message || 'Error al iniciar sesión'
      });
    }
  }

  /**
   * Logout del usuario
   * POST /api/users/logout
   */
  async logout(req, res) {
    try {
      clearTokenCookie(res);
      return res.json({
        status: 'success',
        message: 'Sesión cerrada correctamente'
      });
    } catch (error) {
      console.error('Error en logout:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al cerrar sesión'
      });
    }
  }

  /**
   * Obtener usuario actual
   * GET /api/users/current
   */
  async getCurrent(req, res) {
    try {
      return res.json({
        status: 'success',
        user: req.user
      });
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al obtener usuario actual'
      });
    }
  }

  /**
   * Obtener todos los usuarios
   * GET /api/users (solo admin)
   */
  async getAll(req, res) {
    try {
      const users = await userDAO.findAll();
      return res.json({
        status: 'success',
        users
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al obtener usuarios'
      });
    }
  }

  /**
   * Obtener usuario por ID
   * GET /api/users/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await userDAO.findById(id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Usuario no encontrado'
        });
      }

      return res.json({
        status: 'success',
        user
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al obtener usuario'
      });
    }
  }

  /**
   * Actualizar usuario
   * PUT /api/users/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { first_name, last_name, email, age, password } = req.body;

      const updateData = { first_name, last_name, email, age };

      const updatedUser = await authService.updateProfile(
        id,
        updateData,
        req.user.id,
        req.user.role
      );

      if (password) {
        // Si se actualiza contraseña, hashearla
        updateData.password = await authService.verifyPassword(
          password,
          updatedUser.password
        );
      }

      return res.json({
        status: 'success',
        message: 'Usuario actualizado correctamente',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return res.status(403).json({
        status: 'error',
        message: error.message || 'Error al actualizar usuario'
      });
    }
  }

  /**
   * Eliminar usuario
   * DELETE /api/users/:id (solo admin)
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedUser = await userDAO.deleteUser(id);

      if (!deletedUser) {
        return res.status(404).json({
          status: 'error',
          message: 'Usuario no encontrado'
        });
      }

      return res.json({
        status: 'success',
        message: 'Usuario eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al eliminar usuario'
      });
    }
  }
}

export default new UserController();
