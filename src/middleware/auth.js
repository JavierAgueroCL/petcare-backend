const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT tradicional
 * Valida el JWT token en el header Authorization
 */
const jwtCheck = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Se requiere un token de autenticación',
      });
    }

    const token = authHeader.substring(7);

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar payload al request
    req.auth = {
      payload: {
        sub: decoded.id,
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      },
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token inválido',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token expirado',
      });
    }

    return res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al verificar token',
    });
  }
};

/**
 * Middleware para verificar que el usuario existe en la BD
 * Debe usarse después de jwtCheck
 */
const checkUserExists = async (req, res, next) => {
  try {
    const { User } = require('../models');

    // El ID viene en el payload del JWT
    const userId = req.auth.payload.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario autenticado no existe en la base de datos',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: 'Cuenta desactivada',
        message: 'Tu cuenta ha sido desactivada',
      });
    }

    // Agregar usuario al request para uso posterior
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en checkUserExists:', error);
    return res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al verificar usuario',
    });
  }
};

/**
 * Middleware para verificar roles
 * @param {Array} allowedRoles - Array de roles permitidos
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Usuario no autenticado',
      });
    }

    const userRole = req.user.role;

    // Admin tiene acceso a todo
    if (userRole === 'admin') {
      return next();
    }

    // Verificar si el rol del usuario está en los roles permitidos
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Prohibido',
        message: `No tienes permisos para acceder a este recurso. Roles requeridos: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Middleware para verificar ownership
 * Verifica que el usuario sea el dueño del recurso
 * @param {String} resourceType - Tipo de recurso ('pet', 'user', etc)
 */
const checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { User, Pet } = require('../models');

      // Admin siempre tiene acceso
      if (req.user.role === 'admin') {
        return next();
      }

      const userId = req.user.id;
      const resourceId = req.params.id || req.params.petId || req.params.userId;

      switch (resourceType) {
        case 'pet': {
          const pet = await Pet.findByPk(resourceId);

          if (!pet) {
            return res.status(404).json({
              error: 'No encontrado',
              message: 'Mascota no encontrada',
            });
          }

          if (pet.owner_id !== userId) {
            return res.status(403).json({
              error: 'Prohibido',
              message: 'No eres el dueño de esta mascota',
            });
          }

          // Agregar pet al request para evitar consulta duplicada
          req.pet = pet;
          break;
        }

        case 'user': {
          if (parseInt(resourceId) !== userId) {
            return res.status(403).json({
              error: 'Prohibido',
              message: 'No puedes modificar datos de otro usuario',
            });
          }
          break;
        }

        default:
          return res.status(500).json({
            error: 'Error de configuración',
            message: 'Tipo de recurso no soportado',
          });
      }

      next();
    } catch (error) {
      console.error('Error en checkOwnership:', error);
      return res.status(500).json({
        error: 'Error del servidor',
        message: 'Error al verificar ownership',
      });
    }
  };
};

/**
 * Middleware opcional: permite acceso sin autenticación
 * pero agrega user al request si está autenticado
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Intentar autenticación
    await jwtCheck(req, res, async () => {
      if (req.auth) {
        await checkUserExists(req, res, next);
      } else {
        next();
      }
    });
  } catch (error) {
    // Si falla la autenticación, continuar sin usuario
    next();
  }
};

/**
 * Middleware para verificar que el usuario es admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Usuario no autenticado',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Prohibido',
      message: 'Solo los administradores pueden acceder a este recurso',
    });
  }

  next();
};

module.exports = {
  jwtCheck,
  checkUserExists,
  checkRole,
  checkOwnership,
  optionalAuth,
  isAdmin,
};
