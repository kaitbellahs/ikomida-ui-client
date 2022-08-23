import {
    get
} from 'svelte/store';

export async function GetAddresses() {
    return Network.instance.get("/addresses", true);
}

export async function GetAddressByCep(cep) {
    return Network.instance.get(`/cep/${cep}`, true);
}

export async function NewAddress(address) {
    return Network.instance.post(`/address`, true, address);
}

export async function UpdateAddress(id) {
    return Network.instance.put(`/address/${id}`, true);
}

export async function DeleteAddress(id) {
    return Network.instance.remove(`/address/${id}`, true);
}

export async function GetSettings() {
    return Network.instance.get(`/settings`);
}