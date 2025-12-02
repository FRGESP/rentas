'use client'
import { useState, useEffect, useMemo } from "react";
import { getUnidades, deleteUnidad } from "@/actions";
import { useToast } from "@/hooks/use-toast";
import { Home, Trash2, Key } from "lucide-react";
import AddModalUnidades from "./addModalUnidad";
import UpdateModalUnidad from "./updateModalUnidad";
import AddModalContrato from "@/components/administrador/contratos/contratoForm";
import { useRouter } from 'next/navigation';
import axios from "axios";

interface UnidadPageProps {
    IdPropiedadProp: number;
}

function UnidadesPage({ IdPropiedadProp }: UnidadPageProps) {

    const { toast } = useToast();
    const router = useRouter();

    interface Unidad {
        IdUnidad: number;
        NombreUnidad: string;
        Inquilino: String;
        Renta: String;
        FechaInicio: String;
        PagosVencidos: number;
        Contrato: number;
    }

    const [Unidades, setUnidades] = useState<Unidad[]>([]);

    //Guarda la informacion de la propiedad
    const [propiedad, setPropiedad] = useState<string | null>(null);

    const [search, setSearch] = useState<string>("");

    const fetchUnidades = async () => {
        try {
            const data = await getUnidades(IdPropiedadProp);
            setUnidades(data[1]);
            setPropiedad(data[0][0].NombrePropiedad);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error al cargar Unidades",
                description: "Intenta de nuevo más tarde.",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("¿Está seguro de que desea eliminar esta Unidad?")) {
            try {
                const response = await axios.delete(`/api/users/administrador/propiedades/unidades/${id}`);
                if (response.status === 200) {
                    if (response.data.RES == 1) {
                        toast({
                            title: "No se puede eliminar la unidad",
                            description: "La unidad cuenta con un contrato activo, por lo que no se puede eliminar.",
                            variant: "warning",
                        });
                    } else {
                        fetchUnidades();
                        toast({
                            title: "Unidad eliminada",
                            description: "La unidad ha sido eliminada",
                            variant: "success",
                        });
                    }
                } else {
                    toast({
                        title: "Error estatus",
                        description: "La propiedad no ha sido eliminada correctamente",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "No se pudo eliminar la Unidad",
                    variant: "destructive",
                });
            }
        }
    }

    useEffect(() => {
        fetchUnidades();
    }, []);

    const filtered = useMemo(() => {
        const bySearch = (p: Unidad) =>
            p.NombreUnidad.toLowerCase().includes(search.toLowerCase());
        return Unidades.filter((p) => bySearch(p));
    }, [Unidades, search]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-[2%] 2xl:max-w-[90%] 2xl:mx-auto">

            <div className="flex items-center gap-3 py-6">
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <h2 className="text-4xl font-semibold leading-tight flex items-center gap-2">
                            <Key className="w-12 h-12 text-navy" />
                            {propiedad || "Propiedad"}
                        </h2>
                    </div>
                    <p className="text-xl text-gray-600">Gestión de Unidades</p>
                </div>
            </div>

            <div className="w-[70%] flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                {/* Campo de búsqueda */}
                <form className="flex-1 w-full">
                    <input
                        type="text"
                        name="nombre"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o dirección..."
                        className="w-full rounded-lg py-3 px-4 text-base shadow-lg border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </form>
                {propiedad == null ? null : <AddModalUnidades onGuardado={() => fetchUnidades()} propiedadProp={IdPropiedadProp} />}
            </div>

            {filtered.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-4 w-full'>
                    {filtered.map((p) => (
                        <div key={p.IdUnidad} className='col-span-2 rounded-lg p-4 shadow-lg flex flex-col h-full relative'>
                            {/* Botón de eliminar en la esquina superior derecha */}
                            <button
                                className="absolute top-1.5 right-3 p-2 rounded-full hover:bg-red-50 transition-colors group"
                                title="Eliminar Unidad"
                                onClick={() => handleDelete(p.IdUnidad)}
                                type="button"
                            >
                                <Trash2 className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                            </button>

                            <div className="flex items-center justify-between max-w-[90%] gap-4 pr-10">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-semibold leading-tight flex items-center gap-2">
                                            <Home className="w-6 h-6 text-navy" />
                                            {p.NombreUnidad}
                                        </h2>
                                    </div>
                                </div>
                            </div>


                            {p.Inquilino != null ? (
                                <div className="flex flex-col h-full">
                                    <div className={`mt-3 grid grid-cols-2 gap-y-2 items-center`}>
                                        <span className="text-black">Inquilino</span>
                                        <span className="text-right font-medium">{p.Inquilino}</span>
                                        <span className="text-black">Renta Mensual</span>
                                        <span className="text-right font-medium">{p.Renta}</span>
                                        <span className="text-black">Fecha de Inicio</span>
                                        <span className="text-right font-medium">{p.FechaInicio}</span>
                                        <span className="text-black">Cargos vencidos</span>
                                        <span className="text-right font-medium">{p.PagosVencidos ? p.PagosVencidos : 0}</span>
                                    </div>
                                    <div className="w-full mt-auto pt-3">
                                        <button onClick={() => router.push(`/users/administrador/detalle/${p.Contrato}`)} className="w-full bg-navy text-white py-2 px-4 rounded-lg hover:bg-navyhover">
                                            Ver detalles del contrato
                                        </button>
                                        <UpdateModalUnidad IdUnidad={p.IdUnidad} onGuardado={() => fetchUnidades()} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full">
                                    <div className="flex flex-col items-center justify-center mt-4 border-2 border-green-200 rounded-lg p-4">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-lg font-semibold text-green-600">Disponible</span>
                                        <span className="text-xs text-gray-500 mt-1">Listo para rentar</span>
                                    </div>
                                    <div className="w-full mt-auto pt-3">
                                        <AddModalContrato propiedadProp={null} unidadProp={p.IdUnidad} onGuardado={() => fetchUnidades()} />
                                        <UpdateModalUnidad IdUnidad={p.IdUnidad} onGuardado={() => fetchUnidades()} />
                                    </div>
                                </div>
                            )}



                        </div>
                    ))}
                </div>
            ) : (
                <div className="w-full h-[50vh] flex flex-col items-center justify-center">
                    <p className="text-2xl font-semibold mb-2">{propiedad == null ? "La propiedad no existe o no es posible registrar unidades en ella" : "No hay unidades para mostrar"}</p>
                    <p className="text-lg text-muted-foreground mb-4">{propiedad == null ? "Asegúrate de haber seleccionado una propiedad válida." : "Intenta cambiar los filtros o crear una nueva Unidad."}</p>
                </div>
            )}
        </div>
    )
}

export default UnidadesPage

// onClick={() => router.push(`/users/cajero/pedidos/${pedido.IdPedido}`)}