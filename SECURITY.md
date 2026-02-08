# 🔒 Guía de Seguridad y Configuración

## Variables de Entorno

### ✅ Implementado

Este proyecto implementa **seguridad de grado producción** con variables de entorno centralizadas.

#### 1. **Archivo `.env` (No versionado)**
- Contiene todas las variables sensibles
- **NUNCA** debe commitirse a Git  
- Incluido en `.gitignore`
- Solo para desarrollo local

#### 2. **Archivo `.env.example` (Versionado)**
- Plantilla para nuevos desarrolladores
- Contiene estructura y valores de ejemplo solo
- Permite documentar qué variables son necesarias

#### 3. **Archivo `src/config/config.js` (Centralizado)**
- Punto único de configuración de toda la aplicación
- Lee variables de entorno de forma segura
- Proporciona valores por defecto seguros
- Exporta un objeto de configuración reutilizable

---

## Datos Sensibles Protegidos

### Secretos Centralizados:

```javascript
// JWT
JWT_SECRET        → Secreto para firmar tokens
JWT_EXPIRES_IN    → Duración del token (24h)
JWT_COOKIE_NAME   → Nombre de la cookie JWT

// Sesión
SESSION_SECRET    → Secreto para cifrar sesiones
SESSION_MAX_AGE   → Duración de sesión (24h)

// Base de Datos
MONGODB_URL       → Cadena de conexión (URI con credenciales)
DB_NAME           → Nombre de la base de datos

// Autenticación
ADMIN_EMAIL       → Email del administrador
ADMIN_PASSWORD    → Contraseña del admin (hasheada en BD)

// GitHub OAuth
GITHUB_CLIENT_ID  → ID de aplicación GitHub
GITHUB_CLIENT_SECRET → Secret de aplicación GitHub

// Seguridad
BCRYPT_ROUNDS     → Iteraciones para hash de contraseñas
```

---

## Arquitectura de Seguridad

### **Antes (❌ Inseguro):**
```javascript
// ❌ Hardcodeado en código
const JWT_SECRET = 'jwt_secret_key_2024';
const MONGODB_URL = 'mongodb+srv://user:pass@cluster...';
const ADMIN_EMAIL = 'admin@example.com';

// ❌ Disperso en múltiples archivos
// jwt.utils.js → process.env.JWT_SECRET
// passport.config.js → process.env.JWT_COOKIE_NAME  
// database.config.js → process.env.MONGODB_URI
```

### **Ahora (✅ Seguro):**
```javascript
// ✅ Centralizado en config.js
import config from './src/config/config.js';

// Acceso consistente desde cualquier module
config.jwt.secret
config.database.url
config.admin.email
config.bcrypt.rounds
```

---

## Flujo de Configuración

```
.env (secreto, no versionado)
  ↓
dotenv.config() en config.js
  ↓
process.env.VARIABLE_NAME
  ↓
config.js export
  ↓
Importado en: jwt.utils.js, passport.config.js, database.config.js, server.js
```

---

## Checklist de Seguridad ✅

- ✅ **Configuración centralizada**: `src/config/config.js`
- ✅ **Variables de entorno**: Todas en `.env`
- ✅ **.env en .gitignore**: Protegido del repositorio
- ✅ **Secretos no hardcodeados**: Todos vienen de config
- ✅ **Separación de responsabilidades**: Cada capa usa config
- ✅ **.env.example documentado**: Plantilla clara para developers
- ✅ **Admin email configurado**: `config.admin.email`
- ✅ **Bcrypt centralizado**: `config.bcrypt.rounds`
- ✅ **JWT centralizado**: Secret y expiración en config
- ✅ **Sesión centralizada**: Secret y maxAge en config

---

## Cómo Usar en la Aplicación

### Importar configuración:
```javascript
import config from '../src/config/config.js';

// Usar valores de configuración
const PORT = config.port;
const JWT_SECRET = config.jwt.secret;
const BCRYPT_ROUNDS = config.bcrypt.rounds;
const ADMIN_EMAIL = config.admin.email;
```

### Archivos que usan centralización:

1. **server.js**: Puerto, configuración de sesión
2. **jwt.utils.js**: JWT secret, expiración, nombre cookie
3. **passport.config.js**: Admin email, bcrypt rounds, JWT secret
4. **database.config.js**: MongoDB URL y nombre BD
5. **Controladores y Servicios**: Heredan config a través de dependencias

---

## Implementación en Capas

### **Responsabilidades Delegadas:**

#### **Config Layer** (src/config/config.js)
- Lee variables de entorno
- Centraliza toda configuración
- Proporciona valores por defecto

#### **Controller Layer** (src/controllers/)
- Recibe config a través de servicios
- NO accede directamente a process.env
- NO tiene credenciales hardcodeadas

#### **Service Layer** (src/services/)
- Recibe config del controlador
- Usa configuración para lógica de negocio
- NO almacena secretos

#### **DAO Layer** (src/daos/)
- Operaciones de base de datos puras
- NO accede a variables de entorno
- Usa configuración solo si es necesario

---

## Testing en Equipos

### Para new developers:

1. **Clonar repo**
   ```bash
   git clone <repo>
   cd proyecto
   ```

2. **Crear archivo .env**
   ```bash
   cp .env.example .env
   ```

3. **Actualizar valores en .env**
   ```
   NODE_ENV=development
   PORT=8080
   MONGODB_URL=<tu_mongodb_url>
   JWT_SECRET=<tunguera_secret>
   # ... etc
   ```

4. **Instalar y ejecutar**
   ```bash
   npm install
   npm start
   ```

---

## Buenas Prácticas Aplicadas

1. ✅ **Ningún secreto en código fuente**
2. ✅ **Configuración centralizada y única**
3. ✅ **Valores por defecto para desarrollo**
4. ✅ **Separación dev/production**
5. ✅ **Documentación clara de variables**
6. ✅ **Protección de .env en Git**
7. ✅ **Arquitectura de capas limpia**
8. ✅ **Sin circular dependencies**

---

## Próximas Mejoras (Opcionales)

- [ ] Usar **AWS Secrets Manager** en producción
- [ ] Implementar **vault.io** para gestión de secretos
- [ ] Agregar **validación de variables** al startup
- [ ] Implementar **rotación de secretos**
- [ ] Usar **environment-specific configs**

