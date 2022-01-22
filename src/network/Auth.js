import {
    Network
} from "@tian/components";

export async function doLogin(cell, password){
    return Network.instant.post("/auth", null, {cell, password});
}

export async function requestPhoneValidation(object){
    return Network.instant.post("/requestphonevalidation", null, object);
}

export async function ValidatePhoneValidationCode(object){
    return Network.instant.post("/ValidatePhoneValidationCode", null, object);
}

export async function subscribe(object){
    return Network.instant.post("/subscribe", null, object);
}