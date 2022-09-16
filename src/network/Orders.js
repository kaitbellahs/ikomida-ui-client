import {
    Network,
    Types,
    Stores,
} from "@ikomida/components";

export async function NewOrders(payload) {
    const response = await Network.instance?.post("/order", true, payload, "newOrder");
    if (response?.success) {
        await Network.instance?.clearCache(Stores.Cache.Types.ORDERS)
    }
    return response
}

export async function ChangeOrderStatus(id, status) {
    const response = Network.instance?.put("/order", true, {
        id,
        status
    }, "editOrder");
    if (response?.success) {
        await Network.instance?.clearCache(Stores.Cache.Types.ORDERS)
    }
    return response
}

export function OrderStatus(status) {
    switch (status) {
        case Types.Types.TOrderStatus.WAITING_PAYMENT:
            return "aguardando pagamento";
        case Types.Types.TOrderStatus.OPEN:
            return "aguardando aprovação";
        case Types.Types.TOrderStatus.ACCEPTED:
            return "em preparação";
        case Types.Types.TOrderStatus.WAITING_DELIVERY:
            return "esperando o entregador";
        case Types.Types.TOrderStatus.IN_DELIVERY:
            return "está a caminho até você";
        case Types.Types.TOrderStatus.DELIVERED:
            return "entregue";
        case Types.Types.TOrderStatus.CANCELED:
            return "cancelado";
        case Types.Types.TOrderStatus.IN_DISPUTE:
            return "em disputa";
    }
}