import { Router } from 'express';
import { isAuthenticated, isNotAuthenticated } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/authorization.middleware.js';

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

// Vista de recuperar contraseña
router.get('/forgot-password', isNotAuthenticated, (req, res) => {
    res.render('forgot-password', {
        title: 'Recuperar Contraseña'
    });
});

// Vista de restablecer contraseña
router.get('/reset-password', isNotAuthenticated, (req, res) => {
    const token = req.query.token;
    res.render('reset-password', {
        title: 'Restablecer Contraseña',
        token
    });
});

// Vista de productos (requiere autenticación JWT)
router.get('/', isAuthenticated, (req, res) => {
    // Los productos se cargarán dinámicamente desde la API vía JavaScript
    res.render('products', {
        title: 'Productos',
        user: req.user,
        isAdmin: req.user.role === 'admin'
    });
});

// Vista de gestión de productos (solo admin)
router.get('/manage', isAuthenticated, isAdmin, (req, res) => {
    res.render('manage-products', {
        title: 'Gestión de Productos',
        user: req.user,
        isAdmin: true
    });
});

export default router;