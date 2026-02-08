# 🚀 Guía de Inicio Rápido - Proyecto Refactorizado

## ¿Qué cambió?

Este proyecto ha sido completamente refactorizado con:
- ✅ **Arquitectura de Capas** (Clean Architecture)
- ✅ **Configuración Centralizada** (src/config/config.js)
- ✅ **Seguridad de Datos Sensibles** (Variables de entorno)
- ✅ **Separación de Responsabilidades** (Routes → Controllers → Services → DAOs)

---

## 🔧 Configuración Inicial (Para Developer)

### 1. Primer Clone del Proyecto

```bash
git clone <repo-url>
cd "Proyecto Backend2 JPcolla"
```

### 2. Crear Archivo .env

```bash
# Copiar plantilla
cp .env.example .env

# Editar .env con tus valores
# Importante: Agregar MONGODB_URL, JWT_SECRET, etc.
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Iniciar Servidor

```bash
npm start
# Servidor ejecutándose en http://localhost:8080
```

---

## 📁 Estructura del Proyecto

```
proyecto/
├── src/
│   ├── config/
│   │   └── config.js              ← 🔐 Configuración centralizada
│   ├── controllers/
│   │   ├── userController.js       ← Manejo de usuarios
│   │   └── cartController.js       ← Manejo de carrito
│   ├── services/
│   │   ├── authService.js          ← Lógica de autenticación
│   │   └── cartService.js          ← Lógica del carrito
│   └── daos/
│       ├── userDAO.js              ← BD: Operaciones de usuarios
│       └── cartDAO.js              ← BD: Operaciones de carrito
├── routes/
│   ├── api/
│   │   ├── users.routes.js         ← Endpoints de usuarios
│   │   └── carts.routes.js         ← Endpoints de carrito
│   └── ...
├── models/
│   ├── user.model.js               ← Schema de usuario
│   └── cart.model.js               ← Schema de carrito
├── config/
│   ├── passport.config.js          ← Estrategias Passport
│   ├── database.config.js          ← Conexión MongoDB
│   └── ...
├── middlewares/
│   └── jwt.middleware.js           ← Autenticación JWT
├── utils/
│   └── jwt.utils.js                ← Utils de JWT
│
├── .env                            ← 🔒 Variables sensibles (NO commitear)
├── .env.example                    ← Plantilla de .env
├── SECURITY.md                     ← Guía de seguridad
├── ARCHITECTURE.md                 ← Documentación de arquitectura
├── IMPLEMENTATION_SUMMARY.md       ← Resumen de cambios
├── CHECKLIST_FINAL.md              ← Checklist de implementación
└── ...
```

---

## 🔐 Variables de Entorno (.env)

### Requeridas para Desarrollo:

```dotenv
# Ambiente
NODE_ENV=development

# Puerto
PORT=8080

# Base de Datos
MONGODB_URL=mongodb+srv://usuario:contraseña@cluster...
DB_NAME=integrative_practice

# JWT
JWT_SECRET=jwt_secret_key_seguro_2024
JWT_EXPIRES_IN=24h
JWT_COOKIE_NAME=currentUser

# Sesión
SESSION_SECRET=coderSecret2024
SESSION_MAX_AGE=86400000

# Admin
ADMIN_EMAIL=adminCoder@coder.com
ADMIN_PASSWORD=adminCod3r123

# GitHub (Opcional para OAuth)
GITHUB_CLIENT_ID=tu_id_aqui
GITHUB_CLIENT_SECRET=tu_secret_aqui
GITHUB_CALLBACK_URL=http://localhost:8080/api/auth/github/callback

# Seguridad
BCRYPT_ROUNDS=10
LOG_LEVEL=info
```

**⚠️ IMPORTANTE:**
- Nunca commitear `.env` (está en `.gitignore`)
- Usar `.env.example` como referencia
- Mantener secretos seguros en `.env` local

---

## 🏗️ Cómo Funciona la Arquitectura

### Flujo de una Solicitud HTTP

```
1. Client Browser
   POST /api/users/login
   { email, password }
             ↓
2. ROUTES (routes/api/users.routes.js)
   Define el endpoint → Llama a controller
             ↓
3. CONTROLLER (src/controllers/userController.js)
   - Valida que req.body tiene email y password
   - Llama a authService.login()
   - Formatea la respuesta HTTP
             ↓
4. SERVICE (src/services/authService.js)
   - Implementa lógica: buscar usuario, verificar contraseña
   - Llama a userDAO.findByEmail()
   - Retorna usuario autenticado
             ↓
5. DAO (src/daos/userDAO.js)
   - Ejecuta Query Mongoose: User.findOne()
   - Retorna documento BD
             ↓
6. DATABASE (MongoDB)
   ← Retorna usuario
             ↓
7. RESPONSE
   Controller envía al cliente:
   { status: 'success', user: {...} }
```

### Responsabilidad de Cada Capa

| Capa | Responsabilidad | Ubicación |
|---|---|---|
| **Routes** | Definir endpoints HTTP | `routes/api/` |
| **Controllers** | Validar input, orquestar | `src/controllers/` |
| **Services** | Lógica de negocio | `src/services/` |
| **DAOs** | CRUD en base de datos | `src/daos/` |
| **Models** | Esquemas Mongoose | `models/` |
| **Config** | Configuración centralizada | `src/config/` |

---

## 🔒 Cómo Acceder a Configuración

### En Cualquier Archivo

```javascript
import config from '../src/config/config.js';

