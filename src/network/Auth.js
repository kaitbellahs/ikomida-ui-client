import {
    Network
} from "@ikomida/components";

export async function doLogin(areaCode, phone, password) {
    return Network.instance.post("/auth", null, {
        areaCode,
        phone,
        password
    }, "login");
}

export async function requestPhoneValidation(object) {
    return Network.instance.post("/requestPhoneValidation", null, object, "requestPhoneValidation");
}

export async function validatePhoneValidationCode(object) {
    return Network.instance.post("/validatePhoneValidationCode", null, object, "validatePhoneValidationCode");
}

export async function subscribe(object) {
    return Network.instance.post("/subscribe", null, object, "subscribe");
}

export async function requestPasswordPhoneValidation(object) {
    return Network.instance.post("/requestPasswordPhoneValidation", null, object, "requestPasswordPhoneValidation");
}
export async function validatePasswordPhoneValidationCode(object) {
    return Network.instance.post("/validatePasswordPhoneValidationCode", null, object, "validatePasswordPhoneValidationCode");
}

export async function requestPassword(object) {
    return Network.instance.post("/requestPassword", null, object, "requestPassword");
}

export async function updatePassword(object) {
    return Network.instance.post("/password", true, object, "updatePassword");
}

export async function logout() {
    return Network.instance.logout();
}