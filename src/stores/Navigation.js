import {
    writable
} from 'svelte/store';

const values = {
    home: Symbol("/home"),
    orders: Symbol("/orders"),
    order: Symbol("/order"),
    profile: Symbol("/profile"),
    search: Symbol("/search"),
    product: Symbol("/product"),
    cart: Symbol("/cart"),
    checkout: Symbol("/checkout"),
    confirmSubscribe: Symbol("/confirmSubscribe"),
    subscribe: Symbol("/subscribe"),
    tac: Symbol("/tac")
};

function createRouter() {
    const {
        subscribe,
        set
    } = writable({route: values.home, options: {}});

    return {
        subscribe,
        setRoute: (route) => set(route),
        values
    };
}

export const Router = createRouter();

function createTitle() {
    const {
        subscribe,
        set
    } = writable("");

    return {
        subscribe,
        set: (title) => set(title)
    };
}

export const Title = createTitle();

function createMenu() {
    const {
        subscribe,
        set,
        update
    } = writable([]);

    return {
        subscribe,
        reset: () => set([]),
        addItem: (item) => update(items => [...items, item])
    };
}

export const Menu = createMenu();

function createNavigation() {
    const {
        subscribe,
        update,
        set
    } = writable([{route: values.home, options: {}}]);

    return {
        subscribe,
        reset: (route) => {
            set([{route}]);
            Router.setRoute({route});
            Menu.reset();
        },
        goTo: (route, options) => {
            update(navigation => [...navigation, {
                route,
                options
            }]);
            Router.setRoute({
                route,
                options
            });
            Menu.reset();
        },
        pop: (count) => {
            update(navigation => {
                if (navigation.length > 1) {
                    let itemsToRemove = 1
                    if(count != undefined && typeof count === 'number' && count > 1 && count < navigation.length) {
                        itemsToRemove = count;
                    }
                    const newNavigation = [...navigation.slice(0, navigation.length - itemsToRemove)];
                    Router.setRoute(newNavigation[newNavigation.length - 1]);
                    return newNavigation;
                } else {
                    return navigation;
                }
            });
            Menu.reset();
        }
    };
}
export const Navigation = createNavigation();