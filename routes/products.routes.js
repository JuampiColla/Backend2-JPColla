import { Router } from 'express';
import { authenticateJWT } from '../middlewares/jwt.middleware.js';
import { isAdmin, isAdminOrPremium } from '../middlewares/authorization.middleware.js';
import productController from '../src/controllers/productController.js';

const router = Router();

/**
 * GET /api/products
 * Obtener todos los productos (público)
 */
router.get('/', productController.getAll);

/**
 * GET /api/products/:id
 * Obtener producto por ID (público)
 */
router.get('/:id', productController.getById);

/**
 * GET /api/products/category/:category
 * Obtener productos por categoría (público)
 */
router.get('/category/:category', productController.getByCategory);

/**
 * POST /api/products
 * Crear nuevo producto (solo admin)
 */
router.post('/', authenticateJWT, isAdmin, productController.create);

/**
 * PUT /api/products/:id
 * Actualizar producto (solo admin)
 */
router.put('/:id', authenticateJWT, isAdmin, productController.update);

/**
 * DELETE /api/products/:id
 * Eliminar producto (solo admin)
 */
router.delete('/:id', authenticateJWT, isAdmin, productController.delete);

export default router;