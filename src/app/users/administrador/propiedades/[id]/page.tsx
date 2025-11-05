import React from 'react'
import UnidadesPage from '@/components/administrador/propiedades/unidad/unidadPage';

interface UnidadPageProps {
    params: {
        id: string;
    }
}

function UnidadPage({ params }: UnidadPageProps) {
  return (
    <div>
    <UnidadesPage IdPropiedadProp={Number(params.id)} />
    </div>
  )
}

export default UnidadPage