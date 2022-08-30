import {
    Network,
    Types,
    Stores,
} from "@ikomida/components";

export async function NewOrders(payload) {
    const response = await Network.instance.post("/order", true, payload, "newOrder");
    if (response?.success) {
        await Network.instance.clearCache(Stores.Cache.Types.ORDERS)
    }
    return response
}

export async function ChangeOrderStatus(id, status) {
    const response = Network.instance.put("/order", true, {
        id,
        status
    }, "editOrder");
    if (response?.success) {
        await Network.instance.clearCache(Stores.Cache.Types.ORDERS)
    }
    return response
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
            return "esperando o entregador";
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