"use client";
import { useMemo } from "react";
import { Ellipsis, Building2, CalendarDays, CircleDollarSign, FileText, MapPin, User2, Phone, MoreVertical, Edit2, Trash2, ChevronDown, ChevronUp, AlertCircle, DollarSign, Home, Receipt, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getContratoDetalle, deleteCargoFijo, deleteCargo, finalizarContrato } from "@/actions";
import UpdateInquilino from "@/components/administrador/detalle/updateInquilino";
import UpdateCargoFijo from "@/components/administrador/detalle/updateCargoFijo";
import AddModalCargos from "@/components/administrador/detalle/addCargo";
import UpdateCargo from "@/components/administrador/detalle/updateCargo";
import { useRouter } from "next/navigation";


type ContratoDetalle = {
    IdContrato: number;
    Tipo: "Propiedad" | "Unidad";
    NombreInmueble: string;
    Direccion: string;
    Estado: "Activo" | "Finalizado" | "Cancelado";
    FechaCreacion: string; // ISO o legible
    Plazo: number; // meses
    DiaCobro: number;
    MontoRenta: number;
    Deposito: number;
    Inquilino: string;
    Telefono: string;
};

type CargoFijo = {
    IdCargoFijo: number;
    Descripcion: string;
    Monto: number;
    DiaCobro: number;
    Plazo: number; // -1 = indefinido
    PlazoTranscurrido: number;
    Estado: "Activo" | "Pausado" | "Completado" | "Perpetuo" | "Renta" | undefined;
};

type Cargo = {
    IdCargo: number;
    Descripcion: string;
    MontoTotal: number;
    FechaInicio: string;
    FechaVencimiento: string;
    TipoCargo: string;
    Estado: "Pendiente" | "Pagado" | "Parcial" | "Vencido" | "Programado" | undefined;
    SaldoPendiente: number;
};

type Abono = {
    IdAbono: number;
    IdCargo: number;
    DescripcionCargo: string;
    Usuario: string;
    Fecha: string;
    Monto: number;
};

interface DetallePageProps {
    contratoProp: number
}

const currency = (n: number) =>
    n.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });

