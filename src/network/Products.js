import {
    Network
} from "@ikomida/components";

let items;
let updateTime;

export async function all() {
    if (!items || updateTime < new Date(new Date().setMinutes(new Date().getMinutes() + 2)).getTime()) {
        const response = await Network.instance.get("/products", true);
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
        items = items.map(section => {
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
        return sortItems(items)
    } else {
        return [];
    }
}

function sortItems(items) {
    return items
        .map((category) => {
            category.products = category.products.sort(
                (i1, i2) => (i1?.order ?? 0) - (i2?.order ?? 0)
            );
            return category;
        })
        .sort((i1, i2) => (i1?.order ?? 0) - (i2?.order ?? 0));
}