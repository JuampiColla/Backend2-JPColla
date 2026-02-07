import { Router } from 'express';
import { authenticateJWT, isAdmin } from '../middlewares/jwt.middleware.js';

const router = Router();

// Productos de ejemplo (en producción usar base de datos)
let products = [
    { id: 1, name: 'Producto 1', price: 100, stock: 10 },
    { id: 2, name: 'Producto 2', price: 200, stock: 5 },
    { id: 3, name: 'Producto 3', price: 150, stock: 8 },
    { id: 4, name: 'Producto 4', price: 300, stock: 3 },
    { id: 5, name: 'Producto 5', price: 250, stock: 7 }
];

// Obtener todos los productos (requiere autenticación)
router.get('/', authenticateJWT, (req, res) => {
    res.json({ status: 'success', products });
});

// Crear producto (solo admin)
router.post('/', authenticateJWT, isAdmin, (req, res) => {
    const { name, price, stock } = req.body;
    
    const newProduct = {
        id: products.length + 1,
        name,
        price,
        stock
    };
    
    products.push(newProduct);
    res.json({ status: 'success', product: newProduct });
});

// Actualizar producto (solo admin)
router.put('/:id', authenticateJWT, isAdmin, (req, res) => {
    const { id } = req.params;
    const { name, price, stock } = req.body;
    
    const productIndex = products.findIndex(p => p.id === parseInt(id));
    
    if (productIndex === -1) {
        return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    
    products[productIndex] = { ...products[productIndex], name, price, stock };
    res.json({ status: 'success', product: products[productIndex] });
});

// Eliminar producto (solo admin)
router.delete('/:id', authenticateJWT, isAdmin, (req, res) => {
    const { id } = req.params;
    
    const productIndex = products.findIndex(p => p.id === parseInt(id));
    
    if (productIndex === -1) {
        return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    
    products.splice(productIndex, 1);
    res.json({ status: 'success', message: 'Producto eliminado' });
});

export default router;