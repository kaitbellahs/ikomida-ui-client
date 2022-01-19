import {
    Network
} from "@tian/components";

export async function doLogin(cell, password){
    return Network.post("/auth", null, {cell, password});
}