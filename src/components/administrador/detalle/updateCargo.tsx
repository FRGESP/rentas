"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Receipt, X } from "lucide-react";
import axios from "axios";


interface UpdateCargoProps {
    IdCargoProp: number;
    onGuardado: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

//Guarda la informacion del Cargo
export interface Cargo {
    TipoCargo: string;
    Descripcion: string;
    MontoTotal: number;
    FechaInicio: string;
    FechaVencimiento: string;
    SaldoPendiente: number;
    Estado: 'Pendiente' | 'Pagado' | 'Parcial' | 'Vencido' | 'Programado' | 'Eliminado' | undefined;
}


function UpdateCargo({ IdCargoProp, onGuardado, isOpen, setIsOpen }: UpdateCargoProps) {
    const { toast } = useToast();

    //ContRola el estado de los errores
    const [errors, setErrors] = useState<Record<string, string>>({});

    //Guarda la informacion del Cargo
    const [cargo, setCargo] = useState<Cargo>()

    //Controla si el cargo ya fue pagado
    const [pagado, setPagado] = useState(false);

    //Guarda la informacion del input
    const [inputValue, setInputValue] = useState({
        TipoCargo: "",
        Descripcion: "",
        MontoTotal: 0,
        Estado: "",
        SaldoPendiente: 0,
        FechaInicio: "",
        FechaVencimiento: "",
    });

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
                TipoCargo: "",
                Descripcion: "",
                MontoTotal: 0,
                Estado: "",
                SaldoPendiente: 0,
                FechaInicio: "",
                FechaVencimiento: "",
            });
            getCargo();
        }
    }, [isOpen]);

    //Funcion para cerrar el modal
    const closeModal = () => {
        setIsOpen(false);
        setModalReady(false);
    };

    //Funcion para limpiar la hora de una fecha y comparar solo la fecha
    const limpiarHora = (fecha: Date) => {
        const f = new Date(fecha);
        f.setHours(0, 0, 0, 0);
        return f;
    };

    const parseFechaLocal = (valor: string) => {
        const [year, month, day] = valor.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    //Funcion para obtener el id del Cargo
    const getCargo = async () => {
        const response = await axios.get(`/api/users/administrador/detalleContratos/cargo/${IdCargoProp}`);
        const data = response.data;
        setCargo(data);
        setInputValue({
            TipoCargo: data.TipoCargo,
            Descripcion: data.Descripcion,
            MontoTotal: data.MontoTotal,
            FechaInicio: data.FechaInicio,
            FechaVencimiento: data.FechaVencimiento,
            Estado: data.Estado,
            SaldoPendiente: data.SaldoPendiente,
        });
        setPagado(data.Estado === "Pagado");
        setModalReady(true);
    }

    const handleSubmit = async () => {

        const newErrors: Record<string, string> = {};

        // Validar Descripción
        if (String(inputValue.Descripcion).trim() === "") {
            newErrors["Descripcion"] = "La descripción es obligatoria";
        }

        // Validar Monto Total
        if (inputValue.MontoTotal <= 0) {
            newErrors["MontoTotal"] = "El monto total debe ser mayor a 0";
        }

        // Validar Fecha de Inicio
        if (String(inputValue.FechaInicio).trim() === "") {
            newErrors["FechaInicio"] = "La fecha de inicio es obligatoria";
        }

        // Validar Fecha de Vencimiento
        if (String(inputValue.FechaVencimiento).trim() === "") {
            newErrors["FechaVencimiento"] = "La fecha de vencimiento es obligatoria";
        }

        // Validar Tipo de Cargo
        if (!pagado && cargo?.TipoCargo != "Fijo" && String(inputValue.TipoCargo).trim() === "") {
            newErrors["TipoCargo"] = "El tipo de cargo es obligatorio";
        }

        // Verifica que el Saldo Pendiente no sea mayor al Monto Total
        if (!pagado && Number(inputValue.SaldoPendiente) > Number(inputValue.MontoTotal)) {
            newErrors["SaldoPendiente"] = "El saldo pendiente no puede ser mayor al monto total";
        }

        //Verifica que la Fecha de Vencimiento no sea menor a la Fecha de Inicio
        if (!pagado && parseFechaLocal(inputValue.FechaVencimiento) < parseFechaLocal(inputValue.FechaInicio)) {
            newErrors["FechaVencimiento"] = "La fecha de vencimiento no puede ser menor a la fecha de inicio";
        }

        //Verifica que la Fecha de Inicio no sea menor a la fecha actual
        if (!pagado && cargo?.TipoCargo != "Fijo" && parseFechaLocal(inputValue.FechaInicio) < limpiarHora(new Date())) {
            newErrors["FechaInicio"] = "La fecha de inicio no puede ser menor a la fecha actual";
        }

        //Verifica que la Fecha de Vencimiento no sea menor a la fecha actual
        if (!pagado && parseFechaLocal(inputValue.FechaVencimiento) < limpiarHora(new Date())) {
            newErrors["FechaVencimiento"] = "La fecha de vencimiento no puede ser menor a la fecha actual";
        }

        // Verifica que la fecha de vencimiento no sea la misma que la fecha de inicio
        if (!pagado && parseFechaLocal(inputValue.FechaVencimiento) <= parseFechaLocal(inputValue.FechaInicio)) {
            newErrors["FechaVencimiento"] = "La fecha de vencimiento no puede ser la misma que la fecha de inicio";
        }

        // Si no está pagado, el saldo pendiente no puede ser 0
        if (!pagado && inputValue.SaldoPendiente <= 0) {
            newErrors["SaldoPendiente"] = "El saldo pendiente debe ser mayor a 0 si el cargo no está pagado";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length == 0) {
            try {
                closeModal();

                const responseUpdate = await axios.put(
                    `/api/users/administrador/detalleContratos/cargo/${IdCargoProp}`,
                    inputValue
                );

                if (responseUpdate.status === 200) {
                    onGuardado();
                    setIsOpen(false);
                    toast({
                        title: "Cargo actualizado",
                        description: "El cargo ha sido actualizado correctamente",
                        variant: "success",
                    });
                } else {
                    toast({
                        title: "Error",
                        description: "Error al actualizar el cargo",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "No se pudo actualizar el cargo",
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
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-navy to-blue-900 text-white rounded-t-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                                        <Receipt className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Editar Cargo</h2>
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
                                        defaultValue={cargo?.Descripcion}
                                    />
                                    {errors["Descripcion"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["Descripcion"]}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Campo Monto */}
                                {(cargo?.Estado !== "Pagado" || !pagado) && (
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="MontoTotal"
                                            className="block font-semibold"
                                        >
                                            Monto
                                        </label>
                                        <input
                                            type="number"
                                            id="MontoTotal"
                                            className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["MontoTotal"]
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                : "border-gray-400"
                                                }`}
                                            name="MontoTotal"
                                            onChange={handleChange}
                                            defaultValue={cargo?.MontoTotal}
                                            onWheel={(e) => e.currentTarget.blur()}
                                        />
                                        {errors["MontoTotal"] && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <span>⚠</span>
                                                <span>{errors["MontoTotal"]}</span>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {!pagado && (
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="SaldoPendiente"
                                            className="block font-semibold"
                                        >
                                            Saldo Pendiente
                                        </label>
                                        <input
                                            type="number"
                                            id="SaldoPendiente"
                                            className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["SaldoPendiente"]
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                : "border-gray-400"
                                                }`}
                                            name="SaldoPendiente"
                                            onChange={handleChange}
                                            defaultValue={cargo?.SaldoPendiente}
                                            onWheel={(e) => e.currentTarget.blur()}
                                        />
                                        {errors["SaldoPendiente"] && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <span>⚠</span>
                                                <span>{errors["SaldoPendiente"]}</span>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {(cargo?.TipoCargo != "Fijo" && !pagado) && (
                                    <div>
                                        <div className="space-y-2">
                                            <label className="block font-semibold text-black" htmlFor="TipoCargo">
                                                Tipo
                                            </label>
                                            <select
                                                onChange={handleChange}
                                                defaultValue={cargo?.TipoCargo}
                                                name="TipoCargo"
                                                id="TipoCargo"
                                                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none bg-white ${errors["TipoCargo"]
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                    : "border-gray-400"
                                                    }`}
                                            >
                                                <option value="Default" disabled hidden>Seleccione el tipo</option>
                                                <option value="Variable">Variable</option>
                                                <option value="Extra">Extra</option>
                                            </select>
                                            {errors["TipoCargo"] && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <span>⚠</span>
                                                    <span>{errors["TipoCargo"]}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2 mt-4">
                                            <label
                                                htmlFor="FechaInicio"
                                                className="block font-semibold"
                                            >
                                                Fecha de Inicio
                                            </label>
                                            <input
                                                type="date"
                                                id="FechaInicio"
                                                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["FechaInicio"]
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                    : "border-gray-400"
                                                    }`}
                                                name="FechaInicio"
                                                onChange={(e) => {
                                                    handleChange(e);
                                                }}
                                                defaultValue={cargo?.FechaInicio}
                                                onWheel={(e) => e.currentTarget.blur()}
                                            />
                                            {errors["FechaInicio"] && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <span>⚠</span>
                                                    <span>{errors["FechaInicio"]}</span>
                                                </p>
                                            )}
                                        </div>

                                        
                                    </div>

                                )}

                                {!pagado && (
                                    <div className="space-y-2 mt-4">
                                            <label
                                                htmlFor="FechaVencimiento"
                                                className="block font-semibold"
                                            >
                                                Fecha de Vencimiento
                                            </label>
                                            <input
                                                type="date"
                                                id="FechaVencimiento"
                                                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["FechaVencimiento"]
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                    : "border-gray-400"
                                                    }`}
                                                name="FechaVencimiento"
                                                onChange={handleChange}
                                                defaultValue={cargo?.FechaVencimiento}
                                                onWheel={(e) => e.currentTarget.blur()}
                                            />
                                            {errors["FechaVencimiento"] && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <span>⚠</span>
                                                    <span>{errors["FechaVencimiento"]}</span>
                                                </p>
                                            )}
                                        </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <input
                                            type="checkbox"
                                            id="pagado"
                                            checked={pagado}
                                            onChange={(e) => {
                                                setPagado(e.target.checked);
                                                if (!e.target.checked) {
                                                    // Si se desmarca, el estado vuelve al estado anterior
                                                    setInputValue({
                                                        ...inputValue,
                                                        Estado: cargo?.Estado == "Pagado" ? "Pendiente" : cargo?.Estado || "",
                                                        SaldoPendiente: cargo?.SaldoPendiente || 0,
                                                    });
                                                    setPagado(false);
                                                } else {
                                                    // Si se marca, el estado se pone en "Pagado"
                                                    setInputValue({
                                                        ...inputValue,
                                                        Estado: "Pagado",
                                                        SaldoPendiente: 0,
                                                    });
                                                    setPagado(true);
                                                }
                                            }}
                                            className="w-5 h-5 text-navy rounded cursor-pointer"
                                        />
                                        <label
                                            htmlFor="pagado"
                                            className="font-semibold cursor-pointer select-none"
                                        >
                                            Cargo Pagado
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 ml-1">
                                        {pagado
                                            ? "El cargo se marcará como pagado y el saldo pendiente será 0"
                                            : "El cargo mantendrá su estado actual"}
                                    </p>
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
        </>
    );
}

export default UpdateCargo;
