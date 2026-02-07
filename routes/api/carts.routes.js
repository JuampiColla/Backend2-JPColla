import { Router } from 'express';
import Cart from '../../models/cart.model.js';
import User from '../../models/user.model.js';
import { authenticateJWT } from '../../middlewares/jwt.middleware.js';

const router = Router();

// Obtener carrito del usuario autenticado
// Productos de ejemplo (coincide con routes/products.routes.js)
const products = [
    { id: 1, name: 'Producto 1', price: 100, stock: 10 },
    { id: 2, name: 'Producto 2', price: 200, stock: 5 },
    { id: 3, name: 'Producto 3', price: 150, stock: 8 },
    { id: 4, name: 'Producto 4', price: 300, stock: 3 },
    { id: 5, name: 'Producto 5', price: 250, stock: 7 }
];

router.get('/', authenticateJWT, async (req, res) => {
    try {
        const user = req.user;
        console.log('GET /carts - User:', user);
        
        if (!user) {
            console.log('GET /carts - No user found');
            return res.status(401).json({ status: 'error', message: 'No autenticado' });
        }

        if (!user.cart) {
            console.log('GET /carts - User has no cart ID');
            return res.status(404).json({ status: 'error', message: 'Usuario sin carrito asignado' });
        }

        const cart = await Cart.findById(user.cart);
        console.log('GET /carts - Cart found:', cart);
        
        if (!cart) {
            console.log('GET /carts - Cart not found in DB for ID:', user.cart);
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado en base de datos' });
        }

        // Convertir IDs de productos en strings a datos completos
        const cartWithProducts = {
            ...cart.toObject(),
            products: cart.products.map(item => ({
                product: products.find(p => p.id === parseInt(item.product)) || { id: item.product, name: 'Producto no encontrado' },
                quantity: item.quantity
            }))
        };

        const total = await cart.calculateTotal();

        return res.json({ status: 'success', payload: { cart: cartWithProducts, total } });
    } catch (err) {
        console.error('GET /carts - Error:', err);
        return res.status(500).json({ status: 'error', message: err.message });
    }
});

// Agregar producto al carrito (body: { productId, quantity })
router.post('/add', authenticateJWT, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const user = req.user;
        if (!productId) return res.status(400).json({ status: 'error', message: 'productId es requerido' });

        const product = products.find(p => p.id === parseInt(productId));
        if (!product) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });

        let cart = await Cart.findById(user.cart);
        if (!cart) {
            cart = await Cart.create({ products: [] });
            // Usar findByIdAndUpdate en lugar de user.save() porque req.user es solo un objeto plano del JWT
            await User.findByIdAndUpdate(user.id, { cart: cart._id });
        }

        const existing = cart.products.find(p => p.product.toString() === String(productId));
        if (existing) {
            existing.quantity += parseInt(quantity);
        } else {
            cart.products.push({ product: String(productId), quantity: parseInt(quantity) });
        }

        await cart.save();
        return res.json({ status: 'success', message: 'Producto agregado al carrito' });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
});

// Remover producto del carrito (body: { productId })
router.post('/remove', authenticateJWT, async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;
        if (!productId) return res.status(400).json({ status: 'error', message: 'productId es requerido' });

        const cart = await Cart.findById(user.cart);
        if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

        cart.products = cart.products.filter(p => p.product.toString() !== productId);
        await cart.save();

        return res.json({ status: 'success', message: 'Producto removido del carrito' });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
});

export default router;
