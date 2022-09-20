import {
    Network
} from "@ikomida/shared-frontend";

export async function registerPushNotificationToken(object) {
    return Network.instance?.post("/notification/register", true, object);
}