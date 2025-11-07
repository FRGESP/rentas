'use client'
import { useState, useEffect, useMemo } from "react";
import { getPropiedades, deletePropiedad } from "@/actions";
import { useToast } from "@/hooks/use-toast";
import { Home, Building, Store, Search, Trash2 } from "lucide-react";
import AddModalPropiedades from "./addModalPropiedades";
import UpdateModalPropiedad from "./updateModalPropiedades";
import { useRouter } from 'next/navigation';
import AddModalContrato from "@/components/administrador/contratos/contratoForm";



function PropiedadesPage() {

    const { toast } = useToast();
    const router = useRouter();

    interface Propiedad {
        IdPropiedad: number;
        NombrePropiedad: string;
        NumUnidades: number;
        Direccion: string;
        Tipo: string;
        Ocupados: number;
        Inquilino: String;
        Renta: String;
        FechaInicio: String;

    }

    const [propiedades, setPropiedades] = useState<Propiedad[]>([]);

    const [search, setSearch] = useState<string>("");
    const [tipoFilter, setTipoFilter] = useState<string>("all");


    const fetchPropiedades = async () => {
        try {
            const data = await getPropiedades();
            setPropiedades(data);
            console.log(data);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error al cargar propiedades",
                description: "Intenta de nuevo más tarde.",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("¿Está seguro de que desea eliminar esta propiedad? \nEsto también eliminará todas las unidades y contratos asociados.")) {
            try {
                const response = await deletePropiedad(id);
                if (response.status === 200) {
                    fetchPropiedades();
                    toast({
                        title: "Propiedad eliminada",
                        description: "La propiedad ha sido eliminada correctamente",
                        variant: "success",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "No se pudo eliminar la propiedad",
                    variant: "destructive",
                });
            }
        }
    }

    useEffect(() => {
        fetchPropiedades();
    }, []);

    const filtered = useMemo(() => {
        const bySearch = (p: Propiedad) =>
            p.NombrePropiedad.toLowerCase().includes(search.toLowerCase()) ||
            p.Direccion.toLowerCase().includes(search.toLowerCase());
        const byTipo = (p: Propiedad) => tipoFilter === 'all' || p.Tipo === tipoFilter;
        return propiedades.filter((p) => bySearch(p) && byTipo(p));
    }, [propiedades, search, tipoFilter]);

    const tiposDisponibles = useMemo(() => {
        const set = new Set(propiedades.map(p => p.Tipo));
        return Array.from(set);
    }, [propiedades]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-[2%] 2xl:max-w-[90%] 2xl:mx-auto">

            <h1 className="text-4xl font-bold mb-6">Propiedades</h1>

            <div className="w-[70%] flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                {/* Campo de búsqueda */}
                <form className="flex-1 w-full">
                    <input
                        type="text"
                        name="nombre"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o dirección..."
                        className="w-full rounded-lg py-3 px-4 border border-gray-100 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </form>

                {/* Filtro de tipo */}
                <select
                    className="h-10 min-w-[160px] rounded-lg border border-gray-200 bg-white px-6 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={tipoFilter}
                    onChange={(e) => setTipoFilter(e.target.value)}
                >
                    <option value="all">Todos los tipos</option>
                    {tiposDisponibles.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>

                <AddModalPropiedades onGuardado={() => fetchPropiedades()} />
            </div>

            {filtered.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 w-full'>
                    {filtered.map((p) => (
                        <div key={p.IdPropiedad} className=' rounded-lg p-4 shadow-lg flex flex-col h-full relative'>
                            {/* Botón de eliminar en la esquina superior derecha */}
                            <button
                                className="absolute top-1.5 right-3 p-2 rounded-full hover:bg-red-50 transition-colors group"
                                title="Eliminar propiedad"
                                onClick={() => handleDelete(p.IdPropiedad)}
                            >
                                <Trash2 className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                            </button>

                            <div className="flex items-center justify-between max-w-[90%] gap-4 pr-10">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-semibold leading-tight flex items-center gap-2">
                                            {p.Tipo === "Casa" && <Home className="w-6 h-6 text-navy" />}
                                            {p.Tipo === "Edificio" && <Building className="w-6 h-6 text-navy" />}
                                            {p.Tipo === "Local" && <Store className="w-6 h-6 text-navy" />}
                                            {p.NombrePropiedad}
                                        </h2>
                                    </div>
                                    <p className="text-muted-foreground mt-1">{p.Direccion}</p>
                                </div>


                            </div>

                            <span className="absolute top-12 right-3 text-xs font-medium px-2 py-1 rounded-full border text-navy border-navy">
                                {p.Tipo}
                            </span>

                            {p.Tipo == "Edificio" ? (
                                <div className={`mt-3 text-sm grid grid-cols-2 gap-y-1`}>
                                    <span className="text-black">Unidades</span>
                                    <span className="text-right font-medium">{p.NumUnidades}</span>
                                    <span className="text-black">Ocupados</span>
                                    <span className="text-right font-medium">{p.Ocupados}</span>
                                    <span className="text-black">Disponibles</span>
                                    <span className="text-right font-medium">{p.NumUnidades - p.Ocupados}</span>
                                </div>
                            ) : (
                                (p.Ocupados > 0 ? (
                                    <div className={`mt-3 text-sm grid grid-cols-2 gap-y-1`}>
                                        <span className="text-black">Inquilino</span>
                                        <span className="text-right font-medium">{p.Inquilino}</span>
                                        <span className="text-black">Renta Mensual</span>
                                        <span className="text-right font-medium">{p.Renta}</span>
                                        <span className="text-black">Fecha de Inicio</span>
                                        <span className="text-right font-medium">{p.FechaInicio}</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center mt-4 border-2 border-green-200 rounded-lg p-4">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-lg font-semibold text-green-600">Disponible</span>
                                        <span className="text-xs text-gray-500 mt-1">Listo para rentar</span>
                                    </div>
                                ))
                            )}

                            <div className={`mt-3 ${p.Tipo == "Edificio" ? "" : "hidden"}`}>
                                <div className="flex items-center justify-between text-sm text-black">
                                    <span>Ocupación</span>
                                    <span>{p.Ocupados == 0 ? 0 : (Math.max(0, Math.min(100, Math.round((p.Ocupados / p.NumUnidades) * 100))))}%</span>
                                </div>
                                <div className="mt-1 h-2 w-full rounded bg-muted">
                                    <div
                                        className={`h-2 rounded bg-navy`}
                                        style={{ width: `${p.Ocupados == 0 ? 0 : (Math.max(0, Math.min(100, Math.round((p.Ocupados / p.NumUnidades) * 100))))}%` }}
                                    />
                                </div>
                            </div>

                            <div className="w-full mt-auto pt-3">
                                {p.Tipo == "Edificio" || p.Ocupados > 0 ? (
                                    <button onClick={() => router.push(`${p.Tipo == 'Edificio' ? `/users/administrador/propiedades/${p.IdPropiedad}` : `/users/administrador/propiedades`}`)} className="w-full bg-navy text-white py-2 px-4 rounded-lg hover:bg-navyhover">
                                    Ver detalles 
                                </button>
                                ) : (
                                    <AddModalContrato propiedadProp={p.IdPropiedad} unidadProp={null} onGuardado={() => fetchPropiedades()} />
                                )}
                                <UpdateModalPropiedad IdPropiedad={p.IdPropiedad} onGuardado={() => fetchPropiedades()} />
                            </div>

                        </div>
                    ))}
                </div>
            ) : (
                <div className='w-full h-[50vh] flex flex-col items-center justify-center'>
                    <p className='text-2xl font-semibold mb-2'>No hay propiedades para mostrar</p>
                    <p className='text-lg text-muted-foreground mb-4'>Intenta cambiar los filtros o crear una nueva propiedad.</p>
                </div>
            )}
        </div>
    )
}

export default PropiedadesPage

// onClick={() => router.push(`/users/cajero/pedidos/${pedido.IdPedido}`)}