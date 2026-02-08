# 🏗️ Arquitectura de Capas - Documentación

## Visión General

Este proyecto implementa una **arquitectura de capas** con separación clara de responsabilidades siguiendo principios de **Clean Architecture** y **SOLID**.

```
┌─────────────────────────────────────────────────┐
│         REQUEST / RESPONSE (HTTP)               │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   ROUTES Layer      │  ← routes/
        │  (Routing)          │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │ CONTROLLER Layer    │  ← src/controllers/
        │ (Request Handling)  │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  SERVICE Layer      │  ← src/services/
        │ (Business Logic)    │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │    DAO Layer        │  ← src/daos/
        │ (Data Access)       │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   MODEL Layer       │  ← models/
        │  (Data Schema)      │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   DATABASE          │
        │ (MongoDB Atlas)     │
        └─────────────────────┘

        ┌─────────────────────┐
        │  CONFIG Layer       │
        │ (src/config/        │
        │  Configuración)     │
        └─────────────────────┘
        
        (Inyectado en todas las capas)
```

---

## Descripción de Capas

### 1️⃣ **ROUTES Layer** (`routes/`)

**Responsabilidades:**
- Definir endpoints HTTP
- Asociar métodos HTTP a controladores
- Aplicar middlewares de autenticación/autorización

**Archivos Clave:**
- `routes/api/users.routes.js` → Endpoints de usuarios
- `routes/api/carts.routes.js` → Endpoints de carrito
- `routes/api/products.routes.js` → Endpoints de productos

**Ejemplo:**
```javascript
router.post('/register', (req, res) => userController.register(req, res));
router.post('/login', (req, res) => userController.login(req, res));
```

**¿Qué NO hace?**
- ❌ Lógica de negocio
- ❌ Acceso a base de datos
- ❌ Validaciones complejas

---

### 2️⃣ **CONTROLLER Layer** (`src/controllers/`)

**Responsabilidades:**
- **Recibir** requests HTTP
- **Validar** datos de entrada
- **Intermediar** entre Routes y Services
- **Formatear** y **enviar** responses

**Archivos Clave:**
- `src/controllers/userController.js`
- `src/controllers/cartController.js`

**Patrón:**
```javascript
class UserController {
  async register(req, res) {
    try {
      // Extraer datos
      const { email, password } = req.body;
      
      // Delegar al servicio
      const user = await authService.register(...);
      
      // Formatear respuesta
      return res.status(201).json({ status: 'success', user });
    } catch (error) {
      return res.status(400).json({ status: 'error', message });
    }
  }
}
```

**¿Qué NO hace?**
- ❌ Lógica de negocio (eso va en Service)
- ❌ Acceso directo a BD (eso va en DAO)

---

### 3️⃣ **SERVICE Layer** (`src/services/`)

**Responsabilidades:**
- **Implementar** toda la lógica de negocio
- **Orquestar** operaciones complejas
- **Validaciones** de reglas de negocio
- **Transformar** datos

**Archivos Clave:**
- `src/services/authService.js` → Lógica de registro/login/JWT
- `src/services/cartService.js` → Lógica del carrito

**Patrón:**
```javascript
class AuthService {
  async register(email, password, ...) {
    // Validaciones de negocio
    const exists = await userDAO.exists(email);
    if (exists) throw new Error('Usuario existe');
    
    // Hash de contraseña
    const hashed = await bcrypt.hash(password, config.bcrypt.rounds);
    
    // Delegar acceso a datos
    const user = await userDAO.createUser({ email, password: hashed });
    
    // Retornar dato de negocio
    return user;
  }
}
```

**Ejemplo de Orquestación:**
```javascript
async addProductToCart(userId, productId, quantity) {
  // 1. Validar producto existe
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) throw new Error('Producto no existe');
  
  // 2. Obtener/crear carrito
  let cart = await cartDAO.findByUserId(userId);
  if (!cart) cart = await cartDAO.createCart(userId);
  
  // 3. Agregar producto
  return await cartDAO.addProduct(cart._id, productId, quantity);
}
```

**¿Qué NO hace?**
- ❌ Acceso directo a base de datos (delega a DAO)
- ❌ Acceso HTTP (eso va en Controller)

---

### 4️⃣ **DAO Layer** (`src/daos/`)

**Responsabilidades:**
- **SOLO** operaciones de base de datos
- **CRUD** simple: Create, Read, Update, Delete
- **Traducción** entre mongoose y aplicación
- **Abstracción** de la BD

**Archivos Clave:**
- `src/daos/userDAO.js` → Operaciones BD de usuarios
- `src/daos/cartDAO.js` → Operaciones BD de carrito

**Patrón:**
```javascript
class UserDAO {
  async createUser(userData) {
    // SOLO acceso BD
    const user = await User.create(userData);
    return user;
  }
  
  async findByEmail(email) {
    return await User.findOne({ email });
  }
  
  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }
}
```

**¿Qué NO hace?**
- ❌ Lógica de negocio (eso va en Service)
- ❌ Validaciones complejas
- ❌ Manejo HTTP

---

### 5️⃣ **MODEL Layer** (`models/`)

**Responsabilidades:**
- **Definir** esquemas de datos (Mongoose)
- **Validaciones** a nivel de BD
- **Relaciones** entre modelos

**Archivos Clave:**
- `models/user.model.js` → Schema de usuario
- `models/cart.model.js` → Schema de carrito

**Patrón:**
```javascript
const userSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  first_name: { type: String, required: true },
  cart: { type: Schema.Types.ObjectId, ref: 'Cart' }
});
```

---

### 6️⃣ **CONFIG Layer** (`src/config/`)

