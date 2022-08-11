import {
    Network
} from "@ikomida/components";
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';

export async function GetPaymentMethods() {
    return Network.instance.get("/payments", get(Auth));
}

// export async function GetPubKey() {
//     return Network.instance.get(`/pubKey`, get(Auth));
// }

export async function NewCreditCard(method) {
    return Network.instance.post(`/payment`, get(Auth), method, "newCreditCard");
}

export async function UpdateCreditCard(id) {
    return Network.instance.put(`/payment/${id}`, get(Auth));
}

export async function DeleteCreditCard(id) {
    return Network.instance.remove(`/payment/${id}`, get(Auth));
}

export async function AddCoupon(coupon) {
    return Network.instance.post(`/coupon`, get(Auth), { coupon });
}

export function PaymentType(type) {
    switch (type?.toLowerCase()) {
        case "creditcard":
            return "cartão de crédito";
        case "pix":
            return "PIX";
        case "boleto":
            return "boleto bancário";
        case "cash":
            return "Dinheiro";
        default:
            return "-";
    }
}