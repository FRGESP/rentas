import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

//Esta ruta es para obtener un empleado por id
export async function GET(request, { params }) {
    try {
        const [response] = await conn.query("CALL SP_GETPROPIEDADBYID(?)", [params.id]);
        return NextResponse.json(response[0][0], { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al obtener propiedad" }, { status: 500 });
    }
}

//Esta ruta es para editar una propiedad
export async function PUT(request, { params }) {
    const req = await request.json();
    try {
        const [response] = await conn.query("CALL SP_EDITPROPIEDAD(?,?,?,?,?,?)", [params.id, req.Nombre, req.Tipo, req.Codigo, req.Colonia, req.Calle]);

        return NextResponse.json(response[0][0], { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al editar la propiedad" }, { status: 500 });
    }
}

//Esta ruta es para eliminar una propiedad
export async function DELETE(request, { params }) {
    try {
        const [response] = await conn.query("CALL SP_DELETEPROPIEDAD(?)", [params.id]);
        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al eliminar la propiedad" }, { status: 500 });
    }
}