import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';
import {
    Network
} from "@tian/components";

export async function all() {
    return Network.get("/products", get(Auth));
}

export function search(query) {
    return items.map(section => {
        return {
            title: section.title,
            items: section.items.filter(item => {
                if (typeof item == "object") {
                    return item.title.toLowerCase().includes(query.toLowerCase()) || item.description.toLowerCase().includes(query.toLowerCase());
                } else {
                    return true;
                }
            })
        };
    }).filter(item => item.items.length > 0);
}