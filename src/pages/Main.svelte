<script lang="ts">
  import { onMount } from 'svelte';
  import {
    faHome,
    faList,
    faUser,
    faSearch,
    faMoneyBill1Wave,
    faAddressCard,
    faHourglass,
    faPhone,
  } from '@fortawesome/free-solid-svg-icons';
  import Routes from '../stores/Routes';
  import { Views, Utils, Logics, Stores } from '@ikomida/shared-frontend';
  import { Cart as CartStore, IStore } from '../stores/Cart';
  import { StatusBar, Settings } from '../stores/Setup';
  import Home from './products/Home.svelte';
  import Orders from './orders/Orders.svelte';
  import Order from './orders/Order.svelte';
  import Search from './products/Search.svelte';
  import Profile from './user/Profile.svelte';
  import BusinessHours from './user/BusinessHours.svelte';
  import Product from './products/Product.svelte';
  import Checkout from './cart/Checkout.svelte';
  import Cart from './cart/Cart.svelte';
  import Addresses from './user/Addresses.svelte';
  import Payments from './payments/Payments.svelte';
  import NewMethod from './payments/NewMethod.svelte';
  import Contact from './unlogged/Contact.svelte';

  let Store: IStore;
  let Layout = Stores.Layout.instance?.store;
  let router = Stores.Navigation.instance.router;
  const tabs = [
    {
      name: 'Home',
      route: Routes.home,
      icon: faHome,
    },
    {
      name: 'Busca',
      route: Routes.search,
      icon: faSearch,
    },
    {
      name: 'Pedidos',
      route: Routes.orders,
      icon: faList,
    },
  ];
  const menuHamburgerItems = [
    {
      name: 'Home',
      callback: () => Stores.Navigation.instance.reset(Routes.home),
      icon: faHome,
    },
    {
      name: 'Perfil',
      callback: () => Stores.Navigation.instance.goTo(Routes.profile),
      icon: faUser,
    },
    {
      name: 'Endereços',
      callback: () => Stores.Navigation.instance.goTo(Routes.addresses),
      icon: faAddressCard,
    },
    {
      name: 'Meios de pagamento',
      callback: () => Stores.Navigation.instance.goTo(Routes.payments),
      icon: faMoneyBill1Wave,
    },
    {
      name: 'Horario de funcionamento',
      callback: () => Stores.Navigation.instance.goTo(Routes.businessHours),
      icon: faHourglass,
    },
    {
      name: 'Contato',
      callback: () => Stores.Navigation.instance.goTo(Routes.contact),
      icon: faPhone,
    },
  ];

  $: styleHeight = `${Number($StatusBar.height) + 50}px`;
  $: route = $router.route;
  $: subtotalArray = $Store.map(
    (item) => item.quantity * (item.price - Logics.Finances.calcDiscount(item.price, item.discount, item.discountType)),
  );
  $: subtotal = subtotalArray.length > 0 ? subtotalArray.reduce((a, b) => a + b) : 0;
  $: delivery = 0;
  $: total = subtotal + delivery;
  $: showCart =
    $Store.length > 0 &&
    route !== Routes.cart &&
    route !== Routes.product &&
    route !== Routes.checkout &&
    route !== Routes.orders &&
    route !== Routes.order &&
    route !== Routes.profile;

  Stores.MenuHamburger.instance.reset();
  menuHamburgerItems.forEach((page) => Stores.MenuHamburger.instance.addItem(page));

  function goToCart() {
    Stores.Navigation.instance.goTo(Routes.cart);
  }
  $: if (style)
    if (showCart) {
      style.innerHTML = `
      body {
        --backgroundColor: ${$Layout.background};
        --paddingTop: ${styleHeight};
        --paddingBottom: 115px;
      }
    `;
      document.head.appendChild(style);
    } else {
      style.innerHTML = `
      body {
        --backgroundColor: ${$Layout.background};
        --paddingTop: ${styleHeight};
        --paddingBottom: 55px;
      }
    `;
    }
  let style: HTMLElement;
  onMount(async () => {
    style = document.createElement('style');
    document.head.appendChild(style);
    Store = await CartStore.instance.store();
    // await CartStore.items();
  });
</script>

<main
  style="margin-top:{styleHeight};padding: 20px; padding-bottom: {showCart
    ? '140px'
    : '70px'}; overflow: scroll;max-width: 100%;background: {$Layout.background};height: 100%;"
>
  {#if route == Routes.home}
    <Home />
  {:else if route == Routes.orders}
    <Orders />
  {:else if route == Routes.order}
    <Order />
  {:else if route == Routes.search}
    <Search />
  {:else if route == Routes.profile}
    <Profile />
  {:else if route == Routes.product}
    <Product />
  {:else if route == Routes.cart}
    <Cart />
  {:else if route == Routes.checkout}
    <Checkout />
  {:else if route == Routes.addresses}
    <Addresses />
  {:else if route == Routes.payments}
    <Payments />
  {:else if route == Routes.businessHours}
    <BusinessHours />
  {:else if route == Routes.newMethod}
    <NewMethod />
  {:else if route == Routes.contact}
    <Contact />
  {:else}
    <Home />
  {/if}
  {#if showCart}
    <Views.Button bottomPadding={$StatusBar.bottomPadding} on:click={goToCart} isFloat={true}
      >Ver sacola {Utils.Strings.currency(total)}</Views.Button
    >
  {/if}
</main>
<Views.NavigationBar
  logo={$Settings?.profile?.mainPicture || 'assets/icons/transparent-logo-1.svg'}
  paddingTop={$StatusBar.height}
  topMargin={$StatusBar.topMargin}
/>
<Views.Tabs {tabs} bottomPadding={$StatusBar.bottomPadding} />
