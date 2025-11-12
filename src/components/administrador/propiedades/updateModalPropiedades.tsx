"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Building, X } from "lucide-react";
import axios from "axios";
import DireccionForm from "@/components/ui/direccionForm";


interface UpdateModalPropiedadProps {
    IdPropiedad: number;
    onGuardado: () => void;
}

//Guarda la informacion del Propiedad
export interface Propiedad {
    Nombre: string;
    Tipo: string;
    Codigo: string;
    Calle: string;
    Colonia: string;
    NombreColonia: string;
}


function UpdateModalPropiedad({ IdPropiedad, onGuardado }: UpdateModalPropiedadProps) {
    const { toast } = useToast();

    //ContRola el estado del modal
    const [isOpen, setIsOpen] = useState(false);

    //ContRola el estado de los errores
    const [errors, setErrors] = useState<Record<string, string>>({});

    //Guarda la informacion del Propiedad
    const [propiedad, setPropiedad] = useState<Propiedad>()

    //Guarda la informacion del input
    const [inputValue, setInputValue] = useState({
        Nombre: "",
        Tipo: "",
        Codigo: "",
        Calle: "",
        Colonia: "",
    });

    //Empieza las funciones del componente direccion

    //Bandera para revisar si es necesario verificar los campos de la direccion
    const [isRequired, setIsRequired] = useState(false);

    //Funcion para guardar la direccion 
    const saveDireccion = (Codigo: string, Colonia: string, Calle: string, isRequiredPar: boolean, nombreCol?: string) => {
        setInputValue({
            ...inputValue,
            Codigo: Codigo,
            Colonia: Colonia,
            Calle: Calle,
        });

        if (isRequiredPar) {
            setIsRequired(true);
        }

    }
    //Funcion para verificar los campos de la direccion
    const verfificarCampos = () => {
        const newErrors: Record<string, string> = {};
        Object.entries(inputValue).forEach(([Key, value]) => {
            if (Key === "Codigo" || Key === "Calle" || Key === "Colonia") {
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
        setIsRequired(false); // Necesario para el formulario de direccion
        setInputValue({
            Nombre: "",
            Tipo: "",
            Codigo: "",
            Calle: "",
            Colonia: "",
        });
        await getPropiedad();
        setIsOpen(true);
    };
    //Funcion para cerrar el modal
    const closeModal = () => {
        setIsOpen(false);
    };

    //Funcion para obtener el id del Propiedad
    const getPropiedad = async () => {
        try {
            const response = await axios.get(`/api/users/administrador/propiedades/${IdPropiedad}`);
            const data = response.data;
            setPropiedad(data);
            setInputValue({
                Nombre: data.Nombre,
                Tipo: data.Tipo,
                Codigo: data.Codigo,
                Calle: data.Calle,
                Colonia: data.Colonia,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo cargar la información de la propiedad",
                variant: "destructive",
            });
        }
    }


    const handleSubmit = async () => {

        const newErrors: Record<string, string> = {};

        Object.entries(inputValue).forEach(([Key, value]) => {
            if (String(value).trim() === "") {
                newErrors[Key] = "Este campo es obligatorio"


                // Necesario para el formulario de direccion
                if (value.trim() === "") {
                    if (Key === "Codigo" || Key === "Calle" || Key === "Colonia") {
                        newErrors["Codigo"] = "Ingrese una dirección válida y completa";
                    } else {
                        newErrors[Key] = "Este campo es obligatorio"
                    }
                }
            }
        })
        setErrors(newErrors);


        if (Object.keys(newErrors).length == 0) {

            try {

                const responseUpdate = await axios.put(`/api/users/administrador/propiedades/${IdPropiedad}`, inputValue)

                console.log(responseUpdate.data.RES);

                if (responseUpdate.status === 200) {
                    onGuardado();
                    setIsOpen(false);
                    if (responseUpdate.data.RES === 1) {
                        toast({
                            title: "No se pudo actualizar el tipo de propiedad",
                            description: "La propiedad tiene unidades activas, por lo que no se pudo actualizar su tipo.",
                            variant: "warning",
                        });
                    } else {
                        toast({
                            title: "Propiedad actualizada",
                            description: "La propiedad ha sido actualizada correctamente",
                            variant: "success",
                        });
                    }
                } else {
                    toast({
                        title: "Error",
                        description: "La propiedad no ha sido actualizada correctamente",
                        variant: "destructive",
                    });
                }

            } catch (error) {
                toast({
                    title: "Error",
                    description: "No se pudo actualizar la propiedad",
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
                                    <h2 className="text-2xl font-bold">Editar Propiedad</h2>
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
                                        Nombre de la Propiedad
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
                                        defaultValue={propiedad?.Nombre}
                                    />
                                    {errors["Nombre"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["Nombre"]}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Campo Tipo */}
                                <div className="space-y-2">
                                    <label className="block font-semibold text-black" htmlFor="Tipo">
                                        Tipo de propiedad
                                    </label>
                                    <select
                                        onChange={handleChange}
                                        defaultValue={propiedad?.Tipo}
                                        name="Tipo"
                                        id="Tipo"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none bg-white ${errors["Tipo"]
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                            : "border-gray-400"
                                            }`}
                                    >
                                        <option value="Default" disabled hidden>Seleccione el tipo de propiedad</option>
                                        <option value="Casa">Casa</option>
                                        <option value="Edificio">Edificio</option>
                                        <option value="Local">Local</option>
                                    </select>
                                    {errors["Tipo"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["Tipo"]}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Campo Dirección */}
                                <div className="space-y-2">
                                    <label className="block font-semibold text-black">
                                        Dirección
                                    </label>
                                    <div className={`rounded-lg border-2 transition-all duration-200 ${errors["Codigo"]
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        } p-4 bg-gray-50`}>
                                        <DireccionForm action={saveDireccion} codigo={propiedad?.Codigo} colonia={propiedad?.Colonia} calle={propiedad?.Calle} />
                                    </div>
                                    {errors["Codigo"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["Codigo"]}</span>
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

export default UpdateModalPropiedad;
