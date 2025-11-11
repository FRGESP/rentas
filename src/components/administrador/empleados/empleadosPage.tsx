"use client"
import { useState, useEffect, use } from "react";
import axios from "axios";
import { Trash, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import AddModal from "./addModal";
import UpdateModal from "./updateModal";
import { deleteEmpleado, getEmpleadosAction } from "@/actions";

function EmpleadosPage() {

    const router = useRouter();
    const { toast } = useToast();

    interface Empleado {
        ID: number;
        IdEmp: number;
        Nombre: string;
        Telefono: string;
        Rol: string;
        Estatus: string;
    }

    //Guarda la informacion de los empleados
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    //Guarda la informacion de la busqueda
    const [searchValue, setSearchValue] = useState({
        nombre:""
    })
    //Bandera para actualizar la tabla
    const [update, setUpdate] = useState(false);

    const getEmpleados = async () => {
        try {
            const data = await getEmpleadosAction();
            setEmpleados(data);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error al cargar empleados",
                description: "Intenta de nuevo más tarde.",
                variant: "destructive",
            });
        }
    }

    const handleChange = (e: any) => {
        setSearchValue({
            ...searchValue,
            [e.target.name]: e.target.value,
        });
    }

    const handleDelete = async (id: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar este empleado?")) {
            try {const response = await deleteEmpleado(id);
            if (response.status === 200) {
                getEmpleados();
                toast({
                    title: "Empleado eliminado",
                    description: "El empleado ha sido eliminado correctamente",
                    variant: "success",
                });
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
            toast({
                title: "Error",
                description: "No se pudo eliminar el empleado",
                variant: "destructive",
            });
        }
        }
    }

    const handleSearch = async (e: any) => {
        e.preventDefault();
        if (searchValue) {
            const response = await axios.post(`/api/users/administrador/empleados`, searchValue);
            const data = response.data;
            setEmpleados(data);
        } 
    }

    useEffect(() => {
        getEmpleados();
    }, []);

    useEffect(() => {
        if (update) {
            getEmpleados();
            setUpdate(false);
        }
    }, [update]);

    return (
        <div className='w-full h-full flex flex-col items-center justify-center p-[2%]'>
            <div className="w-[70%] flex items-center justify-center mb-[2%]">
                <form className="w-full" onSubmit={handleSearch}>
                    <input onChange={handleChange} type="text" name="nombre" className="w-full border border-solid border-black rounded-xl py-2 px-3 text-lg" placeholder="Ingrese el nombre del empleado" />
                </form>
                <button className="hover:bg-gray-100 ml-5 rounded-md"><Search strokeWidth={2} size={45} onClick={handleSearch}/></button>
                <AddModal onGuardado={() => setUpdate(true)}/>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                        <th>Rol</th>
                        <th>Estatus</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map((empleado) => (
                        <tr key={empleado.ID}>
                            <td>{empleado.ID}</td>
                            <td>{empleado.Nombre}</td>
                            <td>{empleado.Telefono}</td>
                            <td>{empleado.Rol}</td>
                            <td><div className=" justify-center flex">
                                <p className={`${empleado.Estatus == "Activo" ? "bg-green-600 text-white" : empleado.Estatus == "Suspendido" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"} rounded-lg w-fit py-2 px-1`}>{empleado.Estatus}</p>
                            </div></td>
                            <td>
                                <div className="flex gap-3 w-full justify-center">
                                    <UpdateModal IdEmpleado={empleado.IdEmp} onGuardado={() => setUpdate(true)}/>
                                    <button className="hover:bg-gray-200 text-red-500 px-2 py-1 rounded" ><Trash strokeWidth={2} size={25} onClick={() => handleDelete(empleado.IdEmp)} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default EmpleadosPage