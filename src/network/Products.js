import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';
import {
    Network
} from "@ikomida/components";

let items;
let updateTime;

export async function all() {
    if (!items || updateTime < new Date(new Date().setMinutes(new Date().getMinutes() + 2)).getTime()) {
        const response = await Network.instance.get("/products", get(Auth));
        if (response?.success) {
            items = response?.data.filter(item => item.products.length > 0);
            updateTime = new Date().getTime();
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
                products: section.products.filter(item => {
                    if (typeof item == "object") {
                        return item.title.toLowerCase().includes(query.toLowerCase()) || item.description.toLowerCase().includes(query.toLowerCase());
                    } else {
                        return true;
                    }
                })
            };
        }).filter(item => item.products.length > 0);
    } else {
        return [];
    }
}