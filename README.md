# Simulador de Ecommerce de Celulares - Backend II

Backend de un simulador de ecommerce de venta de celulares con autenticación JWT y Passport, carrito de compras, compras con ticket y recuperación de contraseña.

## ✅ Alcance Funcional

- Catalogo de celulares con CRUD de productos
- Carrito de compras por usuario
- Compra con ticket y actualizacion de stock
- Recuperacion y cambio de contraseña por email

## 🧰 Tecnologias

- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT + Passport (Local + GitHub OAuth)
- bcrypt + cookies
- Handlebars

## 🚀 Instalacion Rapida

```bash
npm install
```

Crear `.env`:

```env
PORT=8080
SESSION_SECRET=tu_secreto
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/integrative_practice
JWT_SECRET=tu_jwt_secret
JWT_COOKIE_NAME=currentUser

# Admin
ADMIN_EMAIL=adminCoder@coder.com
ADMIN_PASSWORD=adminCod3r123

# Email SMTP
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu_usuario_smtp
SMTP_PASS=tu_password_smtp
SMTP_FROM=noreply@ecommerce.com

# Frontend
FRONTEND_URL=http://localhost:8080

# GitHub OAuth (opcional)
GITHUB_CLIENT_ID=tu_client_id
GITHUB_CLIENT_SECRET=tu_client_secret
GITHUB_CALLBACK_URL=http://localhost:8080/api/auth/github/callback
```

Iniciar servidor:

```bash
npm start
```

Base URL local: `http://localhost:8080`

## 📬 Postman

Importar:

- `postman/Backend2-JPColla.postman_collection.json`
- `postman/Backend2-JPColla.postman_environment.json`

Notas:

- Para endpoints admin, el usuario debe tener `role: "admin"`.
- En productos, el campo `code` es requerido y unico.
- Para reset, el token se obtiene del email o de la base de datos.

## 🔌 Endpoints Principales

JWT Auth (`/api/users`):

- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/current`

Productos (`/api/products`):

- `GET /api/products`
- `POST /api/products` (admin)

Carrito y compra (`/api/carts`):

- `GET /api/carts/:userId`
- `POST /api/carts/:userId/products`
- `POST /api/carts/:userId/purchase`

Password (`/api/password`):

- `POST /api/password/forgot`
- `POST /api/password/reset`

Passport (`/api/auth`):

- `POST /api/auth/register`
- `POST /api/auth/login`

## 👨‍💻 Autor

- Colla, Juan Pablo
- juaampic@gmail.com
- Comision 76905

## 📄 Licencia

ISC