import { Subscriber, Unsubscriber, writable } from 'svelte/store';
import { Preferences } from '@capacitor/preferences';
import { get } from 'svelte/store';
import { Stores, Types, Utils } from '@ikomida/shared-frontend';

export interface IStore {
    subscribe: (
        this: void,
        run: Subscriber<Types.CCart[]>,
        invalidate?: ((value?: Types.CCart[] | null | undefined) => void) | undefined,
    ) => Unsubscriber;
    addProduct: (product: Types.CCart) => void
    updateProducts: (newProducts: Types.CCart[]) => void
    reset: () => void
}

export class Cart {
    //MARK: -- static region
    static instance: Cart;
    unsubscribe: any;
    static createInstance() {
        if (!Cart.instance) {
            Object.defineProperty(Cart, 'instance', {
                value: new Cart(),
                writable: false,
                enumerable: false,
                configurable: false,
            });
        }
        return Cart.instance;
    }

    //MARK: -- instance region
    private name = 'Cart'
    private storeValue?: IStore;
    constructor() {
        Stores.Auth.Auth.instance.store().then(store => {
            store.subscribe(async (token) => {
                const user: Types.Classes.CUser = Types.Classes.CUser.fromObject(await Utils.Jws.extractToken(token))
                if (user) {
                    this.name = `Cart-${user.id}`
                }
            })
        });
    }
    setter(setter: Subscriber<Types.CCart[]>): void | Unsubscriber {
        let products: Types.CCart[] | null = null;
        Preferences.get({
            key: this.name,
        }).then((result) => {
            products = Types.CCart.fromObject(JSON.parse(result.value ?? '[]'));
            if (products === null) products = [];
            setter(products);
        })
            .catch((error: any) => {
                products = [];
                setter(products);
                //TODO: -- report errors
            });
    }

    async createStore() {
        const { subscribe,
            set,
            update } = writable([], this.setter.bind(this));

        return {
            subscribe,
            addProduct: (product: Types.CCart) => update(_products => [..._products, product]),
            updateProducts: (newProducts: Types.CCart[]) => update(() => newProducts),
            reset: () => set([]),
        };
    }

    async store(): Promise<IStore> {
        if (!this.storeValue) {
            this.storeValue = await this.createStore();
        }
        return this.storeValue;
    }

    async subscribe(callBack: Subscriber<Types.CCart[]>) {
        this.unsubscribe = (await this.store()).subscribe(callBack);
    }

    destroy() {
        this.unsubscribe?.();
    }

    async data() {
        const store = await this.store();
        return get(store);
    }
    async reset() {
        await this.save([])
        const store = await this.store();
        return store?.reset();
    }

    async update(products: Types.CCart[]) {
        this.save(products)

        const store = await this.store();
        return store?.updateProducts(products);
    }

    async products() {
        let _products: Types.CCart[] = [];
        try {
            const ret = await Preferences.get({
                key: this.name
            });
            _products = Types.CCart.fromObject(JSON.parse(ret.value ?? '[]'));
        } catch (error: any) {
            _products = [];
            //TODO: -- report errors
        }
        _products = _products != null ? _products : [];

        const store = await this.store();
        store?.updateProducts(_products);
        return _products;
    }

    async addProduct(product: Types.CCart) {
        let oldProducts: Types.CCart[] = [];
        try {
            oldProducts = await this.products();
        } catch (error: any) {
            //TODO: -- report errors
        }
        const products = [...new Set([...oldProducts, product])]
        await this.save(products)
        const store = await this.store();
        return store?.updateProducts(products);
    }

    async subtotal() {
        let oldProducts: Types.CCart[] = [];
        try {
            oldProducts = await this.products();
        } catch (error: any) {
            //TODO: -- report errors
        }
        const _subtotal = oldProducts.map((product) => product.quantity * product.price).reduce((a, b) => a + b);
        return _subtotal;
    }

    private async save(products: Types.CCart[]) {
        const json = []
        for (const product of products) {
            json.push(product.toJSON())
        }
        await Preferences.set({
            key: this.name,
            value: JSON.stringify(json)
        });
    }
}