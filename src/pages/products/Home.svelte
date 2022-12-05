<script lang="ts">
  import Routes from '../../stores/Routes'
  import { all, resetTimeout } from '../../network/Products'
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { GetSettings } from '../../network/User'
  import { Settings } from '../../stores/Setup'
  import { onMount } from 'svelte'
  import OrderType from '../../stores/OrderType'
  import { Cart } from '../../stores/Cart'
  import type { IStore } from '../../stores/Cart'
  import { Cart as CartStore } from '../../stores/Cart'

  let userInfo: Types.Classes.CUser | undefined = undefined
  let categoriesAndProducts: Types.Classes.CCategoryProducts[] | undefined = undefined
  let orderType: Types.Types.TOrderType | undefined | null = null
  let working = false
  let Layout = Stores.Layout.instance?.store
  let router = Stores.Navigation.instance.router
  let Store: IStore

  $: route = $router.route
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

  $: if (orderType !== null) {
    OrderType.set(orderType)
    if (orderType) {
      updateAll()
    }
  }
  async function updateAll() {
    if (!working) {
      working = true
      Stores.Loading.instance.start()
      resetTimeout()
      await Cart.instance.updateType()
      await Cart.instance.products()
      categoriesAndProducts = await all()
      Stores.Loading.instance.stop()
      working = false
    }
  }
  onMount(async () => {
    Store = await CartStore.instance.store()
    const auth = await Stores.Auth.Auth.instance.data()
    if (auth) {
      userInfo = await Utils.Jws.extractToken(auth)
    }
    orderType = await OrderType.get()
    let response = await GetSettings()
    if (response?.success && response?.data) {
      const settings: Types.Classes.CVendorSettings = Types.Classes.CVendorSettings.fromObject({
        ...Settings.get().toJSON(),
        ...response?.data
      })
      Settings.set(settings)
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    if ($Settings.orderTypes?.length === 1) {
      orderType = $Settings.orderTypes[0]
    } else if (!orderType || !$Settings.orderTypes?.includes(orderType)) {
      orderType = undefined
    }
    Stores.Loading.instance.stop()
  })
  $: Stores.Title.instance.set($Settings?.profile?.contractName ?? 'iKomida')
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
  <h3 class="preparationTitle">Tempo de preparação dos pedidos</h3>
  {#if ($Settings?.preparation?.min ?? 0) > 0}
    <div class="preparationTime">
      {($Settings?.preparation?.max ?? 0) > ($Settings?.preparation?.min ?? 0) ? `entre` : ''}
      {Utils.Strings.timeToString(($Settings?.preparation?.min ?? 0) * 60)}
      {($Settings?.preparation?.max ?? 0) > ($Settings?.preparation?.min ?? 0)
        ? `até ${Utils.Strings.timeToString(($Settings?.preparation?.max ?? 0) * 60)}`
        : ''}
    </div>
  {/if}
  {#if orderType !== null && ($Settings.orderTypes?.length ?? 0) > 1}
    <Views.Divider height={10} />
    <div class="filters">
      <Views.Selector bind:selected={orderType} options={$Settings.orderTypes ?? []} name="Tipo do seu pedido" />
    </div>
  {/if}
  <Views.Divider height={30} />

  {#if orderType}
    {#if (categoriesAndProducts?.length ?? 0) > 0}
      <Views.ItemsList bind:categoriesAndProducts productPage={Routes.product} />
    {:else}
      <Views.CentredMessage
        text="Por enquanto estamos ainda organizando o nosso cardápio para este tipo de pedidos, volte mais tarde e confira!"
      />
    {/if}
  {:else if ($Settings.orderTypes?.length ?? 0) === 0}
    <Views.Divider />
    <h2>{userInfo?.name ? `Olá ${userInfo?.name}, tudo bem?` : 'Bem vindo visitante'}</h2>
    <Views.Divider />
    <Views.CentredMessage
      text="Por enquanto estamos cadastrando os produtos e preparando nosso estabelecimento dital, volte mais tarde e confira!"
    />
  {:else}
    <Views.Divider />
    <h2>{userInfo?.name ? `Olá ${userInfo?.name}, tudo bem?` : 'Bem vindo visitante'}</h2>
    <Views.Divider />
    <Views.CentredMessage
      text="Pra começarmos precisa escolher o tipo do seu pedido para podermos lhe exibir os produtos certos!"
    />
  {/if}
</content>

<style>
  .mainPicture > :global(img) {
    /* border-radius: 8pt;
    max-height: 260pt;
    max-width: 480pt; */
    object-fit: contain;
    width: 100%;
  }
  .preparationTitle,
  .preparationTime {
    text-align: center;
  }
  .preparationTime {
    font-size: 1.1em;
  }
  .filters {
    width: 100%;
    height: 72pt;
    display: flex;
    flex-direction: row;
  }
</style>