// Acceder a valores
const PORT = config.port;                    // 8080
const JWT_SECRET = config.jwt.secret;        // jwt_secret_key_seguro_2024
const ADMIN_EMAIL = config.admin.email;      // adminCoder@coder.com
const BCRYPT_ROUNDS = config.bcrypt.rounds;  // 10
const DB_URL = config.database.url;          // mongodb+srv://...
```

**Nunca hagas:**
```javascript
// ❌ MALO - Acceso directo a process.env
const secret = process.env.JWT_SECRET;

// ✅ BUENO - A través de config
const secret = config.jwt.secret;
```

---

## 📚 Documentación Disponible

| Documento | Propósito | Ubicación |
|---|---|---|
| **SECURITY.md** | Guía completa de seguridad | `/SECURITY.md` |
| **ARCHITECTURE.md** | Documentación detallada de arquitectura | `/ARCHITECTURE.md` |
| **IMPLEMENTATION_SUMMARY.md** | Resumen de cambios realizados | `/IMPLEMENTATION_SUMMARY.md` |
| **CHECKLIST_FINAL.md** | Checklist de implementación | `/CHECKLIST_FINAL.md` |

---

## 🧪 Testing de Endpoints

### Registrarse (Nuevo Usuario)

```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "age": 25,
    "password": "segura123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "segura123"
  }'
```

### Ver Carrito (Requiere autenticación)

```bash
# (Primero hacer login para obtener token JWT en cookie)
curl -X GET http://localhost:8080/api/carts \
  -H "Cookie: currentUser=<jwt_token>"
```

### Agregar Producto al Carrito

```bash
curl -X POST http://localhost:8080/api/carts/add \
  -H "Content-Type: application/json" \
  -H "Cookie: currentUser=<jwt_token>" \
  -d '{
    "productId": "1",
    "quantity": 2
  }'
```

---

## 🛠️ Para Developers: Agregar Nueva Feature

### 1. Crear Controller

```javascript
// src/controllers/featureController.js
export default class FeatureController {
  async create(req, res) {
    try {
      const result = await featureService.create(req.body);
      return res.json({ status: 'success', data: result });
    } catch (error) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
  }
}
```

### 2. Crear Service

```javascript
// src/services/featureService.js
export default class FeatureService {
  async create(data) {
    // Validar
    if (!data.name) throw new Error('Name es requerido');
    
    // Delegar a DAO
    return await featureDAO.create(data);
  }
}
```

### 3. Crear DAO

```javascript
// src/daos/featureDAO.js
export default class FeatureDAO {
  async create(data) {
    return await Feature.create(data);
  }
}
```

### 4. Crear Route

```javascript
// routes/api/features.routes.js
router.post('/', (req, res) => featureController.create(req, res));
```

### 5. Registrar en server.js

```javascript
import featuresRouter from './routes/api/features.routes.js';
app.use('/api/features', featuresRouter);
```

---

## 📊 Estado del Servidor

### Verificar que Está Ejecutándose

```bash
# Todos los comandos desde raíz del proyecto

# Ver procesos Node
Get-Process node

# Verificar puerto 8080
netstat -ano | findstr :8080

# Test de conectividad
curl http://localhost:8080/
```

---

## 🆘 Troubleshooting

### Error: "EADDRINUSE: address already in use :::8080"

```bash
# Matar procesos Node existentes
Stop-Process -Name node -Force
```

### Error: "Cannot find module 'config'"

```bash
# Asegúrate de que ruta de importación es correctly relativa
import config from '../src/config/config.js';
```

### Error: "MONGODB connection failed"

```bash
# Verificar que MONGODB_URL en .env es correcto
cat .env | grep MONGODB_URL

# Asegúrate de que string de conexión es valid
```

### "JWT token is missing"

```bash
# Verificar que la cookie está siendo enviada
# En browser console:
document.cookie

# O en curl:
curl -i http://localhost:8080/api/carts
# Debería tener Set-Cookie header
```

---

## 💡 Buenas Prácticas

✅ **DO:**
- Hacer fetch con `credentials: 'include'` para enviar cookies
- Usar `config` para acceder a configuración
- Validar inputs en Controller Y Service
- Mantener `.env` fuera del repositorio
- Documentar endpoints en comentarios

❌ **DON'T:**
- No commits de `.env`
- No acceso BD desde Controller
- No lógica en Routes
- No hardcodeados tokens/secrets
- No cambiar `src/config/config.js` en producción

---

## 📞 Recursos

- [SECURITY.md](SECURITY.md) - Seguridad detallada
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitectura detallada
- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Passport.js Docs](http://www.passportjs.org/)

---

## ✅ Checklist de Setup Inicial

- [ ] Clonar repositorio
- [ ] Crear `.env` desde `.env.example`
- [ ] Completar variables de entorno
- [ ] `npm install`
- [ ] `npm start`
- [ ] Verificar servidor en http://localhost:8080
- [ ] Leer SECURITY.md
- [ ] Leer ARCHITECTURE.md
- [ ] Entender flujo de capas
- [ ] Probar endpoint de login

---

**¡Proyecto listo para desarrollo! 🎉**

Para preguntas sobre arquitectura o seguridad, ver documentación asociada.

