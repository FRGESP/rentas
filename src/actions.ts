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
            redirect("/users/administrador/empleados");
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
    const session = await getSession();
    const response = await axios.post(`${process.env.URL}/api/users/administrador/propiedades`, propiedad)
    const status = response.status;
    return status;
}

export const deletePropiedad = async (id: number) => {
    const session = await getSession();
    const response = await axios.delete(`${process.env.URL}/api/users/administrador/propiedades/${id}`);
    const data = response.data;
    return data;
}