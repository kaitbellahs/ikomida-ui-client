import {
    Network,
    Types
} from "@ikomida/components";

export async function GetPaymentMethods() {
    return Network.instance.get("/payments", true);
}

export async function NewCreditCard(method) {
    return Network.instance.post(`/payment`, true, method, "newCreditCard");
}

export async function UpdateCreditCard(id) {
    return Network.instance.put(`/payment/${id}`, true);
}

export async function DeleteCreditCard(id) {
    return Network.instance.remove(`/payment/${id}`, true);
}

export async function AddCoupon(coupon) {
    return Network.instance.post(`/coupon`, true, { coupon });
}