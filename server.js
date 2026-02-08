import express from 'express';
import session from 'express-session';
import handlebars from 'express-handlebars';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import passport from 'passport';
import { initializePassport } from './config/passport.config.js';
import { connectDB } from './config/database.config.js';
import { loadUser, isAuthenticated } from './middlewares/jwt.middleware.js';
import config from './src/config/config.js';

// Importar rutas
import authRouter from './routes/auth.routes.js';
import productsRouter from './routes/products.routes.js';
import viewsRouter from './routes/views.routes.js';
import usersApiRouter from './routes/api/users.routes.js';
import usersViewsRouter from './routes/users.routes.js';
import sessionsRouter from './routes/api/sessions.routes.js';
import cartsRouter from './routes/api/carts.routes.js';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Conectar a MongoDB
connectDB();

// Configuración de Handlebars con helpers
const hbs = handlebars.create({
    helpers: {
        eq: (a, b) => a === b,
        gt: (a, b) => a > b,
        substring: (str, start, end) => {
            if (typeof str === 'string') {
                return str.substring(start, end);
            }
            return '';
        }
    }
});

app.engine('handlebars', hbs.engine);
app.set('views', config.paths.views);
app.set('view engine', 'handlebars');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(config.paths.public));
app.use(cookieParser(config.session.secret));

// Configuración de sesiones (para compatibilidad con Passport)
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: config.session.maxAge
    }
}));

// Inicializar Passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// Middleware para cargar usuario desde JWT
app.use(loadUser);

// Rutas
// Ruta raíz - redirigir a /users/login
app.get('/', (req, res) => {
    res.redirect('/users/login');
});

// Rutas de vistas de usuarios (JWT)
app.use('/users', usersViewsRouter);

// Rutas de API de usuarios (JWT + CRUD)
app.use('/api/users', usersApiRouter);

// Rutas de sesiones (JWT)
app.use('/api/sessions', sessionsRouter);

// Rutas de autenticación con Passport (GitHub OAuth)
app.use('/api/auth', authRouter);

// Rutas de productos - VISTAS
app.use('/products', viewsRouter);

// Rutas de productos - API
app.use('/api/products', productsRouter);

// Rutas de carrito
app.use('/api/carts', cartsRouter);

// Vista de carrito
app.get('/cart', isAuthenticated, (req, res) => {
    res.render('cart', {
        title: 'Carrito',
        user: req.user
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 - No encontrado',
        message: 'La página que buscas no existe'
    });
});

app.listen(config.port, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Servidor escuchando en el puerto ${config.port}`);
    console.log(`🌐 Accede en: http://localhost:${config.port}`);
    console.log(`📝 Login: http://localhost:${config.port}/users/login`);
    console.log(`✅ Environment: ${config.environment}`);
    console.log('='.repeat(50));
});