export default function DetallePage({ contratoProp }: DetallePageProps) {

    const router = useRouter();

    const { toast } = useToast();
    const now = new Date();

    // Estado para almacenar la información del contrato
    const [contrato, setContrato] = useState<ContratoDetalle | null>(null);

    //Estado para almacenar los cargos fijos
    const [cargosFijos, setCargosFijos] = useState<CargoFijo[]>([]);

    //Estado para almacenar los cargos
    const [cargos, setCargos] = useState<Cargo[]>([]);

    //Estado para almacenar los abonos
    const [abonos, setAbonos] = useState<Abono[]>([]);

    const [tipoFilter, setTipoFilter] = useState<string>("all");

    // Estado para controlar qué menú está abierto (para cargos fijos)
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    // Estado para controlar qué menú de cargo está abierto (para cargos normales)
    const [openCargoMenuId, setOpenCargoMenuId] = useState<number | null>(null);

    // Estado para controlar el modal de editar cargo fijo
    const [isUpdateCargoFijoOpen, setIsUpdateCargoFijoOpen] = useState(false);

    // Estado para almacenar el Id del cargo fijo a editar
    const [IdCargoFijo, setIdCargoFijo] = useState<number | 0>(0);

    // Estado para controlar el modal de editar cargo
    const [isUpdateCargoOpen, setIsUpdateCargoOpen] = useState(false);

    // Estado para almacenar el Id del cargo a editar
    const [IdCargo, setIdCargo] = useState<number | 0>(0);

    // Estados para controlar la visibilidad de las secciones
    const [mostrarCargos, setMostrarCargos] = useState(true);
    const [mostrarAbonos, setMostrarAbonos] = useState(true);
    const [mostrarCargosFijos, setMostrarCargosFijos] = useState(true);
    const [mostrarCargosGenerales, setMostrarCargosGenerales] = useState(true);

    // Carga los datos 
    const fetchContratoInfo = async () => {
        try {
            const data = await getContratoDetalle(contratoProp);
            setContrato(data[0][0]);
            setCargosFijos(data[1]);
            setCargos(data[2]);
            setAbonos(data[3]);

            console.log(data[1][0]);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error al cargar Unidades",
                description: "Intenta de nuevo más tarde.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        fetchContratoInfo();
    }, []);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = () => {
            if (openMenuId !== null) {
                setOpenMenuId(null);
            }
            if (openCargoMenuId !== null) {
                setOpenCargoMenuId(null);
            }
        };

        if (openMenuId !== null || openCargoMenuId !== null) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [openMenuId, openCargoMenuId]);

    const stats = useMemo(() => {
        const vencidos = cargos.filter(c => c.Estado === "Vencido");
        const pendientes = cargos.filter(c => c.Estado === "Pendiente" || c.Estado === "Parcial");
        const montoVencido = vencidos.reduce((acc, c) => acc + Number(c.SaldoPendiente), 0);
        const saldoTotal = cargos.reduce((acc, c) => acc + Number(c.SaldoPendiente), 0);
        return { vencidos: vencidos.length, pendientes: pendientes.length, montoVencido, saldoTotal };
    }, [cargos]);

    const filtered = useMemo(() => {
        const byTipo = (p: Cargo) => tipoFilter === 'all' || p.Estado === tipoFilter;
        return cargos.filter((p) => byTipo(p));
    }, [cargos, tipoFilter]);

    const estadoBadge = (estado?: ContratoDetalle["Estado"]) =>
        estado === "Activo"
            ? "bg-green-100 text-green-700"
            : estado === "Finalizado"
                ? "bg-blue-100 text-blue-700"
                : estado === "Cancelado"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700";


    const handleDeleteCargoFijo = async (cargoFijo: CargoFijo) => {

        if (confirm("¿Está seguro de que desea eliminar este cargo fijo?")) {
            try {
                const response = await deleteCargoFijo(cargoFijo.IdCargoFijo);
                if (response.status === 200) {
                    fetchContratoInfo();
                    toast({
                        title: "Cargo fijo eliminado",
                        description: "El Cargo fijo ha sido eliminado correctamente",
                        variant: "success",
                    });
                } else {
                    toast({
                        title: "Error",
                        description: "No se pudo eliminar el Cargo fijo",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error Server",
                    description: "No se pudo eliminar el Cargo fijo",
                    variant: "destructive",
                });
            }
        }
        setOpenMenuId(null);
    };

    const handleFinalizarContrato = async () => {
        console.log("Finalizar contrato");
        if (confirm("¿Está seguro de que desea finalizar este contrato? Esta acción no se puede deshacer.")) {
            try {
                const response = await finalizarContrato(contratoProp);
                if (response.status === 200) {
                    router.push("/users/administrador/propiedades");
                    toast({
                        title: "Contrato finalizado",
                        description: "El contrato ha sido finalizado correctamente",
                        variant: "success",
                    });
                } else {
                    toast({
                        title: "Error",
                        description: "No se pudo finalizar el contrato",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error Server",
                    description: "No se pudo finalizar el contrato",
                    variant: "destructive",
                });
            }
        }
    }

    const toggleMenu = (id: number) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };


    const handleDeleteCargo = async (cargo: Cargo) => {
        if (confirm("¿Está seguro de que desea eliminar este cargo?")) {
            try {
                const response = await deleteCargo(cargo.IdCargo);
                if (response.status === 200) {
                    fetchContratoInfo();
                    toast({
                        title: "Cargo eliminado",
                        description: "El Cargo ha sido eliminado correctamente",
                        variant: "success",
                    });
                } else {
                    toast({
                        title: "Error",
                        description: "No se pudo eliminar el Cargo",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error Server",
                    description: "No se pudo eliminar el Cargo",
                    variant: "destructive",
                });
            }
        }
        setOpenCargoMenuId(null);
    };

    const toggleCargoMenu = (id: number) => {
        setOpenCargoMenuId(openCargoMenuId === id ? null : id);
    };

    const getEstadoCargoStyle = (estado?: Cargo["Estado"]) => {
        switch (estado) {
            case "Pagado":
                return "bg-green-100 text-green-700 border-green-300";
            case "Vencido":
                return "bg-red-100 text-red-700 border-red-300";
            case "Parcial":
                return "bg-amber-100 text-amber-700 border-amber-300";
            case "Pendiente":
                return "bg-blue-100 text-blue-700 border-blue-300";
            case "Programado":
                return "bg-gray-100 text-gray-700 border-gray-300";
            default:
                return "bg-gray-100 text-gray-700 border-gray-300";
        }
    };

    const getCargoBorderColor = (estado?: Cargo["Estado"]) => {
        switch (estado) {
            case "Vencido":
                return "border-red-500";
            case "Parcial":
                return "border-amber-500";
            case "Pendiente":
                return "border-blue-500";
            case "Pagado":
                return "border-green-500";
            default:
                return "border-gray-300";
        }
    };

    return (
        <div className="w-full h-full flex flex-col p-6 2xl:max-w-[95%] 2xl:mx-auto">
            {/* Encabezado */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1 flex justify-center flex-col items-center">
                        <h1 className="text-4xl font-bold flex items-center gap-2">
                            <FileText className="w-8 h-8 text-navy" />
                            Contrato #{contratoProp}
                        </h1>
                        <div className="text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="inline-flex items-center gap-1"><User2 className="w-4 h-4" /> {contrato?.Inquilino}</span>
                            <span className="inline-flex items-center gap-1"><Phone className="w-4 h-4" /> {contrato?.Telefono}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => handleFinalizarContrato()}
                            className="px-4 py-2 rounded text-white bg-red-500 hover:bg-red-600 font-medium transition-colors duration-200"
                        >
                            Finalizar contrato
                        </button>
                    </div>
                </div>
            </div>

            {/* Identificación del inmueble */}
            <div className="p-5 rounded-lg bg-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-blue-50 text-blue-700"><Building2 className="w-5 h-5" /></div>
                    <div>
                        <p className="text-sm text-gray-500">{contrato?.Tipo}</p>
                        <p className="font-semibold text-lg">{contrato?.NombreInmueble}</p>
                        <p className="text-sm text-gray-600 inline-flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" /> {contrato?.Direccion}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-700"><CalendarDays className="w-4 h-4" /> Inicio: {contrato?.FechaCreacion}</div>
                </div>
            </div>

            {/* Resumen financiero */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-navy to-blue-900 text-white rounded-lg p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Renta Mensual</h3>
                        <CircleDollarSign className="w-5 h-5 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">${currency(contrato?.MontoRenta ? contrato.MontoRenta : 0)}</p>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Depósito</h3>
                        <DollarSign className="w-5 h-5 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">${currency(contrato?.Deposito ? contrato.Deposito : 0)}</p>
                </div>
                <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Cargos Vencidos</h3>
                        <AlertCircle className="w-5 h-5 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{`${stats.vencidos} (${currency(stats.montoVencido)})`}</p>
                    <p className="text-sm opacity-90 mt-1"></p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Deuda Total</h3>
                        <DollarSign className="w-5 h-5 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{currency(stats.saldoTotal)}</p>
                </div>
            </div>

            {/* Datos del contrato */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mb-6">
                <div className="p-5 rounded-lg shadow-lg bg-white flex flex-col">
                    <h2 className="font-semibold text-lg mb-3">Datos del contrato</h2>
                    <div className="text-sm grid grid-cols-2 gap-y-2 flex-grow">
                        <span className="text-gray-600">Fecha de creación</span>
                        <span className="text-right">{contrato?.FechaCreacion}</span>
                        <span className="text-gray-600">Plazo (meses)</span>
                        <span className="text-right">{contrato?.Plazo}</span>
                        <span className="text-gray-600">Día de cobro</span>
                        <span className="text-right">{contrato?.DiaCobro}</span>
                    </div>
                </div>
                {/* Inquilino */}
                <div className="p-5 rounded-lg shadow-lg bg-white flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <User2 className="w-5 h-5 text-navy" /> Inquilino
                        </h2>
                        <UpdateInquilino IdContrato={contratoProp} onGuardado={() => fetchContratoInfo()} />
                    </div>
                    <div className="text-sm grid grid-cols-2 gap-y-2 flex-grow">
                        <span className="text-gray-600">Nombre</span>
                        <span className="text-right font-medium">{contrato?.Inquilino}</span>
                        <span className="text-gray-600">Teléfono</span>
                        <span className="text-right font-medium">{contrato?.Telefono}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-6">


                {/* Cargos generados */}
                <div>
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-navy to-blue-900 text-white rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Cargos</h2>
                            
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setMostrarCargos(!mostrarCargos)}
                                className="flex items-center gap-2 text-white transition-colors duration-200 font-medium text-sm"
                            >
                                {mostrarCargos ? (
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
                            <AddModalCargos onGuardado={() => fetchContratoInfo()} IdContratoProp={contratoProp} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
                        {mostrarCargos && (
                            <>

                                {/* Cargos Generales */}
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                                        <CircleDollarSign className="w-5 h-5 text-navy" /> Cargos Generales
                                    </h2>
                                    <button
                                        onClick={() => setMostrarCargosGenerales(!mostrarCargosGenerales)}
                                        className="flex items-center gap-2 text-navy hover:text-blue-900 transition-colors duration-200 font-medium text-sm"
                                    >
                                        {mostrarCargosGenerales ? (
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

                                {mostrarCargosGenerales && (
                                    <div>
                                    <div className="mb-4">
                                        <select
                                            className="w-full h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-navy transition"
                                            value={tipoFilter}
                                            onChange={(e) => setTipoFilter(e.target.value)}
                                        >
                                            <option value="all">Todos los estados</option>
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Programado">Programado</option>
                                            <option value="Vencido">Vencido</option>
                                            <option value="Parcial">Parcial</option>
                                            <option value="Pagado">Pagado</option>
                                        </select>
                                    </div>
                                    {filtered.length !== 0 ?
                                        (<div className="space-y-3">
                                            {filtered.map((c) => (
                                                <div
                                                    key={c.IdCargo}
                                                    className={`border-l-4 ${getCargoBorderColor(c.Estado)} bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-200`}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-800 mb-1">{c.Descripcion}</h3>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                                <span className="font-medium">{c.TipoCargo}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getEstadoCargoStyle(c.Estado)}`}>
                                                                {c.Estado}
                                                            </span>
                                                            <div className="relative">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleCargoMenu(c.IdCargo);
                                                                    }}
                                                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                                    aria-label="Opciones"
                                                                >
                                                                    <MoreVertical className="w-4 h-4 text-gray-600" />
                                                                </button>
                                                                {openCargoMenuId === c.IdCargo && (
                                                                    <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 w-40 py-1">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setIdCargo(c.IdCargo);
                                                                                setIsUpdateCargoOpen(true);
                                                                                setOpenCargoMenuId(null);
                                                                            }}
                                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                                                                        >
                                                                            <Edit2 className="w-4 h-4" />
                                                                            Editar
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteCargo(c)}
                                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                            Eliminar
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                                        <div>
                                                            <span className="text-gray-500">Monto Total:</span>
                                                            <p className="font-bold text-gray-800">
                                                                {currency(c.MontoTotal)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Saldo:</span>
                                                            <p className="font-bold text-red-600">
                                                                {currency(c.SaldoPendiente)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Inicio:</span>
                                                            <p className="font-medium text-gray-700">{c.FechaInicio}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Vencimiento:</span>
                                                            <p className="font-medium text-gray-700">{c.FechaVencimiento}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>) : (<div className="bg-white rounded-lg shadow-lg p-6 h-fit flex flex-col items-center justify-center">
                                            <AlertCircle className="w-12 h-12 text-gray-600 mb-4" />
                                            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2">No hay cargos</h2>
                                            <p className="text-gray-600 text-center">No existen cargos con esos filtros.</p>
                                        </div>)}
                                </div>
                                )}

                                {/* Cargos Fijos */}

                                <div className="flex items-center justify-between my-4">
                                    <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                                        <CircleDollarSign className="w-5 h-5 text-navy" /> Cargos fijos
                                    </h2>
                                    <button
                                        onClick={() => setMostrarCargosFijos(!mostrarCargosFijos)}
                                        className="flex items-center gap-2 text-navy hover:text-blue-900 transition-colors duration-200 font-medium text-sm"
                                    >
                                        {mostrarCargosFijos ? (
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

                                {mostrarCargosFijos && (
                                    <div className="rounded-lg mt-6">
                                    
                                    <div className="space-y-3">
                                        {cargosFijos.map((cf) => (
                                            <div key={cf.IdCargoFijo} className=" flex flex-col gap-1 relative bg-gray-50 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-semibold text-black">{cf.Descripcion}</span>
                                                            <span className="text-black font-bold">{currency(cf.Monto)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-800">
                                                            <span>Día cobro: {cf.DiaCobro}</span>
                                                            <span className="font-medium">{cf.Estado}</span>
                                                        </div>
                                                    </div>
                                                    {/* Botón de 3 puntos */}
                                                    <div className="relative ml-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleMenu(cf.IdCargoFijo);
                                                            }}
                                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                            aria-label="Opciones"
                                                        >
                                                            <MoreVertical className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                        {/* Menú desplegable */}
                                                        {openMenuId === cf.IdCargoFijo && (
                                                            <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 w-40 py-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setIsUpdateCargoFijoOpen(true);
                                                                        setOpenMenuId(null);
                                                                        setIdCargoFijo(cf.IdCargoFijo);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                    Editar
                                                                </button>
                                                                {cf.Estado !== "Renta" && (
                                                                    <button
                                                                        onClick={() => handleDeleteCargoFijo(cf)}
                                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                        Eliminar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {cf.Plazo !== -1 && (
                                                    <div className="mt-2">
                                                        <div className="h-2 bg-gray-200 rounded">
                                                            <div
                                                                className="h-2 bg-navy rounded"
                                                                style={{ width: `${Math.min(100, (cf.PlazoTranscurrido / cf.Plazo) * 100)}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-sm mt-1 text-gray-800">Progreso {cf.PlazoTranscurrido}/{cf.Plazo}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-navy to-blue-900 text-white rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Historial de Abonos</h2>
                        </div>
                        <button
                            onClick={() => setMostrarAbonos(!mostrarAbonos)}
                            className="flex items-center gap-2 text-white transition-colors duration-200 font-medium text-sm"
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
                    {/* Historial de Abonos */}
                    {abonos.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
                            
                            {mostrarAbonos && (
                                <div className="space-y-3">
                                    {abonos.map((abono) => (
                                        <div
                                            key={abono.IdAbono}
                                            className="bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <DollarSign className="w-5 h-5 text-green-600" />
                                                        <span className="text-2xl font-bold text-green-600">
                                                            {currency(abono.Monto)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-1">{abono.DescripcionCargo}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">{abono.Fecha}</p>
                                                </div>
                                            </div>
                                            <div className="border-t border-green-100 pt-2 mt-2">
                                                <div className="grid grid-cols-1 gap-1 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-500 text-xs">
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
                            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2">No hay abonos registrados</h2>
                            <p className="text-gray-600 text-center">No se han registrado abonos para este contrato.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de editar cargo fijo */}
            <UpdateCargoFijo
                IdCargoFijoProp={IdCargoFijo}
                onGuardado={() => fetchContratoInfo()}
                isOpen={isUpdateCargoFijoOpen}
                setIsOpen={setIsUpdateCargoFijoOpen}
            />
            {/* Modal de editar cargo */}
            <UpdateCargo
                IdCargoProp={IdCargo}
                onGuardado={() => fetchContratoInfo()}
                isOpen={isUpdateCargoOpen}
                setIsOpen={setIsUpdateCargoOpen}
            />
        </div>
    );
}

