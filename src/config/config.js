import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  // Ambiente
  environment: process.env.NODE_ENV || 'development',
  
  // Puerto
  port: process.env.PORT || 8080,
  
  // Base de Datos
  database: {
      url: process.env.MONGODB_URL || 'mongodb+srv://usuario:contraseña@cluster.mongodb.net/test',
      name: process.env.DB_NAME || 'test'
  },
  
  // JWT
  jwt: {
      secret: process.env.JWT_SECRET || 'tu-secret-jwt',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      cookieName: process.env.JWT_COOKIE_NAME || 'currentUser'
  },
  
  // Sesión
  session: {
      secret: process.env.SESSION_SECRET || 'coderSecret2024',
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000') // 24 horas en ms
  },
  
  // Admin - Credenciales de administrador
  admin: {
      email: process.env.ADMIN_EMAIL || 'adminCoder@coder.com',
      password: process.env.ADMIN_PASSWORD || 'adminCod3r123'
  },
  
  // Rutas
  paths: {
      root: path.join(__dirname, '../../'),
      views: path.join(__dirname, '../../views'),
      public: path.join(__dirname, '../../public'),
      uploads: path.join(__dirname, '../../public/uploads')
  },
  
  // GitHub OAuth (opcional)
  github: {
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:8080/api/auth/github/callback'
  },
  
  // Bcrypt
  bcrypt: {
      rounds: parseInt(process.env.BCRYPT_ROUNDS || '10')
  },
  
  // Email
  email: {
    // Mailtrap (actual)
    smtpHost: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    smtpPort: parseInt(process.env.SMTP_PORT || '2525'),
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || 'noreply@ecommerce.com'
  },
  
  // Aplicación
  app: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',
    resetPasswordExpiresIn: 3600000, // 1 hora en ms
    minPasswordChangeDays: 24 // Días mínimos entre cambios
  },
  
  // Utilidades
  logging: {
      level: process.env.LOG_LEVEL || 'info'
  }
};

export default config;
