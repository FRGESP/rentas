"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Edit2, X } from "lucide-react";
import axios from "axios";


interface UpdateCargoFijoProps {
    IdCargoFijoProp: number;
    onGuardado: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

//Guarda la informacion del CargoFijo
export interface CargoFijo {
    Descripcion: string;
    Monto: number;
    DiaCobro: number;
    Plazo: number;
    Estado: "Activo" | "Pausado" | "Completado" | "Perpetuo" | "Renta" | undefined;
}


function UpdateCargoFijo({ IdCargoFijoProp, onGuardado, isOpen, setIsOpen }: UpdateCargoFijoProps) {
    const { toast } = useToast();

    //ContRola el estado de los errores
    const [errors, setErrors] = useState<Record<string, string>>({});

    //Guarda la informacion del CargoFijo
    const [cargoFijo, setCargoFijo] = useState<CargoFijo>()

    //Guarda la informacion del input
    const [inputValue, setInputValue] = useState({
        Descripcion: "",
        Monto: 0,
        DiaCobro: 0,
        Plazo: 0,
        Estado: "",
    });

    // Estado para controlar si el cargo es a plazos o indefinido
    const [esAPlazo, setEsAPlazo] = useState(false);

    // Controla el open del modal cuando la informacion del cargo fijo es cargada
    const [modalReady, setModalReady] = useState(false);

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

    // Cargar datos cuando el modal se abre
    useEffect(() => {
        if (isOpen) {
            // Reiniciar los valores de los inputs y errores al abrir el modal
            setErrors({});
            setInputValue({
                Descripcion: "",
                Monto: 0,
                DiaCobro: 0,
                Plazo: 0,
                Estado: "",
            });
            setEsAPlazo(false);
            getCargoFijo();
        }
    }, [isOpen]);

    //Funcion para cerrar el modal
    const closeModal = () => {
        setIsOpen(false);
        setModalReady(false);
    };

    //Funcion para obtener el id del CargoFijo
    const getCargoFijo = async () => {
        const response = await axios.get(`/api/users/administrador/detalleContratos/cargofijo/${IdCargoFijoProp}`);
        const data = response.data;
        setCargoFijo(data);
        setInputValue({
            Descripcion: data.Descripcion,
            Monto: data.Monto,
            DiaCobro: data.DiaCobro,
            Plazo: data.Estado === "Completado" ? 1 : data.Plazo,
            Estado: data.Estado,
        });
        // Si el plazo es -1 (indefinido), el checkbox debe estar desmarcado
        // Si tiene un plazo específico, el checkbox debe estar marcado
        setEsAPlazo(data.Estado !== "Completado" && data.Plazo !== -1);
        setModalReady(true);
    }

    const handleSubmit = async () => {

        const newErrors: Record<string, string> = {};

        // Validar Descripción
        if (String(inputValue.Descripcion).trim() === "") {
            newErrors["Descripcion"] = "La descripción es obligatoria";
        }

        // Validar Monto
        if (inputValue.Monto <= 0) {
            newErrors["Monto"] = "El monto debe ser mayor a 0";
        }

        // Validar Día de Cobro
        if (inputValue.DiaCobro < 1 || inputValue.DiaCobro > 31) {
            newErrors["DiaCobro"] = "El día de cobro debe estar entre 1 y 31";
        }

        // Validar Plazo solo si es a plazo
        if (esAPlazo && inputValue.Plazo <= 0) {
            newErrors["Plazo"] = "El plazo debe ser mayor a 0";
        }

        setErrors(newErrors);


        if (Object.keys(newErrors).length == 0) {
            try {
                closeModal();
                // Preparar datos para enviar
                // Si no es a plazo, asegurarse de que Plazo sea -1
                const dataToSend = {
                    ...inputValue,
                    Plazo: esAPlazo ? inputValue.Plazo : -1
                };

                const responseUpdate = await axios.put(
                    `/api/users/administrador/detalleContratos/cargofijo/${IdCargoFijoProp}`,
                    dataToSend
                );

                if (responseUpdate.status === 200) {
                    onGuardado();
                    setIsOpen(false);
                    toast({
                        title: "Cargo fijo actualizado",
                        description: "El cargo fijo ha sido actualizado correctamente",
                        variant: "success",
                    });
                } else {
                    toast({
                        title: "Error",
                        description: "Error al actualizar el cargo fijo",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "No se pudo actualizar el cargo fijo",
                    variant: "destructive",
                });
            }
        }
    };


    return (
        <>
            {modalReady && (
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
                                    Editar Cargo Fijo
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
                                        Descripcion
                                    </label>
                                    <input
                                        type="text"
                                        id="Descripcion"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["Descripcion"]
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                            : "border-gray-400"
                                            }`}
                                        name="Descripcion"
                                        onChange={handleChange}
                                        defaultValue={cargoFijo?.Descripcion}
                                    />
                                    {errors["Descripcion"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["Descripcion"]}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Campo Monto */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="Monto"
                                        className="block font-semibold"
                                    >
                                        Monto
                                    </label>
                                    <input
                                        type="number"
                                        id="Monto"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["Monto"]
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                            : "border-gray-400"
                                            }`}
                                        name="Monto"
                                        onChange={handleChange}
                                        defaultValue={cargoFijo?.Monto}
                                        onWheel={(e) => e.currentTarget.blur()}
                                    />
                                    {errors["Monto"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["Monto"]}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Campo Dia de Cobro */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="DiaCobro"
                                        className="block font-semibold"
                                    >
                                        Día de Cobro
                                    </label>
                                    <input
                                        type="number"
                                        id="DiaCobro"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["DiaCobro"]
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                            : "border-gray-400"
                                            }`}
                                        name="DiaCobro"
                                        onChange={handleChange}
                                        defaultValue={cargoFijo?.DiaCobro}
                                        onWheel={(e) => e.currentTarget.blur()}
                                        min="1"
                                        max="31"
                                    />
                                    {errors["DiaCobro"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["DiaCobro"]}</span>
                                        </p>
                                    )}
                                </div>

                                {cargoFijo?.Estado !== "Renta" && (
                                    <div className="space-y-2">
                                        <label className="block font-semibold text-black" htmlFor="Estado">
                                            Estado
                                        </label>
                                        <select
                                            onChange={handleChange}
                                            defaultValue={cargoFijo?.Estado}
                                            name="Estado"
                                            id="Estado"
                                            className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none bg-white ${errors["Estado"]
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                : "border-gray-400"
                                                }`}
                                        >
                                            <option value="Default" disabled hidden>Seleccione el estado</option>
                                            <option value="Activo">Activo</option>
                                            {cargoFijo?.Estado == "Completado" ? null : <option value="Pausado">Pausado</option>}
                                            <option value="Completado">Completado</option>
                                        </select>
                                        {errors["Estado"] && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <span>⚠</span>
                                                <span>{errors["Estado"]}</span>
                                            </p>
                                        )}
                                    </div>
                                )}


                                {((inputValue.Estado == "Activo" || (inputValue.Estado == "Perpetuo" && cargoFijo?.Plazo == -1))) && (
                                    <div>
                                        {/* Checkbox - Cargo a plazos. Solo para cargos fijos distintos de Renta */}
                                        {(cargoFijo?.Estado != "Renta") && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <input
                                                        type="checkbox"
                                                        id="esAPlazo"
                                                        checked={esAPlazo}
                                                        onChange={(e) => {
                                                            setEsAPlazo(e.target.checked);
                                                            if (!e.target.checked) {
                                                                // Si se desmarca, el plazo es indefinido (-1)
                                                                setInputValue({
                                                                    ...inputValue,
                                                                    Plazo: -1
                                                                });
                                                                // Limpiar error de Plazo si existe
                                                                setErrors((prev) => {
                                                                    const newErrors = { ...prev };
                                                                    delete newErrors["Plazo"];
                                                                    return newErrors;
                                                                });
                                                            } else {
                                                                // Si se marca, resetear a 1 por defecto
                                                                setInputValue({
                                                                    ...inputValue,
                                                                    Plazo: 1
                                                                });
                                                            }
                                                        }}
                                                        className="w-5 h-5 text-navy rounded cursor-pointer"
                                                    />
                                                    <label
                                                        htmlFor="esAPlazo"
                                                        className="font-semibold cursor-pointer select-none"
                                                    >
                                                        Cargo a plazo (temporal)
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500 ml-1">
                                                    {esAPlazo
                                                        ? "El cargo se cobrará por un número específico de meses"
                                                        : "El cargo se cobrará de manera indefinida (perpetuo)"}
                                                </p>
                                            </div>
                                        )}

                                        {/* Campo Plazo - Solo visible si es a plazo */}
                                        {esAPlazo && (
                                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                                <label
                                                    htmlFor="Plazo"
                                                    className="block font-semibold"
                                                >
                                                    Plazo (meses)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="Plazo"
                                                    className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["Plazo"]
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                        : "border-gray-400"
                                                        }`}
                                                    name="Plazo"
                                                    onChange={handleChange}
                                                    value={inputValue.Plazo > 0 ? inputValue.Plazo : ""}
                                                    min="1"
                                                    placeholder="Número de meses"
                                                    onWheel={(e) => e.currentTarget.blur()}
                                                />
                                                {errors["Plazo"] && (
                                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                                        <span>⚠</span>
                                                        <span>{errors["Plazo"]}</span>
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    Ingrese el número de meses durante los cuales se cobrará este cargo
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
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
        </>
    );
}

export default UpdateCargoFijo;
