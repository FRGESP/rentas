"use server"
import { sessionOptions, SessionData, defaultSession } from "@/lib"
import { getIronSession } from "iron-session"
import { cookies } from "next/headers"
import { redirect } from "next/navigation";
import axios from "axios"

interface Credentials {
    user: string;
    password: string;
}

interface empleado {
    nombre: string;
    apellidoPat: string;
    apellidoMat: string;
    telefono: string;
    rol: string;
    estatus: string;
}

interface Propiedad {
    nombre: string;
    tipo: string;
    codigo: string;
    calle: string;
    colonia: string;
}
interface Unidad {
    Nombre: string;
    Propiedad: number;
}

interface Contrato {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    telefono: string;
    inmueble: string;
    propBoolean: string;
    monto: string;
    deposito: string;
    plazo: string;
    diaCobro: string;
}

interface Cargo {
    descripcion: string;
    monto: string;
    tipo: string;
    diaCobro: number;
    plazo: number;
    fechaInicio: string;
    fechaVencimiento: string;
}


export const getSession = async () => {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.isLoggedIn) {
        session.isLoggedIn = defaultSession.isLoggedIn;
    }

    return session;
}
export const login = async (credentials: Credentials) => {
    const session = await getSession();

    const response = await axios.post(`${process.env.URL}/api/login`, credentials);

    const datos = response.data;

    if (datos.RES !== undefined) {
        return { "RES": datos.RES };
    } else {
        session.userId = datos.IdUsuario;
        session.rol = datos.IdRol;
        session.isLoggedIn = true;
        session.name = datos.Nombre;
        session.lastname = datos.Apellido;

        await session.save();
        await roles();
    }
}

export const roles = async () => {
    const session = await getSession();
    switch (session.rol) {
        case 1:
            redirect("/users/vendedor");
            break;
        case 2:
            redirect("/users/cajero");
            break;
        case 3:
            redirect("/users/administrador/propiedades");
            break;
        default:
            console.log("No se encontró el rol");
            redirect("/");
    }
};

export const checkRole = async (rol: number) => {
    const session = await getSession();
    if (session.rol != rol) {
        redirect('/');
    }
}

export const logout = async () => {
    const session = await getSession();
    session.destroy();
    redirect("/");
};

export const islogged = async () => {
    const session = await getSession();

    if (!session.isLoggedIn) {
        redirect("/");
    }
}

//Funciones que requieren el el usuario logueado

//Empleados

export const getEmpleadosAction = async () => {
    const session = await getSession();
    const response = await axios.get(`${process.env.URL}/api/users/administrador/empleados/${session.userId}/0`);
    const data = response.data;
    return data;
}

export const deleteEmpleado = async (id: number) => {
    const session = await getSession();
    const response = await axios.delete(`${process.env.URL}/api/users/administrador/empleados/${id}/${session.userId}`);
    const data = response.data;
    return data;
}

export const addEmpleado = async (empleado: empleado) => {
    const session = await getSession();
    const response = await axios.post(`${process.env.URL}/api/users/administrador/empleados/${session.userId}`, empleado)
    const status = response.status;
    return status;
}

//Propiedades
export const getPropiedades = async () => {
    const response = await axios.get(`${process.env.URL}/api/users/administrador/propiedades`);
    const data = response.data;
    return data;
}

export const addPropiedad = async (propiedad: Propiedad) => {
    const response = await axios.post(`${process.env.URL}/api/users/administrador/propiedades`, propiedad)
    const status = response.status;
    return status;
}

export const deletePropiedad = async (id: number) => {
    const response = await axios.delete(`${process.env.URL}/api/users/administrador/propiedades/${id}`);
    const data = response.data;
    return data;
}

//Unidades
export const getUnidades = async (propId: number) => {
    const response = await axios.get(`${process.env.URL}/api/users/administrador/propiedades/unidades/${propId}`);
    const data = response.data;
    return data;
}

export const deleteUnidad = async (id: number) => {
    const response = await axios.delete(`${process.env.URL}/api/users/administrador/propiedades/unidades/${id}`);
    const data = response.data;
    return data;
}

export const addUnidad = async (unidad: Unidad) => {
    const response = await axios.post(`${process.env.URL}/api/users/administrador/propiedades/unidades`, unidad)
    const status = response.status;
    return status;
}

//Contratos
export const addContrato = async (contrato: Contrato) => {
    const response = await axios.post(`${process.env.URL}/api/users/administrador/contratos`, contrato)
    const status = response.status;
    return status;
}

//Detalle Contrato
export const getContratoDetalle = async (id: number) => {
    const response = await axios.get(`${process.env.URL}/api/users/administrador/detalleContratos/${id}`);
    const data = response.data;
    return data;
}

export const deleteCargoFijo = async (id: number) => {
    const response = await axios.delete(`${process.env.URL}/api/users/administrador/detalleContratos/cargofijo/${id}`);
    const data = response.data;
    return data;
}

export const addCargo = async (cargo: Cargo, idContrato: number) => {
    const response = await axios.post(`${process.env.URL}/api/users/administrador/detalleContratos/cargofijo/${idContrato}`, cargo)
    const status = response.status;
    return status;
}

export const deleteCargo = async (id: number) => {
    const response = await axios.delete(`${process.env.URL}/api/users/administrador/detalleContratos/cargo/${id}`);
    const data = response.data;
    return data;
}

export const finalizarContrato = async (id: number) => {
    const response = await axios.delete(`${process.env.URL}/api/users/administrador/detalleContratos/${id}`);
    const data = response.data;
    return data;
}

//Pagos
export const getCargosPago = async () => {
    const response = await axios.get(`${process.env.URL}/api/users/administrador/pagos`);
    const data = response.data;
    return data;
}

export const registrarAbono= async (data: { IdCargo: number, Monto: number }) => {
    const session = await getSession();
    const response = await axios.post(`${process.env.URL}/api/users/administrador/pagos/${session.userId}`, data);
    const status = [response.status, response.data[0][0]];
    return status;
}