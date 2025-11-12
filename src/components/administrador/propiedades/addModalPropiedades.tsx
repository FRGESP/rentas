"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Building, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import DireccionForm from "@/components/ui/direccionForm";
import { addPropiedad } from "@/actions";

interface AddModalProps {
    onGuardado: () => void;
}

function AddModalPropiedades({ onGuardado }: AddModalProps) {
    const { toast } = useToast();
    const router = useRouter();

    //Controla el estado del modal
    const [isOpen, setIsOpen] = useState(false);

    //Controla el estado de los errores
    const [errors, setErrors] = useState<Record<string, string>>({});

    //Guarda la informacion del input
    const [inputValue, setInputValue] = useState({
        nombre: "",
        tipo: "",
        codigo: "",
        calle: "",
        colonia: "",
    });

    //Empieza las funciones del componente direccion

    //Bandera para revisar si es necesario verificar los campos de la direccion
    const [isRequired, setIsRequired] = useState(false);

    //Funcion para guardar la direccion 
    const saveDireccion = (codigo: string, colonia: string, calle: string, isRequiredPar: boolean) => {
        setInputValue({
            ...inputValue,
            codigo: codigo,
            colonia: colonia,
            calle: calle,
        });

        if (isRequiredPar) {
            setIsRequired(true);
        }
        // setIsRequired(true);
        console.log(isRequired)

    }
    //Funcion para verificar los campos de la direccion
    const verfificarCampos = () => {
        const newErrors: Record<string, string> = {};
        Object.entries(inputValue).forEach(([Key, value]) => {
            if (Key === "codigo" || Key === "calle" || Key === "colonia") {
                if (value.trim() === "") {
                    newErrors[Key] = "Ingrese una dirección válida y completa";
                } else {
                    setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors[Key];
                        return newErrors;
                    });
                }
            } else {
                newErrors[Key] = errors[Key];
            }
        })
        setErrors(newErrors);
    }

    useEffect(() => {
        if (isRequired) {
            verfificarCampos();
        }
    }, [inputValue])

    //Terminan las funciones del componente direccion

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
        setIsRequired(false); // Necesario para el formulario de direccion
        // Reiniciar los valores de los inputs y errores al abrir el modal
        setErrors({});
        setInputValue({
            nombre: "",
            tipo: "",
            codigo: "",
            calle: "",
            colonia: "",
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
            // Necesario para el formulario de direccion
            if (value.trim() === "") {
                if (Key === "codigo" || Key === "calle" || Key === "colonia") {
                    newErrors["codigo"] = "Ingrese una dirección válida y completa";
                } else {
                    newErrors[Key] = "Este campo es obligatorio"
                }
            }
        })
        setErrors(newErrors);

        if (Object.keys(newErrors).length == 0) {
            const response = await addPropiedad(inputValue);
            console.log(response);
            if (response === 200) {
                setIsOpen(false);

                toast({
                    title: "Propiedad agregada",
                    description: "La propiedad ha sido agregada correctamente",
                    variant: "success",
                });
                onGuardado();
            } else {
                toast({
                    title: "Error",
                    description: "No se pudo agregar la propiedad",
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
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-navy to-blue-900 text-white rounded-t-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                                        <Building className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Agregar Propiedad</h2>
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
                                        htmlFor="nombre"
                                        className="block font-semibold"
                                    >
                                        Nombre de la propiedad
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
                                        placeholder="Ej: Departamentos Pípila"
                                        onChange={handleChange}
                                    />
                                    {errors["nombre"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["nombre"]}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Campo Tipo */}
                                <div className="space-y-2">
                                    <label className="block font-semibold text-black" htmlFor="tipo">
                                        Tipo de propiedad
                                    </label>
                                    <select
                                        onChange={handleChange}
                                        name="tipo"
                                        id="tipo"
                                        defaultValue={'Default'}
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none bg-white ${errors["tipo"]
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                : "border-gray-400"
                                            }`}
                                    >
                                        <option value="Default" disabled hidden>Seleccione el tipo de propiedad</option>
                                        <option value="Casa">Casa</option>
                                        <option value="Edificio">Edificio</option>
                                        <option value="Local">Local</option>
                                    </select>
                                    {errors["tipo"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["tipo"]}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Campo Dirección */}
                                <div className="space-y-2">
                                    <label className="block font-semibold text-black">
                                        Dirección
                                    </label>
                                    <div className={`rounded-lg border-2 transition-all duration-200 ${errors["codigo"]
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        } p-4 bg-gray-50`}>
                                        <DireccionForm action={saveDireccion} />
                                    </div>
                                    {errors["codigo"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["codigo"]}</span>
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
                                    Agregar Propiedad
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddModalPropiedades;
