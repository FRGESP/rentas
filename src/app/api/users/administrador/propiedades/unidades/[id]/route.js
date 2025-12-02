import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

//Esta ruta se utiliza para obtener las unidades de una propiedad
export async function GET(request, { params }) {
    try {
        const [response] = await conn.query("CALL SP_GETUNIDADES(?)", [params.id]);
        return NextResponse.json([response[0], response[1]], { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al obtener unidades" }, { status: 500 });
    }
}

//Esta ruta se utiliza para eliminar una unidad
export async function DELETE(request, { params }) {
    try {
        const [response] = await conn.query("CALL SP_DELETEUNIDAD(?)", [params.id]);
        return NextResponse.json(response[0][0], { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al eliminar la unidad" }, { status: 500 });
    }
}

//Esta ruta se utiliza para obtener una unidad por id
export async function POST(request, { params }) {
    try {
        const [response] = await conn.query("CALL SP_GETUNIDADADBYID(?)", [params.id]);
        return NextResponse.json(response[0][0], { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al obtener unidad" }, { status: 500 });
    }
}

//Esta ruta es para editar una unidad
export async function PUT(request, { params }) {
    const req = await request.json();
    try {
        const [response] = await conn.query("CALL SP_UPDATEUNIDAD(?,?)", [params.id, req.Nombre]);

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al editar la unidad" }, { status: 500 });
    }
}