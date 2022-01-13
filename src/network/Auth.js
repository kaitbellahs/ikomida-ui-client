import {Utils} from "@tian/components";

export async function doLogin(){
    return new Promise(resolve => setTimeout(resolve, Utils.Numbers.Random(500, 5000), {token: "", refreshToken: "", validity: 1234567890}));
}