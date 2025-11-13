"use client"
import { useState, useEffect, useMemo } from "react";
import {
    DollarSign,
    TrendingUp,
    Users,
    AlertCircle,
    Calendar,
    Home,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { getBalance } from "@/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface InquilinoAtrasado {
    IdContrato: number;
    Nombre: string;
    Inmueble: string;
    Direccion: string;
    Telefono: string;
    DiasAtraso: number;
    MontoAdeudo: number;
    UltimoPago: string;
    CargosVencidos: number;
}

interface Abono {
    IdAbono: number;
    Fecha: string;
    Inquilino: string;
    Inmueble: string;
    Monto: number;
    Cargo: string;
    Usuario: string;
}

function BalanceDashboard() {
    // Estados para controlar la visibilidad de las secciones
    const [mostrarInquilinos, setMostrarInquilinos] = useState(true);
    const [mostrarAbonos, setMostrarAbonos] = useState(true);

    const { toast } = useToast();

    const router = useRouter();

    const [inquilinosAtrasados, setInquilinosAtrasados] = useState<InquilinoAtrasado[]>([]);

    const [abonosRecientes, setAbonosRecientes] = useState<Abono[]>([]);

    const fetchData = async () => {
        try {
            const data = await getBalance();
            setInquilinosAtrasados(data[0]);
            setAbonosRecientes(data[1]);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error al cargar Unidades",
                description: "Intenta de nuevo más tarde.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    // Calcular estadísticas principales
    const estadisticas = useMemo(() => {
        const totalAdeudado = inquilinosAtrasados.reduce((sum, i) => sum + Number(i.MontoAdeudo), 0);
        const totalCobrado = abonosRecientes.reduce((sum, a) => sum + Number(a.Monto), 0);
        const totalInquilinosAtrasados = inquilinosAtrasados.length;
        const promedioAtraso = inquilinosAtrasados.reduce((sum, i) => sum + Number(i.DiasAtraso), 0) / inquilinosAtrasados.length;

        return {
            totalAdeudado,
            totalCobrado,
            totalInquilinosAtrasados,
            promedioAtraso: Math.round(promedioAtraso),
        };
    }, [inquilinosAtrasados, abonosRecientes]);

    // Ordenar inquilinos por monto adeudado
    const inquilinosOrdenados = useMemo(() => {
        return [...inquilinosAtrasados].sort((a, b) => b.MontoAdeudo - a.MontoAdeudo);
    }, [inquilinosAtrasados]);

    const getSeveridadColor = (dias: number) => {
        if (dias >= 60) return "bg-red-100 text-red-700 border-red-300";
        if (dias >= 30) return "bg-orange-100 text-orange-700 border-orange-300";
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
    };

    const getSeveridadBorder = (dias: number) => {
        if (dias >= 60) return "border-red-500";
        if (dias >= 30) return "border-orange-500";
        return "border-yellow-500";
    };

    return (
        <div className="w-full h-full flex flex-col p-6 2xl:max-w-[95%] 2xl:mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-4xl font-bold mb-2">Dashboard de Balance</h1>
                <p className="text-gray-600">Vista general de pagos, abonos e inquilinos atrasados</p>
            </div>

            {/* Tarjetas de estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Adeudado */}
                <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Total Adeudado</h3>
                        <AlertCircle className="w-5 h-5 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">${estadisticas.totalAdeudado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>

                </div>

                {/* Total Cobrado (últimos 7 días) */}
                <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Cobrado (7 días)</h3>
                        <TrendingUp className="w-5 h-5 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">${estadisticas.totalCobrado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                </div>

                {/* Inquilinos Atrasados */}
                <div className="bg-gradient-to-br from-navy to-blue-900 text-white rounded-lg p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Inquilinos Atrasados</h3>
                        <Users className="w-5 h-5 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{estadisticas.totalInquilinosAtrasados}</p>
                </div>

                {/* Promedio de Atraso */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Días de retraso promedio</h3>
                        <Calendar className="w-5 h-5 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{estadisticas.promedioAtraso ? estadisticas.promedioAtraso : 0}</p>

                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Inquilinos Atrasados */}
                {inquilinosAtrasados.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg md:text-xl font-bold text-gray-800">Inquilinos Atrasados</h2>
                        </div>
                        <button
                            onClick={() => setMostrarInquilinos(!mostrarInquilinos)}
                            className="flex items-center gap-2 text-navy hover:text-blue-900 transition-colors duration-200 font-medium text-sm"
                        >
                            {mostrarInquilinos ? (
                                <>
                                    <span>Ocultar</span>
                                    <ChevronUp className="w-5 h-5" />
                                </>
                            ) : (
                                <>
                                    <span>Mostrar</span>
                                    <ChevronDown className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>

                    {mostrarInquilinos && (
                        <div className="space-y-3">
                            {inquilinosOrdenados.map((inquilino) => (
                                <div
                                    key={inquilino.IdContrato}
                                    className={`border-l-4 ${getSeveridadBorder(inquilino.DiasAtraso)} bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-200`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 mb-1">{inquilino.Nombre}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                <Home className="w-4 h-4" />
                                                <span>{inquilino.Inmueble}</span>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getSeveridadColor(inquilino.DiasAtraso)}`}>
                                            {inquilino.DiasAtraso} días
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                        <div>
                                            <span className="text-gray-500">Adeudo:</span>
                                            <p className="font-bold text-red-600">
                                                ${inquilino.MontoAdeudo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Cargos vencidos:</span>
                                            <p className="font-bold text-gray-800">{inquilino.CargosVencidos}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-500">Último pago:</span>
                                            <p className="font-medium text-gray-700">{inquilino.UltimoPago}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => router.push(`/users/administrador/balance/${inquilino.IdContrato}`)} className="w-full bg-navy hover:bg-blue-900 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200">
                                            Ver Detalles
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-6 h-fit flex flex-col items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-green-600 mb-4" />
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2">¡No hay inquilinos atrasados!</h2>
                    <p className="text-gray-600 text-center">Todos los inquilinos están al día con sus pagos.</p>
                </div>
                )}

                {/* Abonos Recientes */}
                {abonosRecientes.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-gray-800">Abonos Recientes</h2>
                        </div>
                        <button
                            onClick={() => setMostrarAbonos(!mostrarAbonos)}
                            className="flex items-center gap-2 text-navy hover:text-blue-900 transition-colors duration-200 font-medium text-sm"
                        >
                            {mostrarAbonos ? (
                                <>
                                    <span>Ocultar</span>
                                    <ChevronUp className="w-5 h-5" />
                                </>
                            ) : (
                                <>
                                    <span>Mostrar</span>
                                    <ChevronDown className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>

                    {mostrarAbonos && (
                        <div className="space-y-3">
                            {abonosRecientes.map((abono) => (
                                <div
                                    key={abono.IdAbono}
                                    className="bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <DollarSign className="w-5 h-5 text-green-600" />
                                                <span className="text-2xl font-bold text-green-600">
                                                    ${abono.Monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">{abono.Cargo}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">{abono.Fecha}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-green-100 pt-2 mt-2">
                                        <div className="grid grid-cols-1 gap-1 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users className="w-4 h-4" />
                                                <span className="font-medium">Inquilino:</span>
                                                <span>{abono.Inquilino}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Home className="w-4 h-4" />
                                                <span className="font-medium">Inmueble:</span>
                                                <span className="truncate">{abono.Inmueble}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                                                <span>Registrado por: {abono.Usuario}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-6 h-fit flex flex-col items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-gray-600 mb-4" />
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2">No hay abonos recientes</h2>
                    <p className="text-gray-600 text-center">Esta semana no se han registrado abonos en el sistema.</p>
                </div>
                )}
            </div>
        </div>
    );
}

export default BalanceDashboard;