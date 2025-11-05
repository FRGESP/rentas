import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

//Esta ruta se utiliza para agregar una unidad a una propiedad
export async function POST(request) {
    const req = await request.json();
    try {
        const [response] = await conn.query("CALL SP_ADDUNIDAD(?,?)", [req.Nombre, req.Propiedad]);

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al registrar la unidad" }, { status: 500 });
    }
}