import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: false
    },
    provider: {
        type: String,
        enum: ['local', 'github'],
        default: 'local'
    },
    githubId: {
        type: String,
        required: false
    },
    avatar: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// Índice para búsquedas rápidas por email
userSchema.index({ email: 1 });

// Método para no devolver la contraseña
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

export default mongoose.model('User', userSchema);