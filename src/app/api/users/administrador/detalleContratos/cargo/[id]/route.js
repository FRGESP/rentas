import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

export async function DELETE(request, { params }) {

    try {
        const [response] = await conn.query("CALL SP_DELETECARGO(?)", [params.id]);
        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al eliminar cargo" }, { status: 500 });
    }

}

export async function GET(request, { params }) {
    try {
        const [response] = await conn.query("CALL SP_GETCARGOINFO(?)", [params.id]);
        return NextResponse.json(response[0][0], { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al obtener la información del cargo" }, { status: 500 });
    }
}

//Esta ruta es para editar un cargo
export async function PUT(request, { params }) {
    
    const req = await request.json();
    console.log(req)
    try {
        const [response] = await conn.query("CALL SP_UPDATECARGO(?,?,?,?,?,?,?,?)", [params.id, req.Descripcion, req.Estado, req.FechaInicio, req.FechaVencimiento, req.MontoTotal, req.SaldoPendiente, req.TipoCargo]);

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al editar el cargo" }, { status: 500 });
    }
}