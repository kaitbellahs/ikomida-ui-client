<script>
  import { Cart as CartStore, Store } from "../stores/Cart";
  import { Router, Navigation, Title, Menu } from "../stores/Navigation";
  import {Views, Utils} from "@tian/components";
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
      route: Router.values.home,
      icon: faHome,
    },
    {
      name: "Busca",
      route: Router.values.search,
      icon: faSearch,
    },
    {
      name: "Pedidos",
      route: Router.values.orders,
      icon: faList,
    },
    {
      name: "Perfil",
      route: Router.values.profile,
      icon: faUser,
    },
  ];

  $: styleHeight = $StatusBar.height + 55 + "px";
  $: route = $Router.route;
  $: subtotalArray = $Store.map((item) => item.quantity * item.price);
  $: subtotal =
    subtotalArray.length > 0 ? subtotalArray.reduce((a, b) => a + b) : 0;
  $: delivery = 0;
  $: total = subtotal + delivery;
  $: showCart =
    $Store.length > 0 &&
    route !== Router.values.cart &&
    route !== Router.values.product &&
    route !== Router.values.checkout &&
    route !== Router.values.orders &&
    route !== Router.values.order &&
    route !== Router.values.profile;

  function goToCart() {
    Navigation.goTo(Router.values.cart);
  }
  
  onMount(async () => {
    await CartStore.items();
  });
</script>

<Views.NavigationBar {Menu} {Title} paddingTop={$StatusBar.height} {Navigation} />
<main
  style="padding: 20px; padding-top: {styleHeight}; padding-bottom: {showCart
    ? '100px'
    : '50px'}; overflow: hidden;max-width: 100%;"
>
  {#if route == Router.values.home}
    <Home />
  {:else if route == Router.values.orders}
    <Orders />
  {:else if route == Router.values.order}
    <Order />
  {:else if route == Router.values.search}
    <Search />
  {:else if route == Router.values.profile}
    <Profile />
  {:else if route == Router.values.product}
    <Product />
  {:else if route == Router.values.cart}
    <Cart />
  {:else if route == Router.values.checkout}
    <Checkout />
  {:else}
    <Home />
  {/if}
  {#if showCart}
    <Views.Button isFloat=true on:click={goToCart} bottomPadding={$StatusBar.bottomPadding}>Ver sacola {Utils.Strings.currency(total)}</Views.Button
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
