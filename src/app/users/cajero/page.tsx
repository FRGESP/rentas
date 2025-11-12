import { checkRole } from '@/actions';
import React from 'react'

async function cajeroPage() {
  await checkRole(0);
  return (
    <div>cajeroPage</div>
  )
}

export default cajeroPage