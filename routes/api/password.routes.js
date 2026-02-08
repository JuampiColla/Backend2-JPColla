import { Router } from 'express';
import authService from '../../src/services/authService.js';
import { authenticateJWT } from '../../middlewares/jwt.middleware.js';

const router = Router();

/**
 * POST /api/password/forgot
 * Solicitar recuperación de contraseña
 */
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email es requerido'
      });
    }

    const result = await authService.requestPasswordReset(email);

    return res.json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    console.error('Error en solicitud de reseteo:', error);
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Error al procesar solicitud'
    });
  }
});

/**
 * GET /api/password/validate-token/:token
 * Validar token de recuperación
 */
router.get('/validate-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await authService.validateResetToken(token);

    return res.json({
      status: 'success',
      message: 'Token válido',
      email: user.email
    });
  } catch (error) {
    console.error('Error al validar token:', error);
    return res.status(400).json({
      status: 'error',
      message: 'Token inválido o expirado'
    });
  }
});

/**
 * POST /api/password/reset
 * Restablecer contraseña con token
 */
router.post('/reset', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Token y contraseñas son requeridos'
      });
    }

    const result = await authService.resetPassword(
      token,
      newPassword,
      confirmPassword
    );

    return res.json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Error al restablecer contraseña'
    });
  }
});

/**
 * POST /api/password/change
 * Cambiar contraseña (usuario autenticado)
 */
router.post('/change', authenticateJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Todas las contraseñas son requeridas'
      });
    }

    const result = await authService.changePassword(
      userId,
      currentPassword,
      newPassword,
      confirmPassword
    );

    return res.json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Error al cambiar contraseña'
    });
  }
});

export default router;