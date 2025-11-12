"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Edit2, User, X } from "lucide-react";
import axios from "axios";


interface UpdateInquilinoProps {
    IdContrato: number;
    onGuardado: () => void;
}

//Guarda la informacion del empleado
export interface Empleado {
    Nombre: string;
    ApellidoPaterno: string;
    ApellidoMaterno: string;
    Telefono: string;
}


function UpdateInquilino({ IdContrato, onGuardado }: UpdateInquilinoProps) {
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
        const response = await axios.get(`/api/users/administrador/detalleContratos/inquilino/${IdContrato}`);
        const data = response.data;
        setEmpleado(data);
        setInputValue({
            Nombre: data.Nombre,
            ApellidoPaterno: data.ApellidoPaterno,
            ApellidoMaterno: data.ApellidoMaterno,
            Telefono: data.Telefono,
        });
    }

    const handleSubmit = async () => {

        const newErrors: Record<string, string> = {};

        Object.entries(inputValue).forEach(([Key, value]) => {

            if (Key === "Telefono" && !/^\d{10}$/.test(String(value))) {
                newErrors[Key] = "El teléfono debe tener 10 dígitos"
            }

            if (String(value).trim() === "") {
                newErrors[Key] = "Este campo es obligatorio"
            }
        })
        setErrors(newErrors);


        if (Object.keys(newErrors).length == 0) {

            const responseUpdate = await axios.put(`/api/users/administrador/detalleContratos/inquilino/${IdContrato}`, inputValue)

            if (responseUpdate.status === 200) {
                onGuardado();
                setIsOpen(false);
                toast({
                    title: "Inquilino actualizado",
                    description: "El inquilino ha sido actualizado correctamente",
                    variant: "success",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Error al actualizar el inquilino",
                    variant: "destructive",
                });
            }
        }
    };

    //Guarda los campos modificados


    return (
        <div>
            <button
                onClick={() => {
                    openModal();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Editar inquilino"
            >
                <Edit2 className="w-4 h-4 text-gray-600" />
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
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-navy to-blue-900 text-white rounded-t-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Editar Inquilino</h2>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                                >
                                    <X className="w-6 h-6" />
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
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["Nombre"]
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
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["ApellidoPaterno"]
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
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["ApellidoMaterno"]
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
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["Telefono"]
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                : "border-gray-400"
                                            }`}
                                        name="Telefono"
                                        onChange={handleChange}
                                        defaultValue={empleado?.Telefono}
                                        onWheel={(e) => e.currentTarget.blur()}
                                    />
                                    {errors["Telefono"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["Telefono"]}</span>
                                        </p>
                                    )}
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

export default UpdateInquilino;
