import {
    Network
} from "@ikomida/components";

export async function registerPushNotificationToken(object) {
    return Network.instance?.post("/notification/register", true, object);
}