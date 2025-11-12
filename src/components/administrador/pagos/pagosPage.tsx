"use client"
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Search, AlertCircle, DollarSign, Calendar, User, Home, Clock, CreditCard } from "lucide-react";
import RegistrarAbonoModal from "./registrarAbonoModal";
import { getCargosPago } from "@/actions";

function PagosPage() {
  const { toast } = useToast();

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

    const [pagos, setPagos] = useState<Pago[]>([]);

  const fetchCargos = async () => {
          try {
              const data = await getCargosPago();
              setPagos(data);
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
      fetchCargos();
    }, []);

  const [search, setSearch] = useState<string>("");
  const [estadoFilter, setEstadoFilter] = useState<string>("all");
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);

  // Filtrar pagos
  const filtered = useMemo(() => {
    const bySearch = (p: Pago) =>
      p.Descripcion.toLowerCase().includes(search.toLowerCase()) ||
      p.Inquilino.toLowerCase().includes(search.toLowerCase()) ||
      p.Inmueble.toLowerCase().includes(search.toLowerCase());
    const byEstado = (p: Pago) => estadoFilter === 'all' || p.Estado === estadoFilter;
    return pagos.filter((p) => bySearch(p) && byEstado(p));
  }, [pagos, search, estadoFilter]);

  // Calcular estadísticas
  const estadisticas = useMemo(() => {

    const vencidos = pagos.filter(p => p.Estado === 'Vencido');
    const parciales = pagos.filter(p => p.Estado === 'Parcial');
    const pendientes = pagos.filter(p => p.Estado === 'Pendiente');

    const totalVencido = vencidos.reduce((sum, p) => sum + Number(p.SaldoPendiente), 0);
    const totalParcial = parciales.reduce((sum, p) => sum + Number(p.SaldoPendiente), 0);
    const totalPendiente = pendientes.reduce((sum, p) => sum + Number(p.SaldoPendiente), 0);

    return {
      vencidos: { count: vencidos.length, total: totalVencido },
      parciales: { count: parciales.length, total: totalParcial },
      pendientes: { count: pendientes.length, total: totalPendiente },
      totalGeneral: totalVencido + totalParcial + totalPendiente
    };
  }, [pagos]);

  // Función para obtener el color del badge según el estado
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

  // Función para obtener el color del tipo de cargo
  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'Extra':
        return 'bg-purple-100 text-purple-700';
      case 'Variable':
        return 'bg-orange-100 text-orange-700';
      case 'Fijo':
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAbonoRegistrado = () => {
    setSelectedPago(null);
    fetchCargos();
  };

  return (
    <div className="w-full h-full flex flex-col p-6 2xl:max-w-[95%] 2xl:mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Pagos Pendientes</h1>
        <p className="text-gray-600">Administra los cargos pendientes, parciales y vencidos</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total General */}
        <div className="bg-gradient-to-br from-navy to-blue-900 text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total por Cobrar</h3>
            <DollarSign className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold">${estadisticas.totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs mt-1 opacity-75">{pagos.length} cargos totales</p>
        </div>

        {/* Vencidos */}
        <div className="bg-white rounded-lg p-5 shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Vencidos</h3>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">${estadisticas.vencidos.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs mt-1 text-gray-500">{estadisticas.vencidos.count} cargos vencidos</p>
        </div>

        {/* Parciales */}
        <div className="bg-white rounded-lg p-5 shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Parciales</h3>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">${estadisticas.parciales.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs mt-1 text-gray-500">{estadisticas.parciales.count} pagos parciales</p>
        </div>

        {/* Pendientes */}
        <div className="bg-white rounded-lg p-5 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Pendientes</h3>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">${estadisticas.pendientes.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs mt-1 text-gray-500">{estadisticas.pendientes.count} cargos pendientes</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        {/* Búsqueda */}
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por inquilino, inmueble o descripción..."
            className="w-full rounded-lg py-3 pl-10 pr-4 border border-gray-200 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {/* Filtro de estado */}
        <select
          className="h-12 min-w-[200px] rounded-lg border border-gray-200 bg-white px-4 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="Vencido">Vencidos</option>
          <option value="Parcial">Parciales</option>
          <option value="Pendiente">Pendientes</option>
        </select>
      </div>

      {/* Lista de pagos */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((pago) => (
            <div 
              key={pago.IdCargo} 
              className={`bg-white rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-200 border-l-4 ${
                pago.Estado === 'Vencido' ? 'border-red-500' :
                pago.Estado === 'Parcial' ? 'border-yellow-500' :
                'border-blue-500'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Información principal */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getEstadoBadge(pago.Estado)}`}>
                          {pago.Estado}
                        </span>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${getTipoBadge(pago.TipoCargo)}`}>
                          {pago.TipoCargo}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{pago.Descripcion}</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span><span className="font-medium">Inquilino:</span> {pago.Inquilino}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          <span><span className="font-medium">Inmueble:</span> {pago.Inmueble}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span><span className="font-medium">Vencimiento:</span> {pago.FechaVencimiento}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Teléfono:</span> {pago.Telefono}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Montos y acción */}
                <div className="lg:text-right space-y-2 lg:min-w-[200px]">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Monto Total</p>
                    <p className="text-xl font-bold text-gray-800">
                      ${pago.MontoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  {pago.Estado === 'Parcial' && (
                    <div className="space-y-1 pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Saldo Pendiente</p>
                      <p className="text-lg font-bold text-yellow-600">
                        ${pago.SaldoPendiente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setSelectedPago(pago)}
                    className="w-full mt-3 bg-navy hover:bg-blue-900 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Registrar Abono
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron pagos</h3>
          <p className="text-gray-500">Intente ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Modal de Registro de Abono */}
      {selectedPago && (
        <RegistrarAbonoModal
          pago={selectedPago}
          onClose={() => setSelectedPago(null)}
          onAbonoRegistrado={handleAbonoRegistrado}
        />
      )}
    </div>
  );
}

export default PagosPage;