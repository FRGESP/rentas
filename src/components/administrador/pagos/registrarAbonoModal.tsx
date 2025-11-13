"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { X, DollarSign, User, Home, Calendar, CreditCard, AlertCircle } from "lucide-react";
import { registrarAbono } from "@/actions";

interface Pago {
    IdCargo: number;
    IdContrato: number;
    Descripcion: string;
    MontoTotal: number;
    SaldoPendiente: number;
    FechaInicio: string;
    FechaVencimiento: string;
    Estado: 'Pendiente' | 'Parcial' | 'Vencido';
    TipoCargo: 'Fijo' | 'Variable' | 'Extra';
    Inquilino: string;
    Inmueble: string;
    Telefono: string;
    DireccionInmueble: string;
}

interface RegistrarAbonoModalProps {
    pago: Pago;
    onClose: () => void;
    onAbonoRegistrado: () => void;
}

function RegistrarAbonoModal({ pago, onClose, onAbonoRegistrado }: RegistrarAbonoModalProps) {
    const { toast } = useToast();
    const [montoAbono, setMontoAbono] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calcular el nuevo saldo pendiente
    const montoAbonoNum = parseFloat(montoAbono) || 0;
    const nuevoSaldo = pago.SaldoPendiente - montoAbonoNum;

    const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Permitir solo números y un punto decimal
        if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
            setMontoAbono(value);

            // Validación
            const monto = parseFloat(value);
            if (value === "") {
                setErrors({ monto: "El monto es obligatorio" });
            } else if (monto <= 0) {
                setErrors({ monto: "El monto debe ser mayor a 0" });
            } else if (monto > Number(pago.SaldoPendiente)) {
                setErrors({ monto: `El monto no puede ser mayor al saldo pendiente ($${Number(pago.SaldoPendiente).toFixed(2)})` });
            } else {
                setErrors({});
            }
        }
    };

    const handlePagoCompleto = () => {
        setMontoAbono(Number(pago.SaldoPendiente).toFixed(2));
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones finales
        if (!montoAbono || parseFloat(montoAbono) <= 0) {
            setErrors({ monto: "El monto es obligatorio y debe ser mayor a 0" });
            return;
        }

        if (parseFloat(montoAbono) > Number(pago.SaldoPendiente)) {
            setErrors({ monto: "El monto no puede ser mayor al saldo pendiente" });
            return;
        }

        setIsSubmitting(true);

        try {

            const response = await registrarAbono({ IdCargo: pago.IdCargo, Monto: parseFloat(montoAbono) });

            if (response[0] == 200 && response[1].RES == 1) {
                toast({
                    title: "Abono registrado exitosamente",
                    description: `Se registró un abono de $${parseFloat(montoAbono).toFixed(2)} al cargo "${pago.Descripcion}"`,
                    variant: "success",
                });
            } else {
                toast({
                    title: "Error al registrar abono",
                    description: "No se pudo registrar el abono. Intenta de nuevo.",
                    variant: "destructive",
                });
            }
            onAbonoRegistrado();
        } catch (error) {
            console.error("Error al registrar abono:", error);
            toast({
                title: "Error al registrar abono",
                description: "No se pudo registrar el abono. Intenta de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'Vencido':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'Parcial':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'Pendiente':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-navy to-blue-900 text-white rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold">Registrar Abono</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                        disabled={isSubmitting}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Información del Cargo */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getEstadoBadge(pago.Estado)}`}>
                                {pago.Estado}
                            </span>
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                {pago.TipoCargo}
                            </span>
                        </div>

                        <h3 className="font-semibold text-gray-800 text-lg mb-3">{pago.Descripcion}</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                                <User className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-gray-500 text-xs">Inquilino</p>
                                    <p className="font-medium text-gray-800">{pago.Inquilino}</p>
                                    <p className="text-gray-600 text-xs">{pago.Telefono}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Home className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-gray-500 text-xs">Inmueble</p>
                                    <p className="font-medium text-gray-800">{pago.Inmueble}</p>
                                    <p className="text-gray-600 text-xs">{pago.DireccionInmueble}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-gray-500 text-xs">Fecha de Vencimiento</p>
                                    <p className="font-medium text-gray-800">{pago.FechaVencimiento}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <DollarSign className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-gray-500 text-xs">Monto Total</p>
                                    <p className="font-medium text-gray-800">
                                        ${pago.MontoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Saldo Pendiente Destacado */}
                        <div className="mt-4 pt-4 border-t border-gray-300">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Saldo Pendiente Actual:</span>
                                <span className="text-2xl font-bold text-red-600">
                                    ${Number(pago.SaldoPendiente).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de Abono */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="monto" className="block font-semibold text-gray-700">
                                Monto del Abono *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                    $
                                </span>
                                <input
                                    type="text"
                                    id="monto"
                                    value={montoAbono}
                                    onChange={handleMontoChange}
                                    placeholder="0.00"
                                    className={`w-full pl-8 pr-4 py-3 rounded-lg border-2 text-lg font-medium transition-all duration-200 focus:outline-none ${errors.monto
                                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        }`}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.monto && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{errors.monto}</span>
                                </p>
                            )}

                            {/* Botón de Pago Completo */}
                            <button
                                type="button"
                                onClick={handlePagoCompleto}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                                disabled={isSubmitting}
                            >
                                Pagar el saldo completo (${Number(pago.SaldoPendiente).toFixed(2)})
                            </button>
                        </div>

                        {/* Resumen del Abono */}
                        {montoAbonoNum > 0 && !errors.monto && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                                <h4 className="font-semibold text-blue-900 mb-3">Resumen del Abono</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-blue-700">Saldo Actual:</span>
                                        <span className="font-medium text-blue-900">
                                            ${Number(pago.SaldoPendiente).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-700">Monto a Abonar:</span>
                                        <span className="font-medium text-blue-900">
                                            -${montoAbonoNum.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="border-t border-blue-300 pt-2 mt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-700 font-semibold">Nuevo Saldo:</span>
                                            <span className={`font-bold text-lg ${nuevoSaldo === 0 ? 'text-green-600' : 'text-blue-900'}`}>
                                                ${nuevoSaldo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        {nuevoSaldo === 0 && (
                                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                <span>✓</span>
                                                Este abono completará el pago del cargo
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !!errors.monto || !montoAbono}
                        className="flex-1 px-6 py-3 rounded-lg bg-navy text-white font-medium hover:bg-blue-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Registrando...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                Registrar Abono
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RegistrarAbonoModal;
