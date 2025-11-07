"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";
import { addUnidad } from "@/actions";

interface AddModalProps {
    onGuardado: () => void;
    propiedadProp: number;
}

function AddModalUnidades({ onGuardado, propiedadProp }: AddModalProps) {
    const { toast } = useToast();

    //Controla el estado del modal
    const [isOpen, setIsOpen] = useState(false);

    //Controla el estado de los errores
    const [errors, setErrors] = useState<Record<string, string>>({});

    //Guarda la informacion del input
    const [inputValue, setInputValue] = useState({
        nombre: "",
    });


    //Controla el cambio del input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInputValue({
            ...inputValue,
            [name]: value,
        });
        console.log(inputValue);

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
    const openModal = () => {
        setIsOpen(true);
        // Reiniciar los valores de los inputs y errores al abrir el modal
        setErrors({});
        setInputValue({
            nombre: "",
        });
    };
    //Funcion para cerrar el modal
    const closeModal = () => {
        setIsOpen(false);
    };




    const handleSubmit = async () => {

        const newErrors: Record<string, string> = {};

        Object.entries(inputValue).forEach(([Key, value]) => {
            if (value.trim() === "") {
                newErrors[Key] = "Este campo es obligatorio"
            }
        })
        setErrors(newErrors);

        if (Object.keys(newErrors).length == 0) {
            const response = await addUnidad({
                Nombre: inputValue.nombre,
                Propiedad: propiedadProp || 0,
            });
            console.log(response);
            if (response === 200) {
                setIsOpen(false);

                toast({
                    title: "Unidad agregada",
                    description: "La unidad ha sido agregada correctamente",
                    variant: "success",
                });
                onGuardado();
            } else {
                toast({
                    title: "Error",
                    description: "No se pudo agregar la unidad",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <div>
            <button className=" ml-1 rounded-md p-2 hover:bg-gray-200" onClick={openModal}>
                <Plus
                    className="text-acento stroke-[5]"
                    size={45}

                />
            </button>

            {isOpen && (
                <div className="flex items-center justify-center">
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50  animate-in fade-in duration-200"
                        onClick={closeModal}
                    >
                        <div
                            className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header del modal */}
                            <div className="relative px-6 py-5 border-b border-gray-200">
                                <h2 className="font-bold text-2xl text-gray-800 text-center pr-8">
                                    Agregar Unidad
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
                                        htmlFor="nombre"
                                        className="block font-semibold"
                                    >
                                        Nombre de la unidad
                                    </label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["nombre"]
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                : "border-gray-400"
                                            }`}
                                        autoFocus
                                        name="nombre"
                                        placeholder="Ej: Departamento 1"
                                        onChange={handleChange}
                                    />
                                    {errors["nombre"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["nombre"]}</span>
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
                                    Agregar Unidad
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddModalUnidades;
