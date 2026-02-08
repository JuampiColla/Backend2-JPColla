import bcrypt from 'bcrypt';
import crypto from 'crypto';
import userRepository from '../repositories/userRepository.js';
import emailService from './emailService.js';
import config from '../config/config.js';

class AuthService {
  /**
   * Registrar nuevo usuario
   */
  async register(first_name, last_name, email, age, password) {
    try {
      // Normalizar email (convertir a minúsculas)
      const normalizedEmail = email.toLowerCase();
      
      // Verificar si el usuario ya existe
      const existingUser = await userRepository.findByEmail(normalizedEmail);
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Validar contraseña
      if (!password || password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(password, config.bcrypt.rounds);

      // Crear usuario
      const newUser = await userRepository.create({
        first_name,
        last_name,
        email: normalizedEmail,
        age,
        password: hashedPassword,
        lastPasswordChange: new Date()
      });

      // Convertir a objeto plano sin contraseña
      const userObject = newUser.toObject ? newUser.toObject() : newUser;
      delete userObject.password;
      delete userObject.resetToken;
      delete userObject.resetTokenExpires;

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        user: userObject
      };
    } catch (error) {
      throw new Error(`Error al registrar: ${error.message}`);
    }
  }

  /**
   * Login de usuario
   */
  async login(email, password) {
    try {
      // Normalizar email (convertir a minúsculas)
      const normalizedEmail = email.toLowerCase();
      
      const user = await userRepository.findByEmail(normalizedEmail);
      
      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Credenciales inválidas');
      }

      // Convertir a objeto plano sin contraseña
      const userObject = user.toObject ? user.toObject() : user;
      delete userObject.password;
      delete userObject.resetToken;
      delete userObject.resetTokenExpires;

      return {
        success: true,
        message: 'Login exitoso',
        user: userObject
      };
    } catch (error) {
      throw new Error(`Error al login: ${error.message}`);
    }
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async requestPasswordReset(email) {
    try {
      // Normalizar email (convertir a minúsculas)
      const normalizedEmail = email.toLowerCase();
      
      const user = await userRepository.findByEmail(normalizedEmail);
      if (!user) {
        // Por seguridad, no revelamos si el email existe o no
        return {
          message: 'Si existe una cuenta con ese email, recibirás instrucciones'
        };
      }

      // Generar token de recuperación
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + config.app.resetPasswordExpiresIn);

      // Guardar token en BD
      await userRepository.updateResetToken(user._id, resetToken, expiresAt);

      // Enviar email
      await emailService.sendPasswordResetEmail(
        user.email,
        user.first_name,
        resetToken
      );

      return {
        message: 'Si existe una cuenta con ese email, recibirás instrucciones para restablecer tu contraseña'
      };
    } catch (error) {
      throw new Error(`Error al solicitar reseteo: ${error.message}`);
    }
  }

  /**
   * Validar token de recuperación
   */
  async validateResetToken(token) {
    try {
      const user = await userRepository.findByResetToken(token);
      if (!user) {
        throw new Error('Token de recuperación inválido o expirado');
      }
      return user;
    } catch (error) {
      throw new Error(`Error al validar token: ${error.message}`);
    }
  }

  /**
   * Restablecer contraseña
   */
  async resetPassword(token, newPassword, confirmPassword) {
    try {
      // Validar que las contraseñas coincidan
      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Validar longitud
      if (newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Obtener usuario por token
      const user = await this.validateResetToken(token);

      // Verificar que la contraseña nueva no sea igual a la anterior
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new Error('La nueva contraseña no puede ser igual a la anterior');
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.rounds);

      // Actualizar usuario
      const updatedUser = await userRepository.update(user._id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
        lastPasswordChange: new Date()
      });

      // Enviar email de confirmación
      await emailService.sendPasswordChangedEmail(
        updatedUser.email,
        updatedUser.first_name
      );

      return {
        message: 'Contraseña restablecida exitosamente. Por favor, inicia sesión con tu nueva contraseña'
      };
    } catch (error) {
      throw new Error(`Error al restablecer contraseña: ${error.message}`);
    }
  }

  /**
   * Cambiar contraseña (usuario autenticado)
   */
  async changePassword(userId, currentPassword, newPassword, confirmPassword) {
    try {
      // Validar que las contraseñas coincidan
      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas nuevas no coinciden');
      }

      // Validar longitud
      if (newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Obtener usuario
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('La contraseña actual es incorrecta');
      }

      // Verificar que la nueva contraseña no sea igual a la anterior
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new Error('La nueva contraseña no puede ser igual a la actual');
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.rounds);

      // Actualizar usuario
      const updatedUser = await userRepository.update(userId, {
        password: hashedPassword,
        lastPasswordChange: new Date()
      });

      // Enviar email de confirmación
      await emailService.sendPasswordChangedEmail(
        updatedUser.email,
        updatedUser.first_name
      );

      return {
        message: 'Contraseña cambiada exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al cambiar contraseña: ${error.message}`);
    }
  }
}

export default new AuthService();