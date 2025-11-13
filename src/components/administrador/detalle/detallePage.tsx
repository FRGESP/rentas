"use client";
import { useMemo } from "react";
import { Ellipsis, Building2, CalendarDays, CircleDollarSign, FileText, MapPin, User2, Phone, MoreVertical, Edit2, Trash2 } from "lucide-react";
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

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FileText className="w-7 h-7 text-navy" />
                        Contrato #{contratoProp}
                    </h1>
                    <div className="text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="inline-flex items-center gap-1"><User2 className="w-4 h-4" /> {contrato?.Inquilino}</span>
                        <span className="inline-flex items-center gap-1"><Phone className="w-4 h-4" /> {contrato?.Telefono}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoBadge(contrato?.Estado)}`}>
                        {contrato?.Estado}
                    </span>
                </div>
            </div>

            {/* Identificación del inmueble */}
            <div className="p-5 rounded-lg bg-white shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-blue-50 text-blue-700"><Building2 className="w-5 h-5" /></div>
                    <div>
                        <p className="text-sm text-gray-500">{contrato?.Tipo}</p>
                        <p className="font-semibold">{contrato?.NombreInmueble}</p>
                        <p className="text-sm text-gray-600 inline-flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" /> {contrato?.Direccion}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-700"><CalendarDays className="w-4 h-4" /> Inicio: {contrato?.FechaCreacion}</div>
                    {/* <div className="flex items-center gap-2 text-gray-700"><BadgeCheck className="w-4 h-4" /> Día de cobro {contrato?.DiaCobro}</div> */}
                </div>
            </div>

            {/* Resumen financiero */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg shadow bg-white">
                    <p className="text-sm text-gray-500">Renta Mensual</p>
                    <p className="text-2xl font-semibold">${currency(contrato?.MontoRenta ? contrato.MontoRenta : 0)}</p>
                </div>
                <div className="p-4 rounded-lg shadow bg-white">
                    <p className="text-sm text-gray-500">Depósito</p>
                    <p className="text-2xl font-semibold">${currency(contrato?.Deposito ? contrato.Deposito : 0)}</p>
                </div>
                <div className="p-4 rounded-lg shadow bg-white">
                    <p className="text-sm text-gray-500">Cargos Vencidos</p>
                    <p className="text-2xl font-semibold">{stats.vencidos} ({currency(stats.montoVencido)})</p>
                </div>
                <div className="p-4 rounded-lg shadow bg-white">
                    <p className="text-sm text-gray-500">Saldo Total</p>
                    <p className="text-2xl font-semibold">{currency(stats.saldoTotal)}</p>
                </div>
            </div>

            <div className="grid xl:grid-cols-3 gap-6">
                {/* Columna principal */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Datos del contrato */}
                    <div className="p-5 rounded-lg shadow bg-white">
                        <h2 className="font-semibold text-lg mb-3">Datos del contrato</h2>
                        <div className="grid sm:grid-cols-2 gap-y-2 text-sm">
                            <span className="text-gray-600">Fecha de creación</span>
                            <span className="text-right">{contrato?.FechaCreacion}</span>
                            <span className="text-gray-600">Plazo (meses)</span>
                            <span className="text-right">{contrato?.Plazo}</span>
                            <span className="text-gray-600">Día de cobro</span>
                            <span className="text-right">{contrato?.DiaCobro}</span>
                        </div>
                    </div>

                    {/* Cargos generados */}
                    <div className="p-5 rounded-lg shadow bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-lg">Cargos</h2>
                            <select
                                className="h-10 min-w-[160px] rounded-lg border border-gray-200 bg-white px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="py-2">Descripción</th>
                                        <th>Monto</th>
                                        <th>Tipo</th>
                                        <th>Inicio</th>
                                        <th>Vencimiento</th>
                                        <th>Estado</th>
                                        <th>Saldo</th>
                                        <th className="text-center"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((c) => (
                                        <tr key={c.IdCargo} className="border-b">
                                            <td className="py-2">{c.Descripcion}</td>
                                            <td>{currency(c.MontoTotal)}</td>
                                            <td>{c.TipoCargo}</td>
                                            <td>{c.FechaInicio}</td>
                                            <td>{c.FechaVencimiento}</td>
                                            <td>
                                                <span
                                                    className={
                                                        "px-2 py-0.5 rounded text-xs " +
                                                        (c.Estado === "Pagado"
                                                            ? "bg-green-100 text-green-700"
                                                            : c.Estado === "Vencido"
                                                                ? "bg-red-100 text-red-700"
                                                                : c.Estado === "Parcial"
                                                                    ? "bg-amber-100 text-amber-700"
                                                                    : c.Estado === "Pendiente"
                                                                        ? "bg-blue-100 text-blue-700"
                                                                        : c.Estado === "Programado"
                                                                            ? "bg-gray-100 text-gray-700"
                                                                            : "bg-gray-100 text-gray-700")
                                                    }
                                                >
                                                    {c.Estado}
                                                </span>
                                            </td>
                                            <td>{currency(c.SaldoPendiente)}</td>
                                            <td className="relative text-center">
                                                {/* Botón de 3 puntos */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleCargoMenu(c.IdCargo);
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors inline-flex items-center justify-center"
                                                    aria-label="Opciones"
                                                >
                                                    <Ellipsis className="w-4 h-4 text-gray-600" />
                                                </button>

                                                {/* Menú desplegable */}
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
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Historial de Abonos */}
                    <div className="p-5 rounded-lg shadow bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <CircleDollarSign className="w-5 h-5 text-green-600" />
                                Historial de Abonos
                            </h2>
                            <span className="text-sm text-gray-500">
                                Total: {currency(abonos.reduce((acc, a) => acc + Number(a.Monto), 0))}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="py-2">ID</th>
                                        <th>Fecha</th>
                                        <th>Cargo</th>
                                        <th>Monto</th>
                                        <th>Usuario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {abonos.length > 0 ? (
                                        abonos.map((abono) => (
                                            <tr key={abono.IdAbono} className="border-b hover:bg-gray-50">
                                                <td className="py-3">{abono.IdAbono}</td>
                                                <td>{abono.Fecha}</td>
                                                <td className="max-w-xs truncate" title={abono.DescripcionCargo}>
                                                    {abono.DescripcionCargo}
                                                </td>
                                                <td className="font-medium text-green-600">
                                                    {currency(abono.Monto)}
                                                </td>
                                                <td>{abono.Usuario}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-6 text-center text-gray-500">
                                                No hay abonos registrados para este contrato
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Columna lateral */}
                <div className="space-y-6">
                    {/* Inquilino */}
                    <div className="p-5 rounded-lg shadow bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <User2 className="w-5 h-5 text-navy" /> Inquilino
                            </h2>
                            <UpdateInquilino IdContrato={contratoProp} onGuardado={() => fetchContratoInfo()} />
                        </div>
                        <div className="text-sm grid grid-cols-2 gap-y-2">
                            <span className="text-gray-600">Nombre</span>
                            <span className="text-right font-medium">{contrato?.Inquilino}</span>
                            <span className="text-gray-600">Teléfono</span>
                            <span className="text-right font-medium">{contrato?.Telefono}</span>
                        </div>
                    </div>

                    {/* Cargos fijos */}
                    <div className="p-5 rounded-lg shadow bg-white">
                        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><CircleDollarSign className="w-5 h-5 text-navy" /> Cargos fijos</h2>
                        <div className="space-y-3">
                            {cargosFijos.map((cf) => (
                                <div key={cf.IdCargoFijo} className="border rounded-md p-3 text-sm flex flex-col gap-1 relative">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium">{cf.Descripcion}</span>
                                                <span className="text-gray-700">${currency(cf.Monto)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Día cobro: {cf.DiaCobro}</span>
                                                <span>Estado: {cf.Estado}</span>
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
                                            <p className="text-[10px] mt-1 text-gray-500">Progreso {cf.PlazoTranscurrido}/{cf.Plazo}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="p-5 rounded-lg shadow bg-white flex flex-col gap-3 text-sm">
                        <AddModalCargos onGuardado={() => fetchContratoInfo()} IdContratoProp={contratoProp} />
                        {/* <button className="px-4 py-2 rounded border">Registrar pago</button> */}
                        <button onClick={() => handleFinalizarContrato()} className="px-4 py-2 rounded border">Finalizar contrato</button>
                    </div>
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

