import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

export async function GET(request, { params }) {
    try {
        const [response] = await conn.query("CALL SP_GETCARGOFIJOINFO(?)", [params.id]);
        return NextResponse.json(response[0][0], { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al obtener la información del cargo fijo" }, { status: 500 });
    }
}

//Esta ruta es para editar un cargo fijo
export async function PUT(request, { params }) {
    
    const req = await request.json();
    console.log(req)
    try {
        const [response] = await conn.query("CALL SP_EDITCARGOFIJO(?,?,?,?,?,?)", [params.id, req.Descripcion, req.Monto, req.DiaCobro, req.Plazo, req.Estado]);

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al editar el cargo fijo" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {

    try {
        const [response] = await conn.query("CALL SP_DELETECARGOFIJO(?)", [params.id]);
        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al eliminar cargo fijo" }, { status: 500 });
    }

}

//Esta ruta se utiliza para agregar cargos
export async function POST(request, { params }) {
    const req = await request.json();
    try {
        const [response] = await conn.query("CALL SP_ADDCARGO(?,?,?,?,?,?,?,?)", [params.id, req.descripcion, req.monto, req.tipo, req.diaCobro, req.plazo, req.fechaInicio, req.fechaVencimiento]);

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al registrar el cargo" }, { status: 500 });
    }
}