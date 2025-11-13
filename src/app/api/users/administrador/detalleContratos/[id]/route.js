import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

export async function GET(request, { params }) {
    try {
        const response = await conn.query("CALL SP_GETCONTRATOINFO(?)", [params.id]);
        return NextResponse.json([response[0][0],response[0][1], response[0][2], response[0][3]], { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al obtener la información del contrato" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {

    try {
        const [response] = await conn.query("CALL SP_FINALIZARCONTRATO(?)", [params.id]);
        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al finalizar contrato" }, { status: 500 });
    }

}