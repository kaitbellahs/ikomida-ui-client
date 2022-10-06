import { Network, Types } from '@ikomida/shared-frontend'

export async function GetAddresses() {
  return Network.instance?.get('/addresses', true)
}

export async function GetAddressByCep(cep: string) {
  return Network.instance?.get(`/cep/${cep}`, true)
}

export async function NewAddress(address: Types.Classes.CAddress) {
  return Network.instance?.post(`/address`, true, address)
}

export async function UpdateAddress(id?: string) {
  return Network.instance?.put(`/address/${id ?? '-'}`, true)
}

export async function DeleteAddress(id?: string) {
  return Network.instance?.remove(`/address/${id ?? '-'}`, true)
}

export async function GetSettings() {
  return Network.instance?.get(`/settings`)
}
