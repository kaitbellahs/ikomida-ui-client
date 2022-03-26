import {
    Network
} from "@tian/components";
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';

export async function registerPushNotificationToken(object) {
    return Network.instance.post("/notification/register", get(Auth), object);
}