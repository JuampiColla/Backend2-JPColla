import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_key_2024';
const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'currentUser';

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

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Verificar token JWT
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Configurar cookie con token
export const setTokenCookie = (res, token) => {
    res.cookie(JWT_COOKIE_NAME, token, {
        httpOnly: true,
        signed: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        sameSite: 'strict'
    });
};

// Limpiar cookie
export const clearTokenCookie = (res) => {
    res.clearCookie(JWT_COOKIE_NAME);
};

export { JWT_COOKIE_NAME };