import React from 'react'
import { checkRole } from '@/actions'

async function Detallepage() {
    await checkRole(0);
  return (
    <div>Detallepage</div>
  )
}

export default Detallepage