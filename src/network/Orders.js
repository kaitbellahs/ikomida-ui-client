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
        case "accepted":
        case "waitingDelivery":
        case "delivery":
            return "em andamento";
        case "delivered":
            return "entregue";
        case "canceled":
            return "cancelado";
    }
}

export function OrderStage(status) {
    switch (status) {
        case "open":
            return "aguardando aprovação";
        case "accepted":
            return "em preparação";
        case "waitingDelivery":
            return "esperando para sair para delivery";
        case "delivery":
            return "a caminho até você";
        case "delivered":
            return "entregue";
        case "canceled":
            return "cancelado";
    }
}