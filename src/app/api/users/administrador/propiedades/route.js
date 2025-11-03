import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";


export async function GET() {
    try {
        const [response] = await conn.query("CALL SP_GETPROPIEDADES()");
        return NextResponse.json(response[0], { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al obtener propiedades" }, { status: 500 });
    }
}

//Esta ruta es para registrar una propiedad
export async function POST(request) {
    const req = await request.json();
    try {
        const [response] = await conn.query("CALL SP_ADDPROPIEDAD(?,?,?,?,?)", [req.nombre, req.tipo, req.codigo, req.colonia, req.calle]);

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al registrar la propiedad" }, { status: 500 });
    }
}