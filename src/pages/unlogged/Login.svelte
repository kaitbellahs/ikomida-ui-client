<script lang="ts">
  import * as AuthNetwork from '../../network/Auth'
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import Routes from '../../stores/Routes'
  import { faPhone, faUnlock } from '@fortawesome/free-solid-svg-icons'
  import { registerPushNotificationToken } from '../../network/PushNotification'
  import { Settings } from '../../stores/Setup'
  import { onMount } from 'svelte'
  import LastRoute from '../../stores/LastRoute'
  import { Cart } from '../../stores/Cart'
  import { Cart as CartStore } from '../../stores/Cart'
  import type { IStore } from '../../stores/Cart'
  import type { Readable } from 'svelte/store'
  import type { INavigation } from '@ikomida/shared-frontend/lib/Stores/Navigation'

  const router: Readable<INavigation | undefined> = Stores.Navigation.instance.router

  let pushNotificationToken = Stores.PushNotificationToken.instance?.store
  let Layout = Stores.Layout.instance?.store
  let phone: string
  let password: string
  let isValidPhone = false
  let Store: IStore

  $: route = $router?.route
  $: showCart =
    ($Store?.length ?? 0) > 0 &&
    route !== Routes.cart &&
    route !== Routes.product &&
    route !== Routes.checkout &&
    route !== Routes.orders &&
    route !== Routes.order &&
    route !== Routes.newAddress &&
    route !== Routes.newMethod &&
    route !== Routes.profile

  $: canLogin = isValidPhone

  async function doSubscribe() {
    console.log('$router?.route:', $router?.route)
    await LastRoute.set($router?.route)
    console.log('await LastRoute.get():', await LastRoute.get())
    Stores.Navigation.instance.goTo(Routes.subscribe)
  }

  async function forgotPassword() {
    Stores.Navigation.instance.goTo(Routes.forgotPassword)
  }

  async function doLogin() {
    Stores.Loading.instance.start()
    const response = await AuthNetwork.doLogin('55', phone, password)
    if (response?.success) {
      const token = await Utils.Jws.extractToken(response?.data)
      if (token !== null) {
        await Stores.Auth.Auth.instance.setToken(response?.data)
        if ($pushNotificationToken) {
          await registerPushNotificationToken($pushNotificationToken)
        }
      } else {
        Stores.MessageAlert.instance.show('O token de acesso não é válido')
      }
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  onMount(async () => {
    Store = await CartStore.instance.store()
    Stores.Loading.instance.stop()
  })
</script>

<jumbotron class="mainPicture">
  {#if $Settings?.profile?.mainPicture}
    <Views.Image
      source={$Settings?.profile?.mainPicture ?? 'assets/icons/transparent-logo-1.svg'}
      name={$Settings?.profile?.contractName ?? 'iKomida'}
    />
  {:else if $Settings?.profile?.contractName}
    <div class="avatarCircle">
      {$Settings?.profile?.contractName?.[0]}{$Settings?.profile?.contractName?.[1]}
    </div>
    <h2>{$Settings?.profile?.contractName}</h2>
  {:else}
    <Views.Image source="assets/icons/transparent-logo-1.svg" name="iKomida" />
    <h2>{$Settings?.profile?.contractName}</h2>
  {/if}
</jumbotron>
<content
  style="padding-bottom: {showCart || route === Routes.checkout || route === Routes.cart || route === Routes.product
    ? '128pt'
    : '64pt'};background: {$Layout.background};"
>
  <Views.Divider />
  <h3>
    Se você ainda não tem uma conta, <span on:click={doSubscribe} style="color: #4c0708;">clique aqui</span> é rápido e fácil.
  </h3>
  <Views.TextEdit
    bind:value={phone}
    icon={faPhone}
    type={Types.TTextEdit.PHONE}
    placeHolder="Número de celular"
    bind:isValid={isValidPhone}
  />
  <Views.TextEdit bind:value={password} icon={faUnlock} placeHolder="Senha" type={Types.TTextEdit.PASSWORD} />
  <div />
  <Views.Divider />
  <Views.Button type={Types.TButton.SECONDARY} on:click={doLogin} disabled={!canLogin}>Entrar</Views.Button>
  <Views.Button type={Types.TButton.PRIMARY} on:click={doSubscribe}>Criar conta</Views.Button>
  <Views.Button type={Types.TButton.TRANSPARENT} on:click={forgotPassword}>Recuperar a senha</Views.Button>
  <Views.GTerms />
</content>

<style>
</style>
