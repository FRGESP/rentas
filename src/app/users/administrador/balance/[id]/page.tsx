import PagosPage from "@/components/administrador/pagos/pagosPage";
interface PagosVencidosPageProps {
    params: {
        id: number;
    }
}

function PagosVencidosPage({ params }: PagosVencidosPageProps) {
  return (
    <div>
      <PagosPage contratoIdProp={params.id} />
    </div>
  )
}

export default PagosVencidosPage