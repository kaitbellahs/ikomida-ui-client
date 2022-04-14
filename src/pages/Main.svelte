<script>
  import { Cart as CartStore, Store } from "../stores/Cart";
  import {
    Router,
    Navigation,
    Title,
    Menu,
    Routes,
  } from "../stores/Navigation";
  import { Views, Utils } from "@tian/components";
  import Home from "./products/Home.svelte";
  import Orders from "./Orders/Orders.svelte";
  import Order from "./Orders/Order.svelte";
  import Search from "./products/Search.svelte";
  import Profile from "./user/Profile.svelte";
  import Product from "./products/Product.svelte";
  import Checkout from "./cart/Checkout.svelte";
  import Cart from "./cart/Cart.svelte";
  import { StatusBar } from "../stores/Setup";
  import {
    faHome,
    faList,
    faUser,
    faSearch,
  } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";

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
    {
      name: "Perfil",
      route: Routes.profile,
      icon: faUser,
    },
  ];

  $: styleHeight = $StatusBar.height + 55 + "px";
  $: route = $Router.route;
  $: subtotalArray = $Store.map((item) => item.quantity * Utils.Numbers.calcDiscount(item.price, item.discount, item.discountType));
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

  function goToCart() {
    Navigation.goTo(Routes.cart);
  }

  onMount(async () => {
    await CartStore.items();
  });
</script>

<Views.NavigationBar
  {Menu}
  {Title}
  paddingTop={$StatusBar.height}
  {Navigation}
/>
<main
  style="padding: 20px; padding-top: {styleHeight}; padding-bottom: {showCart
    ? '100px'
    : '50px'}; overflow: hidden;max-width: 100%;"
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
  {:else}
    <Home />
  {/if}
  {#if showCart}
    <Views.Button
      isFloat="true"
      on:click={goToCart}
      bottomPadding={$StatusBar.bottomPadding}
      >Ver sacola {Utils.Strings.currency(total)}</Views.Button
    >
  {/if}
</main>
<Views.Tabs {tabs} {Navigation} bottomPadding={$StatusBar.bottomPadding} />

<style global>
  * {
    margin: 0;
    padding: 0;
    font-weight: normal;
  }
</style>
