import { Router } from 'express';
import passport from 'passport';
import { generateToken, setTokenCookie, clearTokenCookie } from '../../utils/jwt.utils.js';

const router = Router();

// ==================== POST /api/sessions/register ====================
router.post('/register', (req, res, next) => {
    passport.authenticate('register', async (err, user, info) => {
        if (err) {
            return res.status(500).json({ 
                status: 'error', 
                message: 'Error en el servidor',
                error: err.message
            });
        }

        if (!user) {
            return res.status(400).json({ 
                status: 'error', 
                message: info?.message || 'Error al registrar usuario' 
            });
        }

        // Generar JWT
        const token = generateToken(user);
        setTokenCookie(res, token);

        return res.status(201).json({ 
            status: 'success', 
            message: 'Usuario registrado correctamente',
            payload: user.toJSON()
        });
    })(req, res, next);
});

// ==================== POST /api/sessions/login ====================
router.post('/login', (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        if (err) {
            return res.status(500).json({ 
                status: 'error', 
                message: 'Error en el servidor',
                error: err.message
            });
        }

        if (!user) {
            return res.status(401).json({ 
                status: 'error', 
                message: info?.message || 'Credenciales inválidas' 
            });
        }

        // Generar JWT
        const token = generateToken(user);
        setTokenCookie(res, token);

        return res.json({ 
            status: 'success', 
            message: 'Login exitoso',
            payload: user.toJSON()
        });
    })(req, res, next);
});

// ==================== GET /api/sessions/current ====================
// ⭐ REQUISITO: Validar usuario logueado y devolver datos del JWT
router.get('/current', 
    passport.authenticate('current', { session: false }),
    (req, res) => {
        return res.json({
            status: 'success',
            message: 'Usuario autenticado',
            payload: req.user
        });
    }
);

// ==================== POST /api/sessions/logout ====================
router.post('/logout', (req, res) => {
    clearTokenCookie(res);
    return res.json({ 
        status: 'success', 
        message: 'Sesión cerrada correctamente' 
    });
});

export default router;