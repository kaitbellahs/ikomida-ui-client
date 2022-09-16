import {
    Network
} from "@ikomida/components";

export async function getLayout() {
    return Network.instance?.get("/layout");
}