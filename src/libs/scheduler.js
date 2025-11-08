import cron from 'node-cron';
import { conn } from './mysql.js';

export function startCronJobs() {
  // Se ejecuta todos los días a las 08:00 a.m. hora de CDMX
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Ejecutando tarea diaria a las 8 a.m. (CDMX)...');

    try {
      const [response] = await conn.query('CALL SP_ACTIVARPAGOS()');
      console.log('✅ Proceso de activación ejecutado correctamente:', response);
    } catch (error) {
      console.error('❌ Error al ejecutar SP_ACTIVARPAGOS:', error);
    }
  }, {
    timezone: 'America/Mexico_City'
  });
}