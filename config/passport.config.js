import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github2';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Almacenamiento temporal de usuarios (en producción usar base de datos)
const users = [];

// Configuración de Passport Local Strategy para Registro
export const registerStrategy = new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    async (req, email, password, done) => {
        try {
            // Verificar si el usuario ya existe
            const userExists = users.find(u => u.email === email);
            if (userExists) {
                return done(null, false, { message: 'El usuario ya existe' });
            }

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Determinar el rol del usuario
            let role = 'usuario';
            if (email === process.env.ADMIN_EMAIL) {
                role = 'admin';
            }

            // Crear nuevo usuario
            const newUser = {
                id: users.length + 1,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email,
                age: req.body.age,
                password: hashedPassword,
                role,
                provider: 'local'
            };

            users.push(newUser);

            // Usuario creado sin la contraseña
            const userWithoutPassword = {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                age: newUser.age,
                role: newUser.role,
                provider: newUser.provider
            };

            return done(null, userWithoutPassword);
        } catch (error) {
            return done(error);
        }
    }
);

// Configuración de Passport Local Strategy para Login
export const loginStrategy = new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            // Verificar credenciales del admin (puede usar contraseña sin hashear para el admin predefinido)
            if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                const adminUser = {
                    email,
                    role: 'admin',
                    firstName: 'Admin',
                    lastName: 'Coder',
                    provider: 'local'
                };
                return done(null, adminUser);
            }

            // Buscar usuario en la base de datos
            const user = users.find(u => u.email === email);

            if (!user) {
                return done(null, false, { message: 'Credenciales inválidas' });
            }

            // Verificar contraseña
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return done(null, false, { message: 'Credenciales inválidas' });
            }

            // Usuario autenticado sin la contraseña
            const userWithoutPassword = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                age: user.age,
                role: user.role,
                provider: user.provider
            };

            return done(null, userWithoutPassword);
        } catch (error) {
            return done(error);
        }
    }
);

// Configuración de Passport GitHub Strategy
export const githubStrategy = new GitHubStrategy(
    {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Buscar usuario por GitHub ID
            let user = users.find(u => u.githubId === profile.id);

            if (!user) {
                // Crear nuevo usuario desde GitHub
                const newUser = {
                    id: users.length + 1,
                    githubId: profile.id,
                    firstName: profile.displayName || profile.username,
                    lastName: '',
                    email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
                    role: 'usuario',
                    provider: 'github',
                    avatar: profile.photos?.[0]?.value
                };

                users.push(newUser);
                user = newUser;
            }

            // Usuario sin datos sensibles
            const userWithoutPassword = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                age: user.age,
                role: user.role,
                provider: user.provider,
                avatar: user.avatar
            };

            return done(null, userWithoutPassword);
        } catch (error) {
            return done(error);
        }
    }
);

// Serialización y deserialización del usuario
export const serializeUser = (user, done) => {
    done(null, user.email);
};

export const deserializeUser = (email, done) => {
    // Admin especial
    if (email === process.env.ADMIN_EMAIL) {
        const adminUser = {
            email,
            role: 'admin',
            firstName: 'Admin',
            lastName: 'Coder',
            provider: 'local'
        };
        return done(null, adminUser);
    }

    const user = users.find(u => u.email === email);
    if (user) {
        const userWithoutPassword = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            age: user.age,
            role: user.role,
            provider: user.provider,
            avatar: user.avatar
        };
        done(null, userWithoutPassword);
    } else {
        done(new Error('Usuario no encontrado'));
    }
};

// Función para inicializar Passport
export const initializePassport = () => {
    passport.use('register', registerStrategy);
    passport.use('login', loginStrategy);
    passport.use('github', githubStrategy);
    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);
};

export default passport;