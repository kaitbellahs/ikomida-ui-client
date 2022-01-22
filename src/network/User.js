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
    return Network.instant.get("/addresses", get(Auth));
}

export async function GetAddressByCep(cep) {
    return Network.instant.get(`/cep/${cep}`, get(Auth));
}

export async function NewAddress(address) {
    return Network.instant.post(`/address`, get(Auth), address);
}