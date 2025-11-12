import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

//Esta ruta es para agregar un abono a un pago
export async function POST(request, { params }) {
    const req = await request.json();
    try {
        console.log("Datos recibidos para registrar abono:", req, params);
        const [response] = await conn.query("CALL SP_REGISTRARABONO(?,?,?)", [req.IdCargo, req.Monto, params.id]);
        console.log("Respuesta de la base de datos al registrar abono:", response[0][0]);

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error al registrar abono:", error);
        return NextResponse.json({ error: "Error al agregar el abono" }, { status: 500 });
    }
}