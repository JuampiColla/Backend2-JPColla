import mongoose from 'mongoose';
import config from '../src/config/config.js';

export const connectDB = async () => {
    try {
        await mongoose.connect(config.database.url, {
            dbName: config.database.name
        });
        console.log('✅ MongoDB Atlas conectado correctamente');
        console.log(`📦 Base de datos: ${mongoose.connection.name}`);
        console.log(`🌐 Ambiente: ${config.environment}`);
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

// Manejo de eventos de conexión
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Error de MongoDB:', err);
});