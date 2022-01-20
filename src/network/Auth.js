import {
    Network
} from "@tian/components";

export async function doLogin(cell, password){
    return Network.post("/auth", null, {cell, password});
}

export async function requestPhoneValidation(object){
    return Network.post("/requestphonevalidation", null, object);
}

export async function ValidatePhoneValidationCode(object){
    return Network.post("/ValidatePhoneValidationCode", null, object);
}

export async function subscribe(object){
    return Network.post("/subscribe", null, object);
}