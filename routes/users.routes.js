import { Router } from 'express';
import { isAuthenticated, isNotAuthenticated } from '../middlewares/jwt.middleware.js';

const router = Router();

// Vista de login (solo accesible si NO está autenticado)
router.get('/login', isNotAuthenticated, (req, res) => {
    const errorMessage = req.query.error;
    res.render('userLogin', {
        title: 'Login',
        errorMessage
    });
});

// Vista de registro (solo accesible si NO está autenticado)
router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('userRegister', {
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

// Vista de usuario actual (solo accesible si ESTÁ autenticado)
router.get('/current', isAuthenticated, (req, res) => {
    res.render('current', {
        title: 'Mi Perfil',
        user: req.user,
        isAdmin: req.user.role === 'admin'
    });
});

export default router;