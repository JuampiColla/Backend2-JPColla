import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import Cart from '../models/cart.model.js';
import config from '../src/config/config.js';

// Extractor de JWT desde cookie firmada
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.signedCookies) {
        token = req.signedCookies[config.jwt.cookieName];
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

            // Hashear contraseña con bcrypt usando configuración centralizada
            const hashedPassword = bcrypt.hashSync(password, config.bcrypt.rounds);

            // Determinar rol basado en email del admin configurado
            const role = email === config.admin?.email ? 'admin' : 'user';

            // Crear usuario primero
            const newUser = await User.create({
                first_name,
                last_name,
                email,
                age,
                password: hashedPassword,
                role
            });

            // Crear carrito asociado al usuario
            const newCart = await Cart.create({
                userId: newUser._id.toString(),
                products: [],
                totalPrice: 0
            });

            // Vincular carrito al usuario
            newUser.cart = newCart._id;
            await newUser.save();

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
// Estrategia para validar usuario logueado mediante JWT
const jwtStrategy = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: config.jwt.secret
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
    passport.use('current', jwtStrategy);
    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);
};

export default passport;