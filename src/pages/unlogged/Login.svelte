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
  import type { IStore } from '../../stores/Cart'
  import type { Readable, Writable } from 'svelte/store'
  import type { INavigation } from '@ikomida/shared-frontend/lib/Stores/Navigation'
  import { Capacitor } from '@capacitor/core'
  import { Classes } from '@ikomida/shared-types'

  const router: Readable<INavigation | undefined> = Stores.Navigation.instance.router

  let pushNotificationToken: Stores.PushNotificationToken = Stores.PushNotificationToken.instance
  const Layout: Writable<Classes.CLayout | undefined> = Stores.Layout.instance?.store
  let phone: string
  let password: string
  let isValidPhone = false
  let Store: IStore

  $: canLogin = isValidPhone

  async function doSubscribe() {
    await LastRoute.set($router?.route)
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
        await Stores.Auth.Auth.instance.setToken(response?.data)
        const pNTData = pushNotificationToken.data
        if (pNTData) {
          const pNTObject = Types.Classes.CRegisterPushNotification.init(Capacitor.getPlatform(), pNTData)
          await registerPushNotificationToken(pNTObject)
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
    Store = await Cart.instance.store()
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
<content>
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
