import { verifyToken, JWT_COOKIE_NAME } from '../utils/jwt.utils.js';

// Middleware para verificar JWT
export const authenticateJWT = (req, res, next) => {
    const token = req.signedCookies[JWT_COOKIE_NAME];

    if (!token) {
        return res.status(401).json({ 
            status: 'error', 
            message: 'No autenticado - Token no proporcionado' 
        });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ 
            status: 'error', 
            message: 'Token inválido o expirado' 
        });
    }

    req.user = decoded;
    next();
};

// Middleware para vistas - verificar si está autenticado
export const isAuthenticated = (req, res, next) => {
    const token = req.signedCookies[JWT_COOKIE_NAME];

    if (!token) {
        return res.redirect('/users/login');
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        return res.redirect('/users/login');
    }

    req.user = decoded;
    res.locals.user = decoded;
    next();
};

// Middleware para vistas - verificar si NO está autenticado
export const isNotAuthenticated = (req, res, next) => {
    const token = req.signedCookies[JWT_COOKIE_NAME];

    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            return res.redirect('/products');
        }
    }

    next();
};

// Middleware para verificar rol admin
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            status: 'error', 
            message: 'No autenticado' 
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            status: 'error', 
            message: 'Acceso denegado - Se requieren permisos de administrador' 
        });
    }

    next();
};

// Middleware para agregar user a res.locals si existe token
export const loadUser = (req, res, next) => {
    const token = req.signedCookies[JWT_COOKIE_NAME];
    
    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            req.user = decoded;
            res.locals.user = decoded;
        }
    }
    
    next();
};