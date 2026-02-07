import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Ruta para registrar usuario con Passport
router.post('/register', (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
        if (err) {
            return res.status(500).json({ 
                status: 'error', 
                message: 'Error en el servidor' 
            });
        }

        if (!user) {
            return res.status(400).json({ 
                status: 'error', 
                message: info.message || 'Error al registrar usuario' 
            });
        }

        // Login automático después del registro
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ 
                    status: 'error', 
                    message: 'Error al iniciar sesión' 
                });
            }

            return res.json({ 
                status: 'success', 
                message: 'Usuario registrado correctamente' 
            });
        });
    })(req, res, next);
});

// Ruta para login con Passport Local
router.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
        if (err) {
            return res.status(500).json({ 
                status: 'error', 
                message: 'Error en el servidor' 
            });
        }

        if (!user) {
            return res.status(401).json({ 
                status: 'error', 
                message: info.message || 'Credenciales inválidas' 
            });
        }

        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ 
                    status: 'error', 
                    message: 'Error al iniciar sesión' 
                });
            }

            return res.json({ 
                status: 'success', 
                message: 'Login exitoso' 
            });
        });
    })(req, res, next);
});

// Ruta para iniciar autenticación con GitHub
router.get('/github', 
    passport.authenticate('github', { scope: ['user:email'] })
);

// Callback de GitHub
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        // Autenticación exitosa, redirigir a productos
        res.redirect('/products');
    }
);

// Ruta para logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ 
                status: 'error', 
                message: 'Error al cerrar sesión' 
            });
        }
        
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ 
                    status: 'error', 
                    message: 'Error al destruir sesión' 
                });
            }
            res.json({ 
                status: 'success', 
                message: 'Sesión cerrada' 
            });
        });
    });
});

// Ruta para obtener usuario actual
router.get('/current', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ 
            status: 'error', 
            message: 'No autenticado' 
        });
    }
    
    res.json({ 
        status: 'success', 
        user: req.user 
    });
});

export default router;