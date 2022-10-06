import { Network } from '@ikomida/shared-frontend'

export async function getLayout() {
  return Network.instance?.get('/layout')
}
