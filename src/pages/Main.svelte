<script>
  import { Cart as CartStore, Store } from "../stores/Cart";
  import {
    Router,
    Navigation,
    Title,
    Menu,
    Routes,
    MenuHamburger,
  } from "../stores/Navigation";
  import { Views, Utils } from "@tian/components";
  import Home from "./products/Home.svelte";
  import Orders from "./Orders/Orders.svelte";
  import Order from "./Orders/Order.svelte";
  import Search from "./products/Search.svelte";
  import Profile from "./user/Profile.svelte";
  import BusinessHours from "./user/BusinessHours.svelte";
  import Product from "./products/Product.svelte";
  import Checkout from "./cart/Checkout.svelte";
  import Cart from "./cart/Cart.svelte";
  import { StatusBar, Layout, Settings } from "../stores/Setup";
  import {
    faHome,
    faList,
    faUser,
    faSearch,
    faSlidersH,
    faIdCard,
  } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";
  import Addresses from "./user/Addresses.svelte";
  import Payments from "./user/Payments.svelte";

  const tabs = [
    {
      name: "Home",
      route: Routes.home,
      icon: faHome,
    },
    {
      name: "Busca",
      route: Routes.search,
      icon: faSearch,
    },
    {
      name: "Pedidos",
      route: Routes.orders,
      icon: faList,
    },
  ];

  $: styleHeight = `${Number($StatusBar.height) + 50}px`;
  $: route = $Router.route;
  $: subtotalArray = $Store.map(
    (item) =>
      item.quantity *
      Utils.Numbers.calcDiscount(item.price, item.discount, item.discountType)
  );
  $: subtotal =
    subtotalArray.length > 0 ? subtotalArray.reduce((a, b) => a + b) : 0;
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
  const menuHamburgerItems = [
    {
      name: "Home",
      callback: () => Navigation.goTo(Routes.home),
      icon: faHome,
    },
    {
      name: "Perfil",
      callback: () => Navigation.goTo(Routes.profile),
      icon: faUser,
    },
    {
      name: "Endereços",
      callback: () => Navigation.goTo(Routes.addresses),
      icon: faSlidersH,
    },
    {
      name: "Meios de pagamento",
      callback: () => Navigation.goTo(Routes.payments),
      icon: faSlidersH,
    },
    {
      name: "Horario de funcionamento",
      callback: () => Navigation.goTo(Routes.businessHours),
      icon: faSlidersH,
    },
    // {
    //   name: "Sobre",
    //   callback: () => Navigation.goTo(Routes.about),
    //   icon: faIdCard,
    // },
  ];
  MenuHamburger.reset();
  menuHamburgerItems.forEach((page) => MenuHamburger.addItem(page));

  function goToCart() {
    Navigation.goTo(Routes.cart);
  }

  onMount(async () => {
    await CartStore.items();
  });
</script>

<main
  style="margin-top:{styleHeight};padding: 20px; padding-top: 0; padding-bottom: 0; padding-bottom: {showCart
    ? '115px'
    : '50px'}; overflow: scroll;max-width: 100%;background: {$Layout.background};height: 100%;"
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
  {:else}
    <Home />
  {/if}
  {#if showCart}
    <Views.Button
      {Layout}
      isFloat="true"
      on:click={goToCart}
      bottomPadding={$StatusBar.bottomPadding}
      >Ver sacola {Utils.Strings.currency(total)}</Views.Button
    >
  {/if}
</main>
<Views.NavigationBar
  logo={$Settings?.profile?.mainPicture}
  {Layout}
  {MenuHamburger}
  {Menu}
  {Title}
  paddingTop={$StatusBar.height}
  topMargin={$StatusBar.topMargin}
  {Navigation}
/>
<Views.Tabs
  {Layout}
  {tabs}
  {Navigation}
  bottomPadding={$StatusBar.bottomPadding}
/>

<style global>
  *,
  *:before,
  *:after {
    margin: 0;
    padding: 0;
    font-weight: normal;
    box-sizing: border-box;
  }
</style>
