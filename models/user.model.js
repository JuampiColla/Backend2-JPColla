import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    last_name: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    age: {
        type: Number,
        required: [true, 'La edad es requerida'],
        min: [1, 'La edad debe ser mayor a 0']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida']
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Campos adicionales para GitHub OAuth (opcional)
    provider: {
        type: String,
        enum: ['local', 'github'],
        default: 'local'
    },
    githubId: {
        type: String,
        sparse: true
    },
    avatar: {
        type: String
    }
}, {
    timestamps: true
});

// Índice para búsquedas rápidas por email
userSchema.index({ email: 1 });

// Método para no devolver la contraseña en las respuestas
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

export default mongoose.model('User', userSchema);