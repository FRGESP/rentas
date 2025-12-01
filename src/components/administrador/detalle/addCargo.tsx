"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Receipt, X, SquarePlus } from "lucide-react";
import { addCargo } from "@/actions";

interface AddModalProps {
    onGuardado: () => void;
    IdContratoProp: number;
}

function AddModalCargos({ onGuardado, IdContratoProp }: AddModalProps) {
    const { toast } = useToast();

    //Controla el estado del modal
    const [isOpen, setIsOpen] = useState(false);

    //Controla el estado de los errores
    const [errors, setErrors] = useState<Record<string, string>>({});

    //Guarda el tipo de cargo
    const [tipoCargo, setTipoCargo] = useState("");

    // Estado para controlar si el cargo es a plazos o indefinido
    const [esAPlazo, setEsAPlazo] = useState(false);

    // Estado para controlar si es programado o no
    const [isProgramado, setIsProgramado] = useState(false);

    //Guarda la informacion del input
    const [inputValue, setInputValue] = useState({
        descripcion: "",
        monto: "",
        tipo: "",
        diaCobro: 0,
        plazo: -1,
        fechaInicio: "",
        fechaVencimiento: "",
    });


    //Controla el cambio del input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInputValue({
            ...inputValue,
            [name]: value,
        });
        console.log(inputValue);

        if (name === "tipo") {
            setTipoCargo(value);
        }

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
            descripcion: "",
            monto: "",
            tipo: "",
            diaCobro: 0,
            plazo: -1,
            fechaInicio: "",
            fechaVencimiento: "",
        });
        setEsAPlazo(false);
        setTipoCargo("");
        setIsProgramado(false);
    };
    //Funcion para cerrar el modal
    const closeModal = () => {
        setIsOpen(false);
    };




    const handleSubmit = async () => {

        console.log("Submitting with values:", inputValue);

        const newErrors: Record<string, string> = {};

        Object.entries(inputValue).forEach(([Key, value]) => {
            if (Key === "descripcion" || Key === "monto" || Key === "tipo") {
                if (String(value).trim() === "") {
                    newErrors[Key] = "Este campo es obligatorio";
                }
            }

            if (Key === "plazo" && tipoCargo === "Fijo" && !esAPlazo) {
                // Si el cargo es fijo y no es a plazos, no es obligatorio
                return;
            }

            if (Key === "plazo" && tipoCargo === "Fijo" && esAPlazo && (value === "" || Number(value) <= 0)) {
                newErrors[Key] = "Este campo es obligatorio y mayor a 0";
            }

            if ((Key === "fechaInicio" || Key === "fechaVencimiento") && tipoCargo !== "Fijo" && isProgramado && String(value).trim() === "") {
                newErrors[Key] = "Este campo es obligatorio"
            }

            if (Key === "fechaInicio") {
                if (inputValue.fechaVencimiento && new Date(String(value)) > new Date(String(inputValue.fechaVencimiento))) {
                    newErrors[Key] = "La fecha de inicio no puede ser mayor que la fecha de vencimiento";
                }
                //Verifica que la fecha de inicio no sea menor a la fecha actual
                const today = new Date();
                if (new Date(String(value)) < today) {
                    newErrors[Key] = "La fecha de inicio no puede ser menor a la fecha actual";
                }
            }
            if (Key === "fechaVencimiento") {
                if (inputValue.fechaInicio && new Date(String(value)) < new Date(String(inputValue.fechaInicio))) {
                    newErrors[Key] = "La fecha de vencimiento no puede ser menor que la fecha de inicio";
                }

                //Verifica que la fecha de vencimiento no sea menor a la fecha actual
                const today = new Date();
                if (new Date(String(value)) < today) {
                    newErrors[Key] = "La fecha de vencimiento no puede ser menor a la fecha actual";
                }
            }

            if (Key === "diaCobro" && tipoCargo === "Fijo") {
                if (String(value).trim() === "" || Number(value) < 1 || Number(value) > 31) {
                    newErrors[Key] = "Ingrese un día válido entre 1 y 31";
                }
            }

        })
        setErrors(newErrors);

        if (Object.keys(newErrors).length == 0) {
            try {

                const response = await addCargo(inputValue, IdContratoProp);
                if (response === 200) {
                    setIsOpen(false);

                    toast({
                        title: "Cargo agregado",
                        description: "El cargo ha sido agregado correctamente",
                        variant: "success",
                    });
                    onGuardado();
                } else {
                    toast({
                        title: "Error",
                        description: "No se pudo agregar el cargo",
                        variant: "destructive",
                    });
                }

            } catch (error) {
                console.error("Error adding cargo:", error);
                toast({
                    title: "Error Server",
                    description: "No se pudo agregar el cargo",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <div>
            <button className=" rounded-md" onClick={openModal}>
                <SquarePlus
                    className="text-white stroke-[1.5]"
                    size={38}

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
                                        <Receipt className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Agregar Cargo</h2>
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
                                {/* Campo Descripción */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="descripcion"
                                        className="block font-semibold text-gray-900"
                                    >
                                        Descripción del cargo
                                    </label>
                                    <input
                                        type="text"
                                        id="descripcion"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none text-gray-900 ${errors["descripcion"]
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                            : "border-gray-400"
                                            }`}
                                        autoFocus
                                        name="descripcion"
                                        placeholder="Ej: Mantenimiento"
                                        onChange={handleChange}
                                    />
                                    {errors["descripcion"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["descripcion"]}</span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="monto"
                                        className="block font-semibold text-gray-900"
                                    >
                                        Monto del cargo
                                    </label>
                                    <input
                                        type="number"
                                        id="monto"
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none text-gray-900 ${errors["monto"]
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

                                <div className="space-y-2">
                                    <label className="block font-semibold text-black" htmlFor="tipo">
                                        Tipo de cargo
                                    </label>
                                    <select
                                        onChange={handleChange}
                                        name="tipo"
                                        id="tipo"
                                        defaultValue={'Default'}
                                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none bg-white text-gray-900 ${errors["tipo"]
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                            : "border-gray-400"
                                            }`}
                                    >
                                        <option value="Default" disabled hidden>Seleccione el tipo de cargo</option>
                                        <option value="Fijo">Fijo</option>
                                        <option value="Variable">Variable</option>
                                        <option value="Extra">Extra</option>
                                    </select>
                                    {errors["tipo"] && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <span>⚠</span>
                                            <span>{errors["tipo"]}</span>
                                        </p>
                                    )}
                                </div>

                                {tipoCargo === "Fijo" ? (
                                    <div>
                                        <div>
                                            <label
                                                htmlFor="diaCobro"
                                                className="block font-semibold text-gray-900"
                                            >
                                                Día de cobro del cargo
                                            </label>
                                            <input
                                                type="number"
                                                id="diaCobro"
                                                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none text-gray-900 ${errors["diaCobro"]
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                    : "border-gray-400"
                                                    }`}
                                                name="diaCobro"
                                                placeholder="Ej: 8"
                                                onChange={handleChange}
                                                onWheel={(e) => e.currentTarget.blur()}
                                                min="1"
                                                max="31"
                                            />
                                            {errors["diaCobro"] && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <span>⚠</span>
                                                    <span>{errors["diaCobro"]}</span>
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-1 mt-4">
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
                                                                plazo: -1
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
                                                                plazo: 1
                                                            });
                                                        }
                                                    }}
                                                    className="w-5 h-5 text-navy rounded cursor-pointer"
                                                />
                                                <label
                                                    htmlFor="esAPlazo"
                                                    className="font-semibold cursor-pointer select-none text-gray-900"
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

                                        {esAPlazo && (
                                            <div className="space-y-2 mt-4 animate-in slide-in-from-top-2 duration-200">
                                                <label
                                                    htmlFor="plazo"
                                                    className="block font-semibold text-gray-900"
                                                >
                                                    Plazo (meses)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="plazo"
                                                    className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none text-gray-900 ${errors["plazo"]
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                        : "border-gray-400"
                                                        }`}
                                                    name="plazo"
                                                    onChange={handleChange}

                                                    defaultValue={1}
                                                    placeholder="Número de meses"
                                                    onWheel={(e) => e.currentTarget.blur()}
                                                />
                                                {errors["plazo"] && (
                                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                                        <span>⚠</span>
                                                        <span>{errors["plazo"]}</span>
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    Ingrese el número de meses durante los cuales se cobrará este cargo
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (tipoCargo !== "" && (
                                    <div>
                                        <div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <input
                                                    type="checkbox"
                                                    id="esProgramado"
                                                    checked={isProgramado}
                                                    onChange={(e) => {
                                                        setIsProgramado(e.target.checked);
                                                        if (!e.target.checked) {
                                                            // Si se desmarca, el plazo es indefinido (-1)
                                                            setInputValue({
                                                                ...inputValue,
                                                                fechaInicio: ""
                                                            });
                                                            // Limpiar error de fechaInicio si existe
                                                            setErrors((prev) => {
                                                                const newErrors = { ...prev };
                                                                delete newErrors["fechaInicio"];
                                                                return newErrors;
                                                            });
                                                        } else {
                                                            // Si se marca, resetear a 1 por defecto
                                                            setInputValue({
                                                                ...inputValue,
                                                                plazo: 1
                                                            });
                                                        }
                                                    }}
                                                    className="w-5 h-5 text-navy rounded cursor-pointer"
                                                />
                                                <label
                                                    htmlFor="esProgramado"
                                                    className="font-semibold cursor-pointer select-none text-gray-900"
                                                >
                                                    Cargo programado
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500 ml-1">
                                                {isProgramado
                                                    ? "El cargo se asignará en la fecha programada"
                                                    : "El cargo se asignará de forma inmediata"}
                                            </p>
                                        </div>

                                        {isProgramado && (
                                            <div className="space-y-2 mt-4 animate-in slide-in-from-top-2 duration-200">
                                                <label
                                                    htmlFor="fechaInicio"
                                                    className="block font-semibold text-gray-900"
                                                >
                                                    Fecha de inicio
                                                </label>
                                                <input
                                                    type="date"
                                                    id="fechaInicio"
                                                    className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none text-gray-900 ${errors["fechaInicio"]
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                        : "border-gray-400"
                                                        }`}
                                                    name="fechaInicio"
                                                    onChange={handleChange}
                                                    placeholder="Fecha de inicio"
                                                    onWheel={(e) => e.currentTarget.blur()}
                                                />
                                                {errors["fechaInicio"] && (
                                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                                        <span>⚠</span>
                                                        <span>{errors["fechaInicio"]}</span>
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    Ingrese la fecha de inicio del cargo
                                                </p>
                                            </div>
                                        )}
                                        <div className="space-y-2 mt-4 animate-in slide-in-from-top-2 duration-200">
                                            <label
                                                htmlFor="fechaVencimiento"
                                                className="block font-semibold text-gray-900"
                                            >
                                                Fecha de vencimiento
                                            </label>
                                            <input
                                                type="date"
                                                id="fechaVencimiento"
                                                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none text-gray-900 ${errors["fechaVencimiento"]
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                    : "border-gray-400"
                                                    }`}
                                                name="fechaVencimiento"
                                                onChange={handleChange}
                                                placeholder="Fecha de vencimiento"
                                            />
                                            {errors["fechaVencimiento"] && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <span>⚠</span>
                                                    <span>{errors["fechaVencimiento"]}</span>
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                Ingrese la fecha de inicio del cargo
                                            </p>
                                        </div>
                                    </div>
                                ))}

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
                                    Agregar Cargo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddModalCargos;
