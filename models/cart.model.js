import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    products: [{
        product: {
            type: String, // Usar String ya que los productos están en memoria, no en BD
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        }
    }]
}, {
    timestamps: true
});

// Método para calcular el total del carrito
cartSchema.methods.calculateTotal = async function() {
    // Array de productos en memoria
    const allProducts = [
        { id: 1, name: 'Producto 1', price: 100, stock: 10 },
        { id: 2, name: 'Producto 2', price: 200, stock: 5 },
        { id: 3, name: 'Producto 3', price: 150, stock: 8 },
        { id: 4, name: 'Producto 4', price: 300, stock: 3 },
        { id: 5, name: 'Producto 5', price: 250, stock: 7 }
    ];

    return this.products.reduce((total, item) => {
        const product = allProducts.find(p => p.id === parseInt(item.product));
        return total + (product ? product.price * item.quantity : 0);
    }, 0);
};

export default mongoose.model('Cart', cartSchema);