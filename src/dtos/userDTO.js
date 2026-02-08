/**
 * DTO para información pública del usuario (sin datos sensibles)
 */
export class UserPublicDTO {
  constructor(user) {
    this.id = user._id || user.id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.age = user.age;
    this.role = user.role;
    this.avatar = user.avatar;
    this.provider = user.provider;
    this.createdAt = user.createdAt;
  }
}

/**
 * DTO para perfil del usuario (información del usuario actual)
 * Este es el que usaremos en /current
 */
export class UserProfileDTO {
  constructor(user) {
    this.id = user._id || user.id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.age = user.age;
    this.role = user.role;
    this.avatar = user.avatar;
    this.provider = user.provider;
    this.cart = user.cart;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

/**
 * DTO para lista de usuarios (admin)
 */
export class UserListDTO {
  constructor(user) {
    this.id = user._id || user.id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.role = user.role;
    this.provider = user.provider;
    this.createdAt = user.createdAt;
  }
}