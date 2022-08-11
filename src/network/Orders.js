import {
    Network,
    Types
} from "@ikomida/components";
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';

export async function getOrders(history, timestamp = 0) {
    let response = await Network.instance.get(`/orders/${timestamp}${history ? '/history' : ''}`, get(Auth));
    if (response?.success) {
        return response?.data || [];
    }
    return null;
}

export async function NewOrders(payload) {
    return Network.instance.post("/order", get(Auth), payload, "newOrder");
}

export async function ChangeOrderStatus(id, status) {
    return Network.instance.put("/order", get(Auth), {
        id,
        status
    }, "editOrder");
}

export function OrderStatus(status) {
    switch (status) {
        case Types.OrderStatusType.WAITING_PAYMENT:
            return "aguardando pagamento";
        case Types.OrderStatusType.OPEN:
            return "aguardando aprovação";
        case Types.OrderStatusType.ACCEPTED:
            return "em preparação";
        case Types.OrderStatusType.WAITING_DELIVERY:
            return "esperando para sair para delivery";
        case Types.OrderStatusType.IN_DELIVERY:
            return "está a caminho até você";
        case Types.OrderStatusType.DELIVERED:
            return "entregue";
        case Types.OrderStatusType.CANCELED:
            return "cancelado";
        case Types.OrderStatusType.IN_DISPUTE:
            return "em disputa";
    }
}