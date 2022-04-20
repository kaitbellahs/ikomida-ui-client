import {
    Network
} from "@tian/components";

export async function doLogin(areaCode, phone, password) {
    return Network.instance.post("/auth", null, {
        areaCode,
        phone,
        password
    });
}

export async function requestPhoneValidation(object) {
    return Network.instance.post("/requestphonevalidation", null, object);
}

export async function ValidatePhoneValidationCode(object) {
    return Network.instance.post("/ValidatePhoneValidationCode", null, object);
}

export async function subscribe(object) {
    return Network.instance.post("/subscribe", null, object);
}

export async function updatePassword(object) {
    return Network.instance.post("/password", get(Auth), object);
}