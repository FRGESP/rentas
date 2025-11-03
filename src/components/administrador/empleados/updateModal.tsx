"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Pencil, X } from "lucide-react";
import axios from "axios";


interface UpdateModalProps {
    IdEmpleado: number;
    onGuardado: () => void;
}

//Guarda la informacion del empleado
export interface Empleado {
    Nombre: string;
    ApellidoPaterno: string;
    ApellidoMaterno: string;
    Telefono: string;
    Rol: string;
    Estatus: string;
}


function UpdateModal({ IdEmpleado, onGuardado }: UpdateModalProps) {
    const { toast } = useToast();

    //ContRola el estado del modal
    const [isOpen, setIsOpen] = useState(false);

    //ContRola el estado de los errores
    const [errors, setErrors] = useState<Record<string, string>>({});

    //Guarda la informacion del empleado
    const [empleado, setEmpleado] = useState<Empleado>()

    //Guarda la informacion del input
    const [inputValue, setInputValue] = useState({
        Nombre: "",
        ApellidoPaterno: "",
        ApellidoMaterno: "",
        Telefono: "",
        Rol: "",
        Estatus: "",
    });

    //ContRola el cambio del input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInputValue({
            ...inputValue,
            [name]: value,
        });

        if (value.trim() === "") {
            setErrors((prev) => ({
                ...prev,
                [name]: "Este campo es obligatorio",
            }));
        } else {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    //Funcion para abrir el modal
    const openModal = async () => {
        // Reiniciar los valores de los inputs y errores al abrir el modal
        setErrors({});
        setInputValue({
            Nombre: "",
            ApellidoPaterno: "",
            ApellidoMaterno: "",
            Telefono: "",
            Rol: "",
            Estatus: "",
        });
        await getEmpleado();
        setIsOpen(true);
    };
    //Funcion para cerrar el modal
    const closeModal = () => {
        setIsOpen(false);
    };

    //Funcion para obtener el id del empleado
    const getEmpleado = async () => {
        const response = await axios.get(`/api/users/administrador/empleados/${IdEmpleado}`);
        const data = response.data;
        setEmpleado(data);
        setInputValue({
            Nombre: data.Nombre,
            ApellidoPaterno: data.ApellidoPaterno,
            ApellidoMaterno: data.ApellidoMaterno,
            Telefono: data.Telefono,
            Rol: data.Rol,
            Estatus: data.Estatus,
        });
    }

    const handleSubmit = async () => {

        const newErrors: Record<string, string> = {};

        Object.entries(inputValue).forEach(([Key, value]) => {
            if (String(value).trim() === "") {
                newErrors[Key] = "Este campo es obligatorio"
            }
        })
        setErrors(newErrors);


        if (Object.keys(newErrors).length == 0) {

            const responseUpdate = await axios.put(`/api/users/administrador/empleados/${IdEmpleado}`, inputValue)

            if (responseUpdate.status === 200) {
                onGuardado();
                setIsOpen(false);
                toast({
                    title: "Empleado actualizado",
                    description: "El empleado ha sido actualizado correctamente",
                    variant: "success",
                });
            } else {
                toast({
                    title: "Error",
                    description: "El empleado no ha sido actualizado correctamente",
                    variant: "destructive",
                });
            }
        }
    };

    //Guarda los campos modificados


    return (
        <div>
            <button className=" ml-1 rounded-md p-2 hover:bg-gray-200 "onClick={openModal}
            >
                <Pencil
                    className="text-yellow-500"
                    size={25}
                />
            </button>

            {isOpen && (
                <div className="flex items-center justify-center">
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200"
                        onClick={closeModal}
                    >
                        <div 
                            className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header del modal */}
                            <div className="relative px-6 py-5 border-b border-gray-200">
                                <h2 className="font-bold text-2xl text-gray-800 text-center pr-8">
                                    Editar Empleado
                                </h2>
                                <button 
                                    onClick={closeModal}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all duration-200 hover:rotate-90"
                                    aria-label="Cerrar modal"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body del modal con scroll */}
                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                {/* Campo Nombre */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="Nombre"
                                        className="block font-semibold"
                                    >
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        id="Nombre"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                                            errors["Nombre"] 
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                                                : "border-gray-400"
                                        }`}
                                        name="Nombre"
                                        onChange={handleChange}
                                        defaultValue={empleado?.Nombre}
                                    />
                                    {errors["Nombre"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["Nombre"]}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Campo Apellido Paterno */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="ApellidoPaterno"
                                        className="block font-semibold"
                                    >
                                        Apellido Paterno
                                    </label>
                                    <input
                                        type="text"
                                        id="ApellidoPaterno"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                                            errors["ApellidoPaterno"] 
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                                                : "border-gray-400"
                                        }`}
                                        name="ApellidoPaterno"
                                        onChange={handleChange}
                                        defaultValue={empleado?.ApellidoPaterno}
                                    />
                                    {errors["ApellidoPaterno"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["ApellidoPaterno"]}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Campo Apellido Materno */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="ApellidoMaterno"
                                        className="block font-semibold"
                                    >
                                        Apellido Materno
                                    </label>
                                    <input
                                        type="text"
                                        id="ApellidoMaterno"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                                            errors["ApellidoMaterno"] 
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                                                : "border-gray-400"
                                        }`}
                                        name="ApellidoMaterno"
                                        onChange={handleChange}
                                        defaultValue={empleado?.ApellidoMaterno}
                                    />
                                    {errors["ApellidoMaterno"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["ApellidoMaterno"]}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Campo Teléfono */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="Telefono"
                                        className="block font-semibold"
                                    >
                                        Teléfono
                                    </label>
                                    <input
                                        type="number"
                                        id="Telefono"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                                            errors["Telefono"] 
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                                                : "border-gray-400"
                                        }`}
                                        name="Telefono"
                                        onChange={handleChange}
                                        defaultValue={empleado?.Telefono}
                                    />
                                    {errors["Telefono"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["Telefono"]}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Campos Rol y Estatus en grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Campo Rol */}
                                    <div className="space-y-2">
                                        <label className="block font-semibold" htmlFor="Rol">
                                            Rol
                                        </label>
                                        <select 
                                            onChange={handleChange} 
                                            name="Rol" 
                                            id="Rol"
                                            defaultValue={String(empleado?.Rol)} 
                                            className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none bg-white ${
                                                errors["Rol"] 
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                                                    : "border-gray-400"
                                            }`}
                                        >
                                            <option value="3">Administrador</option>
                                            <option value="2">Cajero</option>
                                        </select>
                                        {errors["Rol"] && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <span>⚠</span>
                                                <span>{errors["Rol"]}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Campo Estatus */}
                                    <div className="space-y-2">
                                        <label className="block font-semibold" htmlFor="Estatus">
                                            Estatus
                                        </label>
                                        <select 
                                            onChange={handleChange} 
                                            name="Estatus" 
                                            id="Estatus"
                                            defaultValue={String(empleado?.Estatus)} 
                                            className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none bg-white ${
                                                errors["Estatus"] 
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                                                    : "border-gray-400"
                                            }`}
                                        >
                                            <option value="1">Activo</option>
                                            <option value="3">Suspendido</option>
                                            <option value="2">Despedido</option>
                                        </select>
                                        {errors["Estatus"] && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <span>⚠</span>
                                                <span>{errors["Estatus"]}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer del modal */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-center">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-2.5 font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:ring-gray-300 focus:ring-offset-1"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2.5 font-medium text-white bg-navy rounded-lg hover:bg-navyhover transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UpdateModal;
