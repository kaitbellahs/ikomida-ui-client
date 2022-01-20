import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';
import {
    Network
} from "@tian/components";

let items;

export async function all() {
    // debugger;
    if (!items) {
        const response = await Network.get("/products", get(Auth));
        if (response.success) {
            items = response.data;
        }
    }
    return items;
}

export async function search(query) {
    await all();
    if (items) {
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
    } else {
        return [];
    }
}