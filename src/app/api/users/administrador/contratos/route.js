import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";
import { hashPassword } from "@/libs/hashPassword";


//Esta ruta es para registrar un contrato
export async function POST(request, { params }) {
    const req = await request.json();
    try {
        const [response] = await conn.query("CALL SP_REGISTRARCONTRATO(?,?,?,?,?,?,?,?,?,?)", [req.nombre, req.apellidoPaterno, req.apellidoMaterno, req.telefono, req.inmueble, req.propBoolean, req.monto, req.deposito, req.plazo, req.diaCobro]);

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al registrar el contrato" }, { status: 500 });
    }
}
