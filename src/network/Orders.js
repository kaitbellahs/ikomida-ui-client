import {Utils} from "@tian/components";

const orders = [{
    id: "13",
    status: "open",
    stage: "a caminho até você",
    products: [{
        title: "Massa doida cheia de recheio",
        description: "Bla bla bla bla Bla bla bla bla",
        serves: 5,
        price: 33.5,
        src: "https://static-images.ifood.com.br/image/upload/t_low/pratos/8917d352-a201-4a8b-a84d-a61219baebc6/202007221530_kMPP_f.jpg",
        weight: 1.5,
        quantity: 10
    }],
    address: {
        id: "22",
        cep: "22222-222",
        address: "Av. outra locura, 123",
        complement: "casa dele",
        neighborhood: "Parque dos anjos",
        city: "Taboão da Serra",
        stat: "SP"
    },
    payment: {
        id: "2",
        type: "creditCard",
        brand: "Visa",
        lastDigits: "1725",
        selected: false
    },
    created: 1607110465663,
    finished: 1607110465663,
    subtotal: 123,
    coupon: 0,
    delivery: 0
}, {
    id: "2",
    status: "delivered",
    products: [{
        title: "Massa mais doida ainda",
        price: 33.5,
        quantity: 2
    }, {
        title: "Massa mais doida ainda",
        price: 33.5,
        quantity: 1
    }],
    address: {
        id: "22",
        cep: "22222-222",
        address: "Av. outra locura, 123",
        complement: "casa dele",
        neighborhood: "Parque dos anjos",
        city: "Taboão da Serra",
        stat: "SP"
    },
    payment: {
        id: "2",
        type: "creditCard",
        brand: "Visa",
        lastDigits: "1725",
        selected: false
    },
    created: 1607110465663,
    finished: 1607110465663,
    subtotal: 123,
    coupon: 15.09,
    delivery: 0
}, {
    id: "1",
    status: "canceled",
    products: [{
        title: "Carne no capricho",
        description: "Bla bla bla bla Bla bla bla bla",
        serves: 2,
        price: 33.5,
        oldPrice: 47,
        src: "https://static-images.ifood.com.br/image/upload/t_low/pratos/8917d352-a201-4a8b-a84d-a61219baebc6/202007221530_kMPP_f.jpg",
        weight: 1,
        quantity: 10
    }],
    address: {
        id: "22",
        cep: "22222-222",
        address: "Av. outra locura, 123",
        complement: "casa dele",
        neighborhood: "Parque dos anjos",
        city: "Taboão da Serra",
        stat: "SP"
    },
    payment: {
        id: "2",
        type: "creditCard",
        brand: "Visa",
        lastDigits: "1725",
        selected: false
    },
    created: 1607110465663,
    finished: 1607110465663,
    subtotal: 123,
    coupon: 0,
    delivery: 0
}];

export async function GetOrders() {
    return new Promise(resolve => setTimeout(resolve, Utils.Numbers.Random(500, 5000), orders));
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