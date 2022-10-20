import { Network, Types } from '@ikomida/shared-frontend'

export async function GetAddresses() {
  const network = Network.instance as Network
  return network?.get('/addresses', true)
}

export async function GetAddressByCep(cep: string) {
  const network = Network.instance as Network
  return network?.get(`/cep/${cep}`, true)
}

export async function NewAddress(address: Types.Classes.CAddress) {
  const network = Network.instance as Network
  return network?.post(`/address`, true, address)
}

export async function UpdateAddress(id?: string) {
  const network = Network.instance as Network
  return network?.put(`/address/${id ?? '-'}`, true)
}

export async function profile() {
  const network = Network.instance as Network
  return network?.get(`/profile`, true)
}

export async function UpdateAvatar(object?: Types.Classes.CUser) {
  const network = Network.instance as Network
  return network?.patch(`/profile/avatar`, true, object)
}

export async function DeleteAddress(id?: string) {
  const network = Network.instance as Network
  return network?.remove(`/address/${id ?? '-'}`, true)
}

export async function GetSettings() {
  const network = Network.instance as Network
  return network?.get(`/settings`)
}
