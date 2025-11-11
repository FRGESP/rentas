import React from 'react'
import DetallePage from '@/components/administrador/detalle/detallePage'

interface DetalleContratoPageProps {
    params: { id: string };
}

function DetalleContratoPage({ params }: DetalleContratoPageProps) {
  return (
    <div className='bg-gray-50 min-h-[100vh]'>
      <DetallePage contratoProp={Number(params.id)} />
    </div>
  )
}

export default DetalleContratoPage