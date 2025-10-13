const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Login de usuario
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos',
      });
    }

    // Verificar si el usuario está activo
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Cuenta desactivada',
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador.',
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos',
      });
    }

    // Generar JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d', // Token válido por 7 días
      }
    );

    // Actualizar last_login
    await user.update({ last_login: new Date() });

    // Preparar datos del usuario (sin password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      rut: user.rut,
      dateOfBirth: user.date_of_birth,
      profileImageUrl: user.profile_image_url,
      address: user.address,
      commune: user.commune,
      region: user.region,
      role: user.role,
      emailVerified: user.email_verified,
      phoneVerified: user.phone_verified,
    };

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: userData,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      error: 'Error del servidor',
      message: 'Error al procesar el login',
    });
  }
};

/**
 * Registro de nuevo usuario
 */
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      rut,
      dateOfBirth,
    } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email ya registrado',
        message: 'Este email ya está en uso',
      });
    }

    // Verificar si el RUT ya existe (si se proporcionó)
    if (rut) {
      const existingRut = await User.findOne({ where: { rut } });
      if (existingRut) {
        return res.status(409).json({
          success: false,
          error: 'RUT ya registrado',
          message: 'Este RUT ya está en uso',
        });
      }
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await User.create({
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      rut: rut || null,
      date_of_birth: dateOfBirth || null,
      role: 'owner',
      is_active: true,
      email_verified: false,
      phone_verified: false,
    });

    // Generar JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    // Preparar datos del usuario
    const userData = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      phone: newUser.phone,
      rut: newUser.rut,
      dateOfBirth: newUser.date_of_birth,
      role: newUser.role,
      emailVerified: newUser.email_verified,
      phoneVerified: newUser.phone_verified,
    };

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: userData,
      },
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({
      success: false,
      error: 'Error del servidor',
      message: 'Error al crear el usuario',
    });
  }
};

/**
 * Validar token JWT
 */
const validateToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado',
        message: 'Se requiere un token de autenticación',
      });
    }

    const token = authHeader.substring(7);

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario
    const user = await User.findByPk(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        message: 'El token no es válido o el usuario no existe',
      });
    }

    // Preparar datos del usuario
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      rut: user.rut,
      dateOfBirth: user.date_of_birth,
      profileImageUrl: user.profile_image_url,
      address: user.address,
      commune: user.commune,
      region: user.region,
      role: user.role,
      emailVerified: user.email_verified,
      phoneVerified: user.phone_verified,
    };

    return res.status(200).json({
      success: true,
      message: 'Token válido',
      data: {
        user: userData,
      },
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        message: 'El token proporcionado no es válido',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado',
        message: 'El token ha expirado',
      });
    }

    console.error('Error en validateToken:', error);
    return res.status(500).json({
      success: false,
      error: 'Error del servidor',
      message: 'Error al validar el token',
    });
  }
};

module.exports = {
  login,
  register,
  validateToken,
};
