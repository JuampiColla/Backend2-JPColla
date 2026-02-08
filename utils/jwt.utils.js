import jwt from 'jsonwebtoken';
import config from '../src/config/config.js';

// Generar token JWT
export const generateToken = (user) => {
    const payload = {
        id: user._id || user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        cart: user.cart // Incluir ID del carrito
    };

    return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

// Verificar token JWT
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (error) {
        return null;
    }
};

// Configurar cookie con token
export const setTokenCookie = (res, token) => {
    res.cookie(config.jwt.cookieName, token, {
        httpOnly: false,  // Permitir que JavaScript acceda
        secure: false,    // Cambiar a true en producción con HTTPS
        maxAge: config.session.maxAge,
        sameSite: 'lax'   // Permitir cookies en solicitudes cross-origin
    });
};

// Limpiar cookie
export const clearTokenCookie = (res) => {
    res.clearCookie(config.jwt.cookieName);
};

export const JWT_COOKIE_NAME = config.jwt.cookieName;