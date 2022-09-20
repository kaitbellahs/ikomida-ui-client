import {
    Network, Types,
} from "@ikomida/shared-frontend";

export async function GetPaymentMethods() {
    return Network.instance?.get("/payments", true);
}

export async function NewCreditCard(method: Types.Classes.CCreditCardRequest) {
    return Network.instance?.post(`/payment`, true, method, "newCreditCard");
}

export async function UpdateCreditCard(id?: string) {
    return Network.instance?.put(`/payment/${id ?? '-'}`, true);
}

export async function DeleteCreditCard(id?: string) {
    return Network.instance?.remove(`/payment/${id ?? '-'}`, true);
}

export async function AddCoupon(coupon: string) {
    return Network.instance?.post(`/coupon`, true, { coupon });
}