import { Router } from 'express';
import { isAuthenticated, isNotAuthenticated } from '../middlewares/jwt.middleware.js';

const router = Router();

// Vista de login
router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('login', {
        title: 'Login'
    });
});

// Vista de registro
router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('register', {
        title: 'Registro'
    });
});

// Vista de productos (requiere autenticación JWT)
router.get('/', isAuthenticated, (req, res) => {
    // Productos de ejemplo
    const products = [
        { id: 1, name: 'Producto 1', price: 100, stock: 10 },
        { id: 2, name: 'Producto 2', price: 200, stock: 5 },
        { id: 3, name: 'Producto 3', price: 150, stock: 8 },
        { id: 4, name: 'Producto 4', price: 300, stock: 3 },
        { id: 5, name: 'Producto 5', price: 250, stock: 7 }
    ];

    res.render('products', {
        title: 'Productos',
        user: req.user,
        products,
        isAdmin: req.user.role === 'admin'
    });
});

export default router;