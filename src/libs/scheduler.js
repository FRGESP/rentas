import cron from 'node-cron';
import { conn } from "./mysql.js";

// Tarea programada para ejecutar cada día a las 00:00
// cron.schedule('0 0 * * *', async () => {
//     try {
//         // Llamada al procedimiento almacenado para actualizar el estado de los contratos
//         await conn.query("CALL actualizar_estado_contratos()");
//     } catch (error) {
//         console.error("Error al ejecutar la tarea programada:", error);
//     }
// });
// export default cron;   

export function startCronJobs() {
    // Tarea que se ejecuta cada segundo (solo para pruebas)
    cron.schedule("0 0 0 * * *", () => {
        console.log("📅 Ejecutando tarea diaria:", new Date().toLocaleString());
    }, {
        timezone: "America/Mexico_City"
    });
}