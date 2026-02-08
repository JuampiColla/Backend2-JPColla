import { Router } from 'express';
import userController from '../../src/controllers/userController.js';
import { authenticateJWT, isAdmin } from '../../middlewares/jwt.middleware.js';

const router = Router();

// CREATE - Registrar nuevo usuario
router.post('/register', (req, res) => userController.register(req, res));

// LOGIN - Autenticar usuario con JWT
router.post('/login', (req, res) => userController.login(req, res));

// LOGOUT - Cerrar sesión
router.post('/logout', (req, res) => userController.logout(req, res));

// CURRENT - Obtener usuario actual (requiere JWT)
router.get('/current', authenticateJWT, (req, res) => userController.getCurrent(req, res));

// READ - Obtener todos los usuarios (solo admin)
router.get('/', authenticateJWT, isAdmin, (req, res) => userController.getAll(req, res));

// READ - Obtener usuario por ID (requiere autenticación)
router.get('/:id', authenticateJWT, (req, res) => userController.getById(req, res));

// UPDATE - Actualizar usuario (solo el propio usuario o admin)
router.put('/:id', authenticateJWT, (req, res) => userController.update(req, res));

// DELETE - Eliminar usuario (solo admin)
router.delete('/:id', authenticateJWT, isAdmin, (req, res) => userController.delete(req, res));

export default router;