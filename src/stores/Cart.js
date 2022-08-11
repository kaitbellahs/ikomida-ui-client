import {
    writable
} from 'svelte/store';
import {
    Preferences
} from '@capacitor/preferences';

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
    await Preferences.set({
        key: 'Cart',
        value: JSON.stringify([])
    });
    Store.reset();
}
const update = async (object) => {
    await Preferences.set({
        key: 'Cart',
        value: JSON.stringify(object)
    });
    Store.updateItems(object);
}

const items = async () => {
    let _items = [];
    try {
        const ret = await Preferences.get({
            key: 'Cart'
        });
        _items = JSON.parse(ret.value);
    } catch (error) {
        _items = [];
        //TODO: -- report errors
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
        //TODO: -- report errors
    }
    const update = [...new Set([...oldItems, item])]
    Store.updateItems(oldItems == null ? [item] : update);
    await Preferences.set({
        key: 'Cart',
        value: JSON.stringify(update)
    });
}
const subtotal = async () => {
    let oldItems = [];
    try {
        oldItems = await items();
    } catch (error) {
        //TODO: -- report errors
    }
    const _subtotal = oldItems.map((item) => item.quantity * item.price).reduce((a, b) => a + b);
    return _subtotal;
}
export const Cart = {
    items,
    reset,
    update,
    addItem,
    subtotal
};