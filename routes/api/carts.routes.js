import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/jwt.middleware.js';
import { isUser, canMakePurchase } from '../../middlewares/authorization.middleware.js';
import cartController from '../../src/controllers/cartController.js';
import purchaseController from '../../src/controllers/purchaseController.js';

const router = Router();

/**
 * GET /api/carts/:userId
 * Obtener carrito del usuario (solo el usuario o admin)
 */
router.get('/:userId', authenticateJWT, cartController.getCart);

/**
 * POST /api/carts/:userId/products
 * Agregar producto al carrito (solo usuarios)
 */
router.post('/:userId/products', authenticateJWT, isUser, cartController.addProduct);

/**
 * DELETE /api/carts/:userId/products/:productId
 * Remover producto del carrito (solo usuarios)
 */
router.delete('/:userId/products/:productId', authenticateJWT, isUser, cartController.removeProduct);

/**
 * PUT /api/carts/:userId/products/:productId
 * Actualizar cantidad de producto (solo usuarios)
 */
router.put('/:userId/products/:productId', authenticateJWT, isUser, cartController.updateQuantity);

/**
 * DELETE /api/carts/:userId
 * Vaciar carrito (solo usuarios)
 */
router.delete('/:userId', authenticateJWT, isUser, cartController.clearCart);

/**
 * POST /api/carts/:userId/purchase
 * Procesar compra (solo usuarios)
 */
router.post('/:userId/purchase', authenticateJWT, canMakePurchase, purchaseController.purchase);

/**
 * GET /api/carts/:userId/tickets
 * Obtener tickets del usuario
 */
router.get('/:userId/tickets', authenticateJWT, purchaseController.getUserTickets);

export default router;
