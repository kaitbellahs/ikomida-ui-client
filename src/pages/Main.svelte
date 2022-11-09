<script lang="ts">
  import { onMount } from 'svelte'
  import Routes from '../stores/Routes'
  import { Utils, Stores } from '@ikomida/shared-frontend'
  import Login from './unlogged/Login.svelte'
  import Orders from './orders/Orders.svelte'
  import Order from './orders/Order.svelte'
  import Profile from './user/Profile.svelte'
  import Checkout from './cart/Checkout.svelte'
  import Addresses from './Addresses/Addresses.svelte'
  import NewAddress from './Addresses/NewAddress.svelte'
  import Payments from './payments/Payments.svelte'
  import NewMethod from './payments/NewMethod.svelte'
  import PushNotifications from './PushNotifications/PushNotifications.svelte'

  let router = Stores.Navigation.instance.router
  let auth: Stores.Auth.IStore
  let logedIn = false

  $: route = $router.route
  $: if (!logedIn && route) {
    Stores.Title.instance.set('Login')
    Stores.Loading.instance.stop()
  }
  $: if ($auth) {
    Utils.Jws.extractToken($auth).then(async token => {
      logedIn = token !== null
    })
  } else if (!$auth && logedIn) {
    logedIn = false
  }

  onMount(async () => {
    auth = await Stores.Auth.Auth.instance.store()
    if ($auth) {
      const token = await Utils.Jws.extractToken($auth)
      logedIn = token !== null
    } else {
      logedIn = false
    }
  })
</script>

{#if logedIn}
  {#if route == Routes.orders}
    <Orders />
  {:else if route == Routes.order}
    <Order />
  {:else if route == Routes.profile}
    <Profile />
  {:else if route == Routes.checkout}
    <Checkout />
  {:else if route == Routes.addresses}
    <Addresses />
  {:else if route == Routes.newAddress}
    <NewAddress />
  {:else if route == Routes.payments}
    <Payments />
  {:else if route == Routes.newMethod}
    <NewMethod />
  {:else if route == Routes.pushNotifications}
    <PushNotifications />
  {/if}
{:else}
  <Login />
{/if}
