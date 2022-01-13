import {Random} from "../Utils/Numbers";

export async function doLogin(){
    return new Promise(resolve => setTimeout(resolve, Random(500, 5000), {token: "", refreshToken: "", validity: 1234567890}));
}