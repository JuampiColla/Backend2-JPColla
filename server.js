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
import { loadUser } from './middlewares/jwt.middleware.js';

// Importar rutas
import authRouter from './routes/auth.routes.js';
import productsRouter from './routes/products.routes.js';
import viewsRouter from './routes/views.routes.js';
import usersApiRouter from './routes/api/users.routes.js';
import usersViewsRouter from './routes/users.routes.js';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

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
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser(process.env.SESSION_SECRET || 'coderSecret2024'));

// Configuración de sesiones (para compatibilidad con Passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'coderSecret2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
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

// Rutas de autenticación con Passport (GitHub OAuth)
app.use('/api/auth', authRouter);

// Rutas de productos - VISTAS
app.use('/products', viewsRouter);

// Rutas de productos - API
app.use('/api/products', productsRouter);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 - No encontrado',
        message: 'La página que buscas no existe'
    });
});

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
    console.log(`🌐 Accede en: http://localhost:${PORT}`);
    console.log(`📝 Login: http://localhost:${PORT}/users/login`);
    console.log('='.repeat(50));
});