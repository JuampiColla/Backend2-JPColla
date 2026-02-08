import { Router } from 'express';
import cartController from '../../src/controllers/cartController.js';
import { authenticateJWT } from '../../middlewares/jwt.middleware.js';

const router = Router();

// Obtener carrito del usuario autenticado
router.get('/', authenticateJWT, (req, res) => cartController.getCart(req, res));

// Agregar producto al carrito (body: { productId, quantity })
router.post('/add', authenticateJWT, (req, res) => cartController.addProduct(req, res));

// Actualizar cantidad de producto
router.put('/:productId', authenticateJWT, (req, res) => cartController.updateQuantity(req, res));

// Eliminar producto del carrito (body: { productId })
router.post('/remove', authenticateJWT, (req, res) => cartController.removeProduct(req, res));

// Vaciar carrito
router.delete('/', authenticateJWT, (req, res) => cartController.clearCart(req, res));

// Obtener productos disponibles
router.get('/products', authenticateJWT, (req, res) => cartController.getAvailableProducts(req, res));

export default router;
