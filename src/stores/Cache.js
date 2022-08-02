import {
    writable,
    get
} from 'svelte/store';

function createCache() {
    const {
        subscribe,
        set,
        update
    } = writable({});

    return {
        subscribe,
        setObject: (name, value) => {
            update(items => {
                items[name] = value
                return items
            })
        }
    };
}
const cacheStore = createCache();
export default {
    store: cacheStore,
    setObject: cacheStore.setObject,
    getObject: name => {
        const items = get(cacheStore)
        if (name in items) {
            return items[name]
        }
        return null
    }
}