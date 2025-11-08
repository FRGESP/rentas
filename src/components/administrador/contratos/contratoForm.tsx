"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, ClipboardPenLine } from "lucide-react";
import { addContrato } from "@/actions";

interface AddModalProps {
    onGuardado: () => void;
    propiedadProp?: number | null;
    unidadProp?: number | null;
}

function AddModalContrato({ onGuardado, propiedadProp, unidadProp }: AddModalProps) {
    const { toast } = useToast();

    //Controla el estado del modal
    const [isOpen, setIsOpen] = useState(false);

    //Controla el estado de los errores
    const [errors, setErrors] = useState<Record<string, string>>({});

    //Guarda la informacion del input
    const [inputValue, setInputValue] = useState({
        nombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        telefono: "",
        inmueble: unidadProp ? unidadProp.toString() : propiedadProp ? propiedadProp.toString() : "",
        propBoolean: propiedadProp ? "1" : "0",
        monto: "",
        deposito: "",
        plazo: "",
        diaCobro: "",
    });


    //Controla el cambio del input
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
    const openModal = () => {
        setIsOpen(true);
        // Reiniciar los valores de los inputs y errores al abrir el modal
        setErrors({});
        setInputValue({
            nombre: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            telefono: "",
            inmueble: unidadProp ? unidadProp.toString() : propiedadProp ? propiedadProp.toString() : "",
            propBoolean: propiedadProp ? "1" : "0",
            monto: "",
            deposito: "",
            plazo: "",
            diaCobro: "",
        });
    };
    //Funcion para cerrar el modal
    const closeModal = () => {
        setIsOpen(false);
    };




    const handleSubmit = async () => {

        const newErrors: Record<string, string> = {};

        Object.entries(inputValue).forEach(([Key, value]) => {

            let clean = "";

            if (Key === "telefono" || Key === "monto" || Key === "deposito" || Key === "diaCobro") {
                if (Key === "telefono" || Key === "diaCobro") {
                    clean = value.replace(/\D/g, "");
                } else {
                    clean = value.replace(/[^0-9.]/g, "");
                }

                if (isNaN(Number(clean))) {
                    newErrors[Key] = "Ingrese un valor numérico válido";
                }

                if (Key === "telefono" && clean.length !== 10) {
                    newErrors[Key] = "El teléfono debe tener 10 dígitos numéricos";
                }

                if (Key === "diaCobro" && (Number(clean) < 1 || Number(clean) > 31)) {
                    newErrors[Key] = "El día de cobro debe estar entre 1 y 31";
                }
            }
            if (value.trim() === "") {
                newErrors[Key] = "Este campo es obligatorio"
            }

        })
        setErrors(newErrors);

        if (Object.keys(newErrors).length == 0) {
            try {
                const response = await addContrato(inputValue);
                console.log(response);
                if (response === 200) {
                    setIsOpen(false);
                    toast({
                        title: "Contrato creado",
                        description: "El contrato ha sido creado correctamente",
                        variant: "success",
                    });
                    onGuardado();
                } else {
                    toast({
                        title: "Error",
                        description: "No se pudo crear el contrato",
                        variant: "destructive",
                    });
                }

            } catch (error) {
                console.error("Error adding contract:", error);
                toast({
                    title: "Error Server",
                    description: "No se pudo crear el contrato",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <div>
            <div className="w-full mt-auto">
                <button onClick={openModal} className="w-full bg-navy text-white py-2 px-4 rounded-lg hover:bg-navyhover flex items-center justify-center gap-2">
                    <ClipboardPenLine className="w-6 h-6 text-white" />
                    Crear Contrato
                </button>
            </div>

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
                                    Crear Contrato
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
                                        Nombre del inquilino
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
                                        placeholder="Ej: Pedro"
                                        onChange={handleChange}
                                    />
                                    {errors["nombre"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["nombre"]}</span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="apellidoPaterno"
                                        className="block font-semibold"
                                    >
                                        Apellido Paterno
                                    </label>
                                    <input
                                        type="text"
                                        id="apellidoPaterno"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["apellidoPaterno"]
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                            : "border-gray-400"
                                            }`}
                                        name="apellidoPaterno"
                                        placeholder="Ej: González"
                                        onChange={handleChange}
                                    />
                                    {errors["apellidoPaterno"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["apellidoPaterno"]}</span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="apellidoMaterno"
                                        className="block font-semibold"
                                    >
                                        Apellido Materno
                                    </label>
                                    <input
                                        type="text"
                                        id="apellidoMaterno"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["apellidoMaterno"]
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                            : "border-gray-400"
                                            }`}
                                        name="apellidoMaterno"
                                        placeholder="Ej: López"
                                        onChange={handleChange}
                                    />
                                    {errors["apellidoMaterno"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["apellidoMaterno"]}</span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="telefono"
                                        className="block font-semibold"
                                    >
                                        Teléfono
                                    </label>
                                    <input
                                        type="number"
                                        id="telefono"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["telefono"]
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                            : "border-gray-400"
                                            }`}
                                        name="telefono"
                                        placeholder="Ej: 4451234567"
                                        onChange={handleChange}
                                        onWheel={(e) => e.currentTarget.blur()}
                                    />
                                    {errors["telefono"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["telefono"]}</span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="monto"
                                        className="block font-semibold"
                                    >
                                        Monto Mensual de Renta
                                    </label>
                                    <input
                                        type="number"
                                        id="monto"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["monto"]
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                            : "border-gray-400"
                                            }`}
                                        name="monto"
                                        placeholder="Ej: 2000"
                                        onChange={handleChange}
                                        onWheel={(e) => e.currentTarget.blur()}
                                    />
                                    {errors["monto"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["monto"]}</span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="deposito"
                                        className="block font-semibold"
                                    >
                                        Monto de Depósito
                                    </label>
                                    <input
                                        type="number"
                                        id="deposito"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["deposito"]
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                            : "border-gray-400"
                                            }`}
                                        name="deposito"
                                        placeholder="Ej: 2000"
                                        onChange={handleChange}
                                        onWheel={(e) => e.currentTarget.blur()}
                                    />
                                    {errors["deposito"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["deposito"]}</span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="plazo"
                                        className="block font-semibold"
                                    >
                                        Plazo (meses)
                                    </label>
                                    <input
                                        type="number"
                                        id="plazo"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["plazo"]
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                            : "border-gray-400"
                                            }`}
                                        name="plazo"
                                        placeholder="Ej: 6"
                                        onChange={handleChange}
                                        onWheel={(e) => e.currentTarget.blur()}
                                    />
                                    {errors["plazo"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["plazo"]}</span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="diaCobro"
                                        className="block font-semibold"
                                    >
                                        Día de Cobro
                                    </label>
                                    <input
                                        type="number"
                                        id="diaCobro"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["diaCobro"]
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                            : "border-gray-400"
                                            }`}
                                        name="diaCobro"
                                        placeholder="Ej: 15"
                                        onChange={handleChange}
                                        onWheel={(e) => e.currentTarget.blur()}
                                    />
                                    {errors["diaCobro"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["diaCobro"]}</span>
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
                                    Crear Contrato
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddModalContrato;
