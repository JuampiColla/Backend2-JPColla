import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:8080';
const EMAIL = 'admincoder@coder.com';
const PASSWORD = 'adminCod3r123';

async function test() {
    console.log('🧪 PRUEBA DE CARRITO CON IDs SIMPLES\n');
    
    try {
        // 1. Login
        console.log('1️⃣ Iniciando sesión...');
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, { 
            email: EMAIL, 
            password: PASSWORD 
        });
        
        const loginData = loginRes.data;
        console.log('✅ Login exitoso');
        console.log('   Usuario ID:', loginData.user._id);
        console.log('   Rol:', loginData.user.role);
        
        const userId = loginData.user._id;
        const token = loginData.token;
        
        // 2. Agregar producto al carrito
        console.log('\n2️⃣ Agregando producto con ID simple (2) al carrito...');
        const addRes = await axios.post(`${BASE_URL}/api/carts/${userId}/products`, 
            { 
                productId: '2', 
                quantity: 1, 
                price: 200, 
                name: 'Producto 2' 
            },
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        
        const addData = addRes.data;
        console.log('✅ Producto agregado al carrito');
        console.log('   Mensaje:', addData.message);
        console.log('   Productos en carrito:', addData.cart.products.length);
        
        // 3. Obtener el carrito
        console.log('\n3️⃣ Obteniendo carrito...');
        const cartRes = await axios.get(`${BASE_URL}/api/carts/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const cartData = cartRes.data;
        console.log('✅ Carrito obtenido:');
        console.log('   Total de productos:', cartData.cart.products.length);
        console.log('   Total a pagar: $' + cartData.cart.totalPrice);
        
        // Mostrar detalles de los productos
        cartData.cart.products.forEach((item, idx) => {
            console.log(`\n   Producto ${idx + 1}:`);
            console.log(`     - Nombre: ${item.name}`);
            console.log(`     - ID: ${item.productId}`);
            console.log(`     - Precio: $${item.price}`);
            console.log(`     - Cantidad: ${item.quantity}`);
            console.log(`     - Subtotal: $${item.price * item.quantity}`);
        });
        
        console.log('\n✅ PRUEBA COMPLETADA CON ÉXITO');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        process.exit(1);
    }
}

test();
