import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    products: [{
        productId: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        price: {
            type: Number,
            required: true,
            default: 0
        },
        name: {
            type: String,
            default: 'Producto'
        }
    }],
    totalPrice: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// Índice para búsquedas rápidas por userId
cartSchema.index({ userId: 1 });

export default mongoose.model('Cart', cartSchema);