import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';
import {
    Network
} from "@tian/components";

export async function GetAddresses() {
    return Network.instance.get("/addresses", get(Auth));
}

export async function GetAddressByCep(cep) {
    return Network.instance.get(`/cep/${cep}`, get(Auth));
}

export async function NewAddress(address) {
    return Network.instance.post(`/address`, get(Auth), address);
}

export async function UpdateAddress(id) {
    return Network.instance.put(`/address/${id}`, get(Auth));
}

export async function DeleteAddress(id) {
    return Network.instance.remove(`/address/${id}`, get(Auth));
}

export async function GetSettings() {
    return Network.instance.get(`/settings`);
}