import {
    Random
} from "../Utils/Numbers";

const paymentMethods = [{
    id: "1",
    type: "creditCard",
    brand: "Mastercard",
    lastDigits: "8012",
    selected: true
}, {
    id: "2",
    type: "creditCard",
    brand: "Visa",
    lastDigits: "1725",
    selected: false
}];

export async function GetPaymentMethods() {
    return new Promise(resolve => setTimeout(resolve, Random(500, 5000), paymentMethods));
}

export async function DoPayment() {
    return new Promise(resolve => setTimeout(resolve, Random(500, 5000), {
        success: true,
        message: "",
        payload: {
            id: "13",
            status: "open",
            stage: "a caminho até você",
            products: [{
                title: "Massa doida cheia de recheio",
                price: 33.5,
                quantity: 3
            }, {
                title: "Carne no capricho",
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
            coupon: 0,
            delivery: 0
        }
    }));
}

export function PaymentType(type) {
    switch (type) {
        case "creditCard":
            return "cartão de crédito";
        case "pix":
            return "PIX";
        case "boleto":
            return "boleto bancário";
        default:
            return "-";
    }
}