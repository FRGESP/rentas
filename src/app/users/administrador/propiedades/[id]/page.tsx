import React from 'react'
import UnidadesPage from '@/components/administrador/propiedades/unidad/unidadPage';

interface UnidadPageProps {
    params: {
        id: string;
    }
}

function UnidadPage({ params }: UnidadPageProps) {
  return (
    <div className='bg-gray-50 min-h-[100vh]'>
    <UnidadesPage IdPropiedadProp={Number(params.id)} />
    </div>
  )
}

export default UnidadPage