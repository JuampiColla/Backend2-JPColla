import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import Cart from '../models/cart.model.js';

// Extractor de JWT desde cookie firmada
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.signedCookies) {
        token = req.signedCookies[process.env.JWT_COOKIE_NAME || 'currentUser'];
    }
    return token;
};

// ==================== ESTRATEGIA LOCAL - REGISTRO ====================
const registerStrategy = new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    async (req, email, password, done) => {
        try {
            const { first_name, last_name, age } = req.body;

            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return done(null, false, { message: 'El usuario ya existe' });
            }

            // ⭐ REQUISITO: Hashear contraseña con bcrypt.hashSync
            const hashedPassword = bcrypt.hashSync(password, 10);

            // ⭐ REQUISITO: Crear carrito para el usuario
            const newCart = await Cart.create({ products: [] });

            // Determinar rol
            const role = email === 'adminCoder@coder.com' ? 'admin' : 'user';

            // ⭐ REQUISITO: Crear usuario con campo cart
            const newUser = await User.create({
                first_name,
                last_name,
                email,
                age,
                password: hashedPassword,
                cart: newCart._id,
                role
            });

            return done(null, newUser);
        } catch (error) {
            return done(error);
        }
    }
);

// ==================== ESTRATEGIA LOCAL - LOGIN ====================
const loginStrategy = new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            // Buscar usuario y poblar carrito
            const user = await User.findOne({ email }).populate('cart');

            if (!user) {
                return done(null, false, { message: 'Credenciales inválidas' });
            }

            // Verificar contraseña
            const isValidPassword = bcrypt.compareSync(password, user.password);

            if (!isValidPassword) {
                return done(null, false, { message: 'Credenciales inválidas' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
);

// ==================== ESTRATEGIA JWT - "CURRENT" ====================
// ⭐ REQUISITO: Estrategia para validar usuario logueado mediante JWT
const jwtStrategy = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_SECRET || 'jwt_secret_key_2024'
    },
    async (jwt_payload, done) => {
        try {
            // Buscar usuario y poblar carrito con productos
            const user = await User.findById(jwt_payload.id)
                .select('-password')
                .populate({
                    path: 'cart',
                    populate: {
                        path: 'products.product'
                    }
                });

            if (!user) {
                return done(null, false, { message: 'Usuario no encontrado' });
            }

            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    }
);

// ==================== SERIALIZACIÓN ====================
const serializeUser = (user, done) => {
    done(null, user._id);
};

const deserializeUser = async (id, done) => {
    try {
        const user = await User.findById(id)
            .select('-password')
            .populate('cart');
        done(null, user);
    } catch (error) {
        done(error);
    }
};

// ==================== INICIALIZACIÓN ====================
export const initializePassport = () => {
    passport.use('register', registerStrategy);
    passport.use('login', loginStrategy);
    passport.use('current', jwtStrategy); // ⭐ REQUISITO: Estrategia JWT
    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);
};

export default passport;