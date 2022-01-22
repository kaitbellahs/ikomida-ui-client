import {
    Network
} from "@tian/components";
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';

export async function GetOrders() {
    return Network.instance.get("/orders", get(Auth));
}

export async function NewOrders(paylaod) {
    return Network.instance.post("/order", get(Auth), paylaod);
}

export function OrderStatus(status) {
    switch (status) {
        case "open":
            return "em andamento";
        case "delivered":
            return "entregue";
        case "canceled":
            return "cancelado";
    }
}