**Responsabilidades:**
- **Leer** variables de entorno
- **Centralizar** todas las configuraciones
- **Proporcionar** valores por defecto seguros
- **Inyectar** en otras capas

**Archivos Clave:**
- `src/config/config.js` → Configuración centralizada

**Uso en otras capas:**
```javascript
// En cualquier archivo
import config from '../src/config/config.js';

// Acceder a configuración
const PORT = config.port;
const JWT_SECRET = config.jwt.secret;
const BCRYPT_ROUNDS = config.bcrypt.rounds;
const ADMIN_EMAIL = config.admin.email;
```

---

## Flujo de Datos - Ejemplo Completo

### Caso: **Registrar Usuario**

```
1. BROWSER
   POST /api/users/register
   { email, password, firstname, lastname }
          ↓
2. ROUTES
   routes/api/users.routes.js
   → router.post('/register', userController.register)
          ↓
3. CONTROLLER
   src/controllers/userController.js
   → async register(req, res) {
       const { email, password, ... } = req.body;
       const user = await authService.register(...);
       return res.status(201).json({ user });
     }
          ↓
4. SERVICE
   src/services/authService.js
   → async register(email, password, ...) {
       // Validar no existe
       if (userDAO.exists(email)) throw Error('existe');
       
       // Hash contraseña
       const hashed = await bcrypt.hash(password, config.bcrypt.rounds);
       
       // Crear usuario
       const user = await userDAO.createUser({ 
         email, 
         password: hashed 
       });
       
       return user;
     }
          ↓
5. DAO
   src/daos/userDAO.js
   → async createUser(userData) {
       return await User.create(userData);
     }
          ↓
6. MODEL
   models/user.model.js
   → userSchema.validate() → pre-save hooks
          ↓
7. DATABASE
   MongoDB Atlas
   → db.users.insertOne({email, password, ...})
          ↓
8. RESPONSE
   CONTROLLER retorna al navegador
   { status: 'success', user: {...} }
```

---

## Patrón de Comunicación entre Capas

```
REQUEST
  ↓
Routes → Controller → Service → DAO → Model → DB
  ↓        ↑                               ↑
  └────────────────────────────────────────┘
          (Retorna datos por capas)

RESPONSE
  ↓
DB → Model → DAO → Service → Controller → Routes → HTTP
                                                  ↓
                                              CLIENT
```

---

## Beneficios de Esta Arquitectura

✅ **Separación de responsabilidades**
- Cada capa tiene un propósito único

✅ **Mantenibilidad**
- Cambios en BD no afectan API
- Cambios en lógica no afectan HTTP

✅ **Testabilidad**
- Cada capa se prueba independientemente
- Mocking de dependencias es fácil

✅ **Escalabilidad**
- Agregar nuevas capas sin quebrar existentes
- Refactorizar internamente sin cambiar interfaz

✅ **Reutilización**
- Services se pueden usar desde múltiples Controllers
- DAOs se pueden reutilizar en múltiples Services

✅ **Seguridad**
- Config centralizada (no secretos dispersos)
- Validaciones en múltiples niveles
- Control de acceso en Routes + Controllers

---

## Guía de Nuevas Features

### Para agregar nueva funcionalidad:

1. **Define Routes** (`routes/feature.routes.js`)
   ```javascript
   router.post('/something', authenticate, (req, res) => 
     featureController.create(req, res)
   );
   ```

2. **Crea Controller** (`src/controllers/featureController.js`)
   ```javascript
   async create(req, res) {
     try {
       const result = await featureService.create(req.body);
       return res.json({ status: 'success', data: result });
     } catch (error) {
       return res.status(400).json({ status: 'error', message: error.message });
     }
   }
   ```

3. **Implementa Service** (`src/services/featureService.js`)
   ```javascript
   async create(data) {
     // Validaciones y lógica
     const validated = await this.validate(data);
     return await featureDAO.create(validated);
   }
   ```

4. **Define DAO** (`src/daos/featureDAO.js`)
   ```javascript
   async create(data) {
     return await Feature.create(data);
   }
   ```

5. **Define Model** (`models/feature.model.js`)
   ```javascript
   const schema = new Schema({
     name: { type: String, required: true },
     // ...
   });
   ```

---

## Antipatrones a Evitar

❌ **NO hacer lógica en Routes**
```javascript
// ❌ MALO
router.post('/register', async (req, res) => {
  const user = await User.create(req.body);  // ← Lógica en Route!
  res.json(user);
});

// ✅ BUENO
router.post('/register', (req, res) => userController.register(req, res));
```

❌ **NO acceder a BD desde Controller**
```javascript
// ❌ MALO
async register(req, res) {
  const user = await User.create(req.body);  // ← Acceso BD en Controller!
}

// ✅ BUENO
async register(req, res) {
  const user = await authService.register(req.body);
}
```

❌ **NO poner lógica de BD en Service**
```javascript
// ❌ MALO
async register(email, password) {
  const user = await User.create({email, password});  // ← Query en Service!
}

// ✅ BUENO
async register(email, password) {
  return await userDAO.createUser({email, password});
}
```

---

## Checklist de Implementación

- ✅ Responsabilidades claras en cada capa
- ✅ Config centralizada (`src/config/config.js`)
- ✅ Controllers con lógica mínima
- ✅ Services con toda la lógica de negocio
- ✅ DAOs con CRUD simple
- ✅ Models con esquemas Mongoose
- ✅ Routes sin lógica de negocio
- ✅ Validaciones en múltiples niveles
- ✅ Manejo de errores consistente
- ✅ Variables de entorno en `.env`
- ✅ Documentación actualizada

