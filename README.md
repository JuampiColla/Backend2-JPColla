# Sistema de Autenticación Completo - Backend II

Sistema de autenticación profesional con **MongoDB Atlas**, **JWT**, **Passport.js**, **bcrypt** y **GitHub OAuth 2.0**.

## 🎯 Características Principales

### ✅ Base de Datos MongoDB Atlas
- Base de datos: `integrative_practice`
- Colección: `users`
- Schema con Mongoose
- Índices optimizados

### ✅ Autenticación JWT
- Tokens firmados con cookie HttpOnly
- Expiración de 24 horas
- Cookie firmada y segura
- Middleware de autenticación

### ✅ CRUD Completo de Usuarios
- **CREATE**: Registro con contraseñas hasheadas
- **READ**: Listar usuarios (solo admin) y usuario por ID
- **UPDATE**: Actualizar perfil (propio usuario o admin)
- **DELETE**: Eliminar usuarios (solo admin)

### ✅ Sistema de Roles
- **Admin**: Gestión completa del sistema
- **User**: Acceso a funcionalidades básicas

### ✅ Seguridad Avanzada
- bcrypt con 10 rondas de sal
- Cookies firmadas
- Middleware de autenticación
- Validación de roles

## 📁 Estructura del Proyecto

```
proyecto/
├── config/
│   ├── database.config.js      # Conexión MongoDB Atlas
│   └── passport.config.js      # Estrategias de Passport
├── models/
│   └── user.model.js           # Schema de Usuario (Mongoose)
├── middlewares/
│   └── jwt.middleware.js       # Middlewares de autenticación JWT
├── utils/
│   └── jwt.utils.js            # Funciones JWT
├── routes/
│   ├── api/
│   │   └── users.routes.js     # API CRUD de usuarios
│   ├── auth.routes.js          # Autenticación con Passport
│   ├── products.routes.js      # API de productos
│   ├── users.routes.js         # Vistas de usuarios
│   └── views.routes.js         # Vistas de productos
├── views/
│   ├── layouts/
│   │   └── main.handlebars
│   ├── userLogin.handlebars    # Login con JWT
│   ├── userRegister.handlebars # Registro
│   ├── current.handlebars      # Perfil de usuario
│   ├── login.handlebars        # Login con Passport
│   ├── register.handlebars     # Registro con Passport
│   └── products.handlebars     # Productos
├── public/
│   └── css/
│       └── styles.css
├── server.js
├── package.json
├── .env.example
└── .gitignore
```

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/JuampiColla/Proyecto-Backend2-JPColla.git
cd Proyecto-Backend2-JPColla
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un nuevo cluster
3. Crea una base de datos llamada `integrative_practice`
4. Crea un usuario de base de datos
5. Obtén tu connection string

### 4. Crear archivo `.env`

```env
# Servidor
PORT=8080
SESSION_SECRET=coderSecret2024

# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/integrative_practice?retryWrites=true&w=majority

# JWT
JWT_SECRET=jwt_secret_key_2024
JWT_COOKIE_NAME=currentUser

# GitHub OAuth (opcional)
GITHUB_CLIENT_ID=tu_client_id
GITHUB_CLIENT_SECRET=tu_client_secret
GITHUB_CALLBACK_URL=http://localhost:8080/api/auth/github/callback

# Admin
ADMIN_EMAIL=adminCoder@coder.com
ADMIN_PASSWORD=adminCod3r123
```

### 5. Iniciar el servidor
```bash
npm start
```

O en modo desarrollo:
```bash
npm run dev
```

### 6. Acceder
```
http://localhost:8080
```

## 🗺️ Rutas del Sistema

### 🔐 Autenticación JWT (`/api/users`)

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/api/users/register` | Registrar usuario | No |
| POST | `/api/users/login` | Login con JWT | No |
| POST | `/api/users/logout` | Cerrar sesión | No |
| GET | `/api/users/current` | Usuario actual | JWT |
| GET | `/api/users` | Listar usuarios | JWT + Admin |
| GET | `/api/users/:id` | Usuario por ID | JWT |
| PUT | `/api/users/:id` | Actualizar usuario | JWT + Owner/Admin |
| DELETE | `/api/users/:id` | Eliminar usuario | JWT + Admin |

### 👁️ Vistas de Usuarios (`/users`)

| Ruta | Descripción | Autenticación |
|------|-------------|---------------|
| `/users/login` | Vista de login | No autenticado |
| `/users/register` | Vista de registro | No autenticado |
| `/users/current` | Perfil del usuario | JWT requerido |

### 🔑 Autenticación Passport (`/api/auth`)

| Ruta | Descripción |
|------|-------------|
| `POST /api/auth/register` | Registro con Passport |
| `POST /api/auth/login` | Login con Passport |
| `GET /api/auth/github` | OAuth con GitHub |
| `GET /api/auth/github/callback` | Callback GitHub |
| `POST /api/auth/logout` | Logout Passport |

## 📊 Schema de Usuario (Mongoose)

```javascript
{
  first_name: String,     // Requerido
  last_name: String,      // Requerido
  email: String,          // Único, requerido
  role: String,           // 'user' o 'admin' (default: 'user')
  password: String,       // Hash bcrypt
  age: Number,            // Opcional
  provider: String,       // 'local' o 'github'
  githubId: String,       // Opcional
  avatar: String,         // Opcional
  timestamps: true        // createdAt, updatedAt
}
```

## 🔒 Flujo de Autenticación JWT

### Registro
1. Usuario envía datos a `/api/users/register`
2. Se valida que el email no exista
3. Contraseña se hashea con bcrypt (10 rondas)
4. Se crea usuario en MongoDB
5. Se genera JWT con datos del usuario
6. JWT se almacena en cookie firmada `currentUser`
7. Redirección a `/users/current`

### Login
1. Usuario envía credenciales a `/api/users/login`
2. Se busca usuario por email en MongoDB
3. Se verifica contraseña con bcrypt.compare()
4. Se genera JWT
5. JWT se almacena en cookie firmada
6. Redirección a `/users/current`

### Validación de Rutas
1. Middleware lee cookie `currentUser`
2. Verifica firma de la cookie
3. Decodifica JWT
4. Valida expiración
5. Agrega user a `req.user`
6. Permite o deniega acceso

## 🛡️ Seguridad Implementada

### Contraseñas
```javascript
// Hash al registrar
const hashedPassword = await bcrypt.hash(password, 10);

