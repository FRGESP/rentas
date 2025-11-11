import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

export async function GET(request, { params }) {
    try {
        const [response] = await conn.query("CALL SP_GETINQUILINOINFO(?)", [params.id]);
        return NextResponse.json(response[0][0], { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al obtener la información del inquilino" }, { status: 500 });
    }
}

//Esta ruta es para editar un inquilino
export async function PUT(request, { params }) {
    const req = await request.json();
    try {
        const [response] = await conn.query("CALL SP_EDITINQUILINO(?,?,?,?,?)", [params.id, req.Nombre, req.ApellidoPaterno, req.ApellidoMaterno, req.Telefono]);

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al editar el inquilino" }, { status: 500 });
    }
}