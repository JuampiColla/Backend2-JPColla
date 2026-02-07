import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../../models/user.model.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../../utils/jwt.utils.js';
import { authenticateJWT, isAdmin } from '../../middlewares/jwt.middleware.js';

const router = Router();

// CREATE - Registrar nuevo usuario
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;

        // Validar que todos los campos estén presentes
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Todos los campos son obligatorios' 
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'El usuario ya existe' 
            });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Determinar el rol (admin si es el email especial)
        let role = 'user';
        if (email === process.env.ADMIN_EMAIL) {
            role = 'admin';
        }

        // Crear nuevo usuario
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword,
            role,
            provider: 'local'
        });

        // Generar JWT
        const token = generateToken(newUser);

        // Establecer cookie con token firmado
        setTokenCookie(res, token);

        res.status(201).json({ 
            status: 'success', 
            message: 'Usuario registrado correctamente',
            user: newUser.toJSON(),
            redirect: '/products'
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al registrar usuario' 
        });
    }
});

// LOGIN - Autenticar usuario con JWT
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Email y contraseña son obligatorios' 
            });
        }

        // Buscar usuario por email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ 
                status: 'error', 
                message: 'Credenciales inválidas' 
            });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ 
                status: 'error', 
                message: 'Credenciales inválidas' 
            });
        }

        // Generar JWT
        const token = generateToken(user);

        // Establecer cookie firmada
        setTokenCookie(res, token);

        res.json({ 
            status: 'success', 
            message: 'Login exitoso',
            user: user.toJSON(),
            redirect: '/products'
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al iniciar sesión' 
        });
    }
});

// LOGOUT - Cerrar sesión
router.post('/logout', (req, res) => {
    clearTokenCookie(res);
    res.json({ 
        status: 'success', 
        message: 'Sesión cerrada correctamente' 
    });
});

// CURRENT - Obtener usuario actual (requiere JWT)
router.get('/current', authenticateJWT, (req, res) => {
    res.json({ 
        status: 'success', 
        user: req.user 
    });
});

// READ - Obtener todos los usuarios (solo admin)
router.get('/', authenticateJWT, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ 
            status: 'success', 
            users 
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al obtener usuarios' 
        });
    }
});

// READ - Obtener usuario por ID (requiere autenticación)
router.get('/:id', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Usuario no encontrado' 
            });
        }

        res.json({ 
            status: 'success', 
            user 
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al obtener usuario' 
        });
    }
});

// UPDATE - Actualizar usuario (solo el propio usuario o admin)
router.put('/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, age, password } = req.body;

        // Verificar que el usuario solo pueda actualizar su propio perfil o sea admin
        if (req.user.id !== id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                status: 'error', 
                message: 'No tienes permisos para actualizar este usuario' 
            });
        }

        const updateData = { first_name, last_name, email, age };

        // Si se proporciona nueva contraseña, hashearla
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Usuario no encontrado' 
            });
        }

        res.json({ 
            status: 'success', 
            message: 'Usuario actualizado correctamente',
            user: updatedUser 
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al actualizar usuario' 
        });
    }
});

// DELETE - Eliminar usuario (solo admin)
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Usuario no encontrado' 
            });
        }

        res.json({ 
            status: 'success', 
            message: 'Usuario eliminado correctamente' 
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al eliminar usuario' 
        });
    }
});

export default router;