import {
    writable
} from 'svelte/store';
import {
    Storage
} from '@capacitor/storage';

function _store() {
    const {
        subscribe,
        set,
        update
    } = writable([]);

    return {
        subscribe,
        addItem: (item) => update(_items => [..._items, item]),
        updateItems: newItems => update(_items => newItems),
        reset: () => set([]),
    };
}

export const Store = _store();
const reset = async () => {
    await Storage.set({
        key: 'Cart',
        value: JSON.stringify([])
    });
    Store.reset();
}

const items = async () => {
    let _items = [];
    try {
        const ret = await Storage.get({
            key: 'Cart'
        });
        _items = JSON.parse(ret.value);
    } catch (error) {
        _items = [];
        console.error(error);
    }
    _items = _items != null ? _items : [];
    Store.updateItems(_items);
    return _items;
}

const addItem = async (item) => {
    let oldItems = [];
    try {
        oldItems = await items();
    } catch (error) {
        console.error(error);
    }
    Store.updateItems(oldItems == null ? [item] : [...oldItems, item]);
    await Storage.set({
        key: 'Cart',
        value: JSON.stringify([...oldItems, item])
    });
}
const subtotal = async () => {
    let oldItems = [];
    try {
        oldItems = await items();
    } catch (error) {
        console.error(error);
    }
    const _subtotal = oldItems.map((item) => item.quantity * item.price).reduce((a, b) => a + b);
    return _subtotal;
}
export const Cart = {
    items,
    reset,
    addItem,
    subtotal
};