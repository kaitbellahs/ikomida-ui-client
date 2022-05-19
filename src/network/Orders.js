import {
    Network
} from "@ikomida/components";
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';

export async function GetOrders(history) {
    let response = await Network.instance.get(`/orders${history ? '/history' : ''}`, get(Auth));
    let orders = [];
    if (response?.success) {
        orders = response?.data || [];
    }
    return orders;
}

export async function NewOrders(payload) {
    return Network.instance.post("/order", get(Auth), payload);
}

export function OrderStatus(status) {
    switch (status) {
        case "waitingPayment":
            return "aguardando pagamento";
        case "open":
            return "aguardando aprovação";
        case "accepted":
            return "em preparação";
        case "waitingDelivery":
            return "esperando para sair para delivery";
        case "delivery":
            return "está a caminho até você";
        case "delivered":
            return "entregue";
        case "canceled":
            return "cancelado";
    }
}

export function OrderStage(status) {
    switch (status) {
        case "waitingPayment":
            return "aguardando pagamento";
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