// Verificar al autenticar
const isValid = await bcrypt.compare(password, user.password);
```

### JWT
```javascript
// Generar token
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

// Verificar token
const decoded = jwt.verify(token, JWT_SECRET);
```

### Cookie Firmada
```javascript
res.cookie('currentUser', token, {
    httpOnly: true,      // No accesible desde JavaScript
    signed: true,        // Firma criptográfica
    maxAge: 86400000,    // 24 horas
    sameSite: 'strict'   // Protección CSRF
});
```

## 🎨 Middlewares de Seguridad

### `authenticateJWT`
Valida JWT para rutas de API
```javascript
router.get('/protected', authenticateJWT, (req, res) => {
    // req.user contiene datos del token
});
```

### `isAuthenticated`
Valida JWT para vistas (redirecciona)
```javascript
router.get('/current', isAuthenticated, (req, res) => {
    // Usuario autenticado
});
```

### `isNotAuthenticated`
Impide acceso si está autenticado
```javascript
router.get('/login', isNotAuthenticated, (req, res) => {
    // Solo usuarios no autenticados
});
```

### `isAdmin`
Valida rol de administrador
```javascript
router.delete('/users/:id', authenticateJWT, isAdmin, (req, res) => {
    // Solo administradores
});
```

## 📝 Ejemplos de Uso

### Registrar Usuario
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "age": 25,
    "password": "contraseña123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "contraseña123"
  }'
```

### Obtener Usuario Actual
```bash
curl http://localhost:8080/api/users/current \
  --cookie "currentUser=TOKEN_JWT"
```

## 🔍 Validaciones Implementadas

### En Registro
- ✅ Todos los campos obligatorios presentes
- ✅ Email no existe en la base de datos
- ✅ Email tiene formato válido (Mongoose)
- ✅ Contraseña mínimo 6 caracteres (frontend)

### En Login
- ✅ Credenciales proporcionadas
- ✅ Usuario existe en MongoDB
- ✅ Contraseña coincide con bcrypt

### En Rutas Protegidas
- ✅ Token JWT presente
- ✅ Token válido y no expirado
- ✅ Usuario tiene permisos necesarios

## 🎯 Características de Seguridad

| Característica | Implementación |
|---------------|----------------|
| Hash de contraseñas | bcrypt (10 rondas) |
| Tokens | JWT firmados |
| Cookies | HttpOnly + Signed |
| Sesiones | 24 horas de expiración |
| Base de datos | MongoDB Atlas (cloud) |
| Validación | Mongoose schemas |
| CSRF Protection | SameSite cookies |
| Roles | Admin / User |

## 🚀 Mejoras Futuras

- [ ] Refresh tokens
- [ ] Two-Factor Authentication (2FA)
- [ ] Recuperación de contraseña por email
- [ ] Rate limiting
- [ ] Logs de auditoría
- [ ] Validación de email
- [ ] OAuth con Google, Facebook
- [ ] Tests unitarios e integración

## 📄 Variables de Entorno Requeridas

```env
MONGODB_URI      # Obligatorio - Connection string de MongoDB Atlas
JWT_SECRET       # Obligatorio - Clave secreta para firmar JWT
PORT             # Opcional - Puerto del servidor (default: 8080)
SESSION_SECRET   # Obligatorio - Secreto para firmar cookies
JWT_COOKIE_NAME  # Opcional - Nombre de la cookie (default: currentUser)
```

## 🐛 Troubleshooting

### Error de conexión a MongoDB
- Verifica tu IP en Network Access de MongoDB Atlas
- Comprueba el usuario y contraseña en el connection string
- Asegúrate de que la base de datos existe

### JWT inválido
- Verifica que JWT_SECRET sea el mismo
- Comprueba que la cookie no haya expirado
- Asegúrate de que cookieParser esté configurado

### No redirige después del login
- Verifica que el token se esté guardando en la cookie
- Comprueba la consola del navegador

## 📚 Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **MongoDB Atlas** - Base de datos en la nube
- **Mongoose** - ODM para MongoDB
- **JWT** - JSON Web Tokens
- **bcrypt** - Hash de contraseñas
- **Passport.js** - Autenticación (GitHub OAuth)
- **Handlebars** - Motor de plantillas
- **cookie-parser** - Manejo de cookies firmadas

## 👨‍💻 Autor

Proyecto desarrollado para CoderHouse - Backend II

## 📄 Licencia

ISC

---

**🔐 Sistema de autenticación profesional con JWT y MongoDB Atlas**