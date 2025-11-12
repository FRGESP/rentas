"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Building, X } from "lucide-react";
import axios from "axios";

interface UpdateModalUnidadProps {
    IdUnidad: number;
    onGuardado: () => void;
}

//Guarda la informacion del Unidad
export interface Unidad {
    Nombre: string;
}


function UpdateModalUnidad({ IdUnidad, onGuardado }: UpdateModalUnidadProps) {
    const { toast } = useToast();

    //ContRola el estado del modal
    const [isOpen, setIsOpen] = useState(false);

    //ContRola el estado de los errores
    const [errors, setErrors] = useState<Record<string, string>>({});

    //Guarda la informacion del Unidad
    const [Unidad, setUnidad] = useState<Unidad>()

    //Guarda la informacion del input
    const [inputValue, setInputValue] = useState({
        Nombre: "",
    });

    //Empieza las funciones del componente direccion

    //Bandera para revisar si es necesario verificar los campos de la direccion
    const [isRequired, setIsRequired] = useState(false);


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
        });
        await getUnidad();
        setIsOpen(true);
    };
    //Funcion para cerrar el modal
    const closeModal = () => {
        setIsOpen(false);
    };

    //Funcion para obtener el id del Unidad
    const getUnidad = async () => {
        try {
            const response = await axios.post(`/api/users/administrador/propiedades/unidades/${IdUnidad}`);
            const data = response.data;
            console.log(data);
            setUnidad(data);
            setInputValue({
                Nombre: data.Nombre,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo cargar la información de la Unidad",
                variant: "destructive",
            });
        }
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

            try {

                const responseUpdate = await axios.put(`/api/users/administrador/propiedades/unidades/${IdUnidad}`, inputValue)

                if (responseUpdate.status === 200) {
                    onGuardado();
                    setIsOpen(false);
                    toast({
                        title: "Unidad actualizada",
                        description: "La Unidad ha sido actualizada correctamente",
                        variant: "success",
                    });
                } else {
                    toast({
                    title: "Error",
                    description: "No se pudo actualizar la Unidad",
                    variant: "destructive",
                });
                }

            } catch (error) {
                toast({
                    title: "Error",
                    description: "No se pudo actualizar la Unidad",
                    variant: "destructive",
                });
                return;
            }

        }
    };

    //Guarda los campos modificados

    return (
        <div>
            <div className="w-full mt-auto">
                <button onClick={openModal} className="w-full mt-2 border border-navy text-navy py-2 px-4 rounded-lg hover:bg-navy/10">
                    Editar
                </button>
            </div>

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
                                        <Building className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Editar Unidad</h2>
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
                                        Nombre de la Unidad
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
                                        defaultValue={Unidad?.Nombre}
                                    />
                                    {errors["Nombre"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["Nombre"]}</span>
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

export default UpdateModalUnidad;
