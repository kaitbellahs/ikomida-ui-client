import {
    Network
} from "@tian/components";

export async function doLogin(cell, password){
    return Network.post("http://localhost:1988/auth", null, {cell, password});
}