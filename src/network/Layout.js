import {
    Network
} from "@tian/components";
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';

export async function getLayout() {
    return Network.instance.get("/layout", get(Auth));
}