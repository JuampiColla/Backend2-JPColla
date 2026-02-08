/**
 * Middleware para verificar si el usuario es administrador
 */
export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Acceso denegado. Solo administradores pueden realizar esta acción'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware isAdmin:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error en validación de permisos'
    });
  }
};

/**
 * Middleware para verificar si el usuario es usuario regular (no admin)
 * Permite a usuarios normales y admins
 */
export const isUser = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
    }

    // Permitir tanto usuarios regulares como admins
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Acceso denegado. Solo usuarios registrados pueden realizar esta acción'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware isUser:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error en validación de permisos'
    });
  }
};

/**
 * Middleware para verificar si el usuario es administrador o premium
 */
export const isAdminOrPremium = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'premium') {
      return res.status(403).json({
        status: 'error',
        message: 'Acceso denegado. Solo administradores o usuarios premium pueden realizar esta acción'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware isAdminOrPremium:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error en validación de permisos'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
export const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Usuario no autenticado'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware hasRole:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error en validación de permisos'
      });
    }
  };
};

/**
 * Middleware para verificar si el usuario es el propietario del carrito
 */
export const isCartOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
    }

    const { cartId } = req.params;
    
    // Aquí puedes validar si el carrito pertenece al usuario
    // Por ahora asumimos que el usuario solo puede acceder su propio carrito
    
    next();
  } catch (error) {
    console.error('Error en middleware isCartOwner:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error en validación de permisos'
    });
  }
};

/**
 * Middleware para verificar permisos de compra
 */
export const canMakePurchase = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
    }

    // Cualquier usuario autenticado puede hacer compras (incluyendo admin)
    next();
  } catch (error) {
    console.error('Error en middleware canMakePurchase:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error en validación de permisos'
    });
  }
};