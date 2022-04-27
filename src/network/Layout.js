import {
    Network
} from "@tian/components";

export async function getLayout() {
    return Network.instance.get("/layout");
}