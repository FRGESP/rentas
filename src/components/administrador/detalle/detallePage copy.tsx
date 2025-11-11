"use client";
import { useMemo } from "react";
import { BadgeCheck, Building2, CalendarDays, CircleDollarSign, FileText, MapPin, User2 } from "lucide-react";

// Página de detalle de contrato con información dummy para visualizar el diseño
// No requiere props ni llamadas a API. Sustituye los datos cuando conectes tus endpoints.

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
	Estado: "Activo" | "Pausado" | "Completado";
};

type Cargo = {
	IdCargo: number;
	Descripcion: string;
	MontoTotal: number;
	FechaInicio: string;
	FechaVencimiento: string;
	Estado: "Pendiente" | "Pagado" | "Parcial" | "Vencido" | "Programado";
	SaldoPendiente: number;
};

const currency = (n: number) =>
	n.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });

export default function DetallePage() {
	// DUMMY DATA — reemplaza con datos reales cuando conectes el backend
	const contrato: ContratoDetalle = {
		IdContrato: 10234,
		Tipo: "Unidad",
		NombreInmueble: "Depto 302 · Torre Norte",
		Direccion: "Av. Reforma 123, Col. Centro, CDMX, 06000",
		Estado: "Activo",
		FechaCreacion: "2024-06-15",
		Plazo: 24,
		DiaCobro: 5,
		MontoRenta: 12500,
		Deposito: 12500,
		Inquilino: "María Fernanda López",
		Telefono: "+52 55 1234 5678",
	};

	const cargosFijos: CargoFijo[] = [
		{ IdCargoFijo: 1, Descripcion: "Renta mensual", Monto: 12500, DiaCobro: 5, Plazo: -1, PlazoTranscurrido: 10, Estado: "Activo" },
		{ IdCargoFijo: 2, Descripcion: "Mantenimiento", Monto: 950, DiaCobro: 5, Plazo: -1, PlazoTranscurrido: 10, Estado: "Activo" },
		{ IdCargoFijo: 3, Descripcion: "Estacionamiento", Monto: 800, DiaCobro: 5, Plazo: 12, PlazoTranscurrido: 7, Estado: "Activo" },
	];

	const cargos: Cargo[] = [
		{ IdCargo: 101, Descripcion: "Renta noviembre", MontoTotal: 12500, FechaInicio: "2025-11-05", FechaVencimiento: "2025-11-10", Estado: "Parcial", SaldoPendiente: 3000 },
		{ IdCargo: 102, Descripcion: "Mantenimiento noviembre", MontoTotal: 950, FechaInicio: "2025-11-05", FechaVencimiento: "2025-11-10", Estado: "Pendiente", SaldoPendiente: 950 },
		{ IdCargo: 103, Descripcion: "Renta octubre", MontoTotal: 12500, FechaInicio: "2025-10-05", FechaVencimiento: "2025-10-10", Estado: "Pagado", SaldoPendiente: 0 },
		{ IdCargo: 104, Descripcion: "Limpieza extraordinaria", MontoTotal: 600, FechaInicio: "2025-09-25", FechaVencimiento: "2025-09-30", Estado: "Vencido", SaldoPendiente: 600 },
	];

	const stats = useMemo(() => {
		const vencidos = cargos.filter(c => c.Estado === "Vencido");
		const pendientes = cargos.filter(c => c.Estado === "Pendiente" || c.Estado === "Parcial");
		const montoVencido = vencidos.reduce((acc, c) => acc + c.SaldoPendiente, 0);
		const pagadoMes = cargos
			.filter(c => c.Estado === "Pagado" && (c.FechaInicio ?? "").startsWith("2025-11"))
			.reduce((acc, c) => acc + c.MontoTotal, 0);
		return { vencidos: vencidos.length, pendientes: pendientes.length, montoVencido, pagadoMes };
	}, [cargos]);

	const estadoBadge = (estado: ContratoDetalle["Estado"]) =>
		estado === "Activo"
			? "bg-green-100 text-green-700"
			: estado === "Finalizado"
			? "bg-blue-100 text-blue-700"
			: "bg-red-100 text-red-700";

	return (
		<div className="w-full max-w-7xl mx-auto p-6 space-y-6">
			{/* Encabezado */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<FileText className="w-7 h-7 text-navy" />
						Contrato #{contrato.IdContrato}
					</h1>
					<div className="text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1">
						<span className="inline-flex items-center gap-1"><User2 className="w-4 h-4" /> {contrato.Inquilino}</span>
						<span className="inline-flex items-center gap-1">· {contrato.Telefono}</span>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoBadge(contrato.Estado)}`}>
						{contrato.Estado}
					</span>
					<button className="px-4 py-2 rounded bg-navy text-white hover:bg-navyhover text-sm">Generar PDF</button>
				</div>
			</div>

			{/* Identificación del inmueble */}
			<div className="p-5 rounded-lg bg-white shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<div className="flex items-start gap-3">
					<div className="p-2 rounded-md bg-blue-50 text-blue-700"><Building2 className="w-5 h-5" /></div>
					<div>
						<p className="text-sm text-gray-500">{contrato.Tipo}</p>
						<p className="font-semibold">{contrato.NombreInmueble}</p>
						<p className="text-sm text-gray-600 inline-flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" /> {contrato.Direccion}</p>
					</div>
				</div>
				<div className="flex items-center gap-6 text-sm">
					<div className="flex items-center gap-2 text-gray-700"><CalendarDays className="w-4 h-4" /> Inició {contrato.FechaCreacion}</div>
					<div className="flex items-center gap-2 text-gray-700"><BadgeCheck className="w-4 h-4" /> Día de cobro {contrato.DiaCobro}</div>
				</div>
			</div>

			{/* Resumen financiero */}
			<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="p-4 rounded-lg shadow bg-white">
					<p className="text-sm text-gray-500">Renta Mensual</p>
					<p className="text-2xl font-semibold">{currency(contrato.MontoRenta)}</p>
				</div>
				<div className="p-4 rounded-lg shadow bg-white">
					<p className="text-sm text-gray-500">Depósito</p>
					<p className="text-2xl font-semibold">{currency(contrato.Deposito)}</p>
				</div>
				<div className="p-4 rounded-lg shadow bg-white">
					<p className="text-sm text-gray-500">Cargos Vencidos</p>
					<p className="text-2xl font-semibold">{stats.vencidos} ({currency(stats.montoVencido)})</p>
				</div>
				<div className="p-4 rounded-lg shadow bg-white">
					<p className="text-sm text-gray-500">Pagado este mes</p>
					<p className="text-2xl font-semibold">{currency(stats.pagadoMes)}</p>
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
							<span className="text-right">{contrato.FechaCreacion}</span>
							<span className="text-gray-600">Plazo (meses)</span>
							<span className="text-right">{contrato.Plazo}</span>
							<span className="text-gray-600">Día de cobro</span>
							<span className="text-right">{contrato.DiaCobro}</span>
						</div>
					</div>

					{/* Cargos generados */}
					<div className="p-5 rounded-lg shadow bg-white">
						<div className="flex items-center justify-between mb-3">
							<h2 className="font-semibold text-lg">Cargos</h2>
							<div className="flex gap-2">
								<button className="px-3 py-1.5 rounded border text-sm">Todos</button>
								<button className="px-3 py-1.5 rounded border text-sm">Pendientes</button>
								<button className="px-3 py-1.5 rounded border text-sm">Vencidos</button>
							</div>
						</div>
						<div className="overflow-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="text-left border-b">
										<th className="py-2">Descripción</th>
										<th>Monto</th>
										<th>Inicio</th>
										<th>Vencimiento</th>
										<th>Estado</th>
										<th>Saldo</th>
									</tr>
								</thead>
								<tbody>
									{cargos.map((c) => (
										<tr key={c.IdCargo} className="border-b">
											<td className="py-2">{c.Descripcion}</td>
											<td>{currency(c.MontoTotal)}</td>
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
															: "bg-gray-100 text-gray-700")
													}
												>
													{c.Estado}
												</span>
											</td>
											<td>{currency(c.SaldoPendiente)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* Columna lateral */}
				<div className="space-y-6">
					{/* Inquilino */}
					<div className="p-5 rounded-lg shadow bg-white">
						<h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><User2 className="w-5 h-5 text-navy" /> Inquilino</h2>
						<div className="text-sm grid grid-cols-2 gap-y-2">
							<span className="text-gray-600">Nombre</span>
							<span className="text-right font-medium">{contrato.Inquilino}</span>
							<span className="text-gray-600">Teléfono</span>
							<span className="text-right font-medium">{contrato.Telefono}</span>
						</div>
					</div>

					{/* Cargos fijos */}
					<div className="p-5 rounded-lg shadow bg-white">
						<h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><CircleDollarSign className="w-5 h-5 text-navy" /> Cargos fijos</h2>
						<div className="space-y-3">
							{cargosFijos.map((cf) => (
								<div key={cf.IdCargoFijo} className="border rounded-md p-3 text-sm flex flex-col gap-1">
									<div className="flex justify-between">
										<span className="font-medium">{cf.Descripcion}</span>
										<span className="text-gray-700">{currency(cf.Monto)}</span>
									</div>
									<div className="flex justify-between text-xs text-gray-500">
										<span>Día cobro: {cf.DiaCobro}</span>
										<span>Estado: {cf.Estado}</span>
									</div>
									{cf.Plazo !== -1 && (
										<div>
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
						<button className="px-4 py-2 rounded bg-navy text-white hover:bg-navyhover">Agregar cargo extra</button>
						<button className="px-4 py-2 rounded border">Registrar pago</button>
						<button className="px-4 py-2 rounded border">Finalizar contrato</button>
					</div>
				</div>
			</div>
		</div>
	);
}

