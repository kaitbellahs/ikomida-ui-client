import {
    Network
} from "@tian/components";
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';

export async function GetPaymentMethods() {
    return Network.instant.get("/payments", get(Auth));
}

export async function NewCard(method) {
    return Network.instant.post(`/payment`, get(Auth), method);
}

export async function AddCoupon(coupon) {
    return Network.instant.post(`/coupon`, get(Auth), {coupon});
}

export function PaymentType(type) {
    switch (type) {
        case "creditCard":
            return "cartão de crédito";
        case "pix":
            return "PIX";
        case "boleto":
            return "boleto bancário";
        case "Cash":
            return "Dinheiro";
        default:
            return "-";
    }
}