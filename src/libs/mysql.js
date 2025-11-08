import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Carga las variables del archivo .env (en la raíz del proyecto)
dotenv.config({ path: '.env' });

export const conn = mysql.createPool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});