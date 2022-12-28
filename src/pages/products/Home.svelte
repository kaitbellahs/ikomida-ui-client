<script lang="ts">
  import type { IStore } from '../../stores/Cart'
  import Routes from '../../stores/Routes'
  import OrderType from '../../stores/OrderType'
  import { all, resetTimeout } from '../../network/Products'
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { GetSettings } from '../../network/User'
  import { Settings } from '../../stores/Setup'
  import { onMount } from 'svelte'
  import { Cart } from '../../stores/Cart'
  import { Writable } from 'svelte/store'
  import { Classes } from '@ikomida/shared-types'

  const cart: Cart = Cart.instance
  const Layout: Writable<Classes.CLayout | undefined> = Stores.Layout.instance?.store

  let itemsList: HTMLDivElement[] = []
  let userInfo: Types.Classes.CUser | undefined = undefined
  let categoriesAndProducts: Types.Classes.CCategoryProducts[] | undefined = undefined
  let orderType: Types.Types.TOrderType | undefined | null = null
  let working = false
  let Store: IStore

  $: if (orderType !== null) {
    OrderType.set(orderType)
    if (orderType) {
      updateAll()
    }
  }

  $: Stores.Title.instance.set($Settings?.profile?.contractName ?? 'iKomida')

  async function updateAll() {
    if (!working) {
      working = true
      Stores.Loading.instance.start()
      resetTimeout()
      await cart.updateType()
      await cart.products()
      categoriesAndProducts = await all()
      Stores.Loading.instance.stop()
      working = false
    }
  }

  onMount(async () => {
    Store = await cart.store()
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
<Views.Scroll
  tag="content"
  {itemsList}
  animationIn={$Layout?.product.animation.in}
  animationOut={$Layout?.product.animation.out}
  backgroundImage={$Layout?.backgroundImage}
>
  <div class="shadow filters backgroundCustomColor">
    <h3 class="preparationTitle">Tempo de preparação do pedido</h3>
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
      <div class="divider" />
      <div class="filter">
        <Views.Selector bind:selected={orderType} options={$Settings.orderTypes ?? []} name="Tipo do seu pedido" />
      </div>
    {/if}
  </div>
  <Views.Divider height={24} />

  {#if orderType}
    {#if (categoriesAndProducts?.length ?? 0) > 0}
      <Views.ItemsList bind:itemsList bind:categoriesAndProducts productPage={Routes.product} />
    {:else}
      <Views.CentredMessage
        text="Estamos organizando o nosso cardápio para este tipo de pedido, volte mais tarde e confira as novidades que estamos preparando para você!"
      />
    {/if}
  {:else if ($Settings.orderTypes?.length ?? 0) === 0}
    <h2 class="background">{userInfo?.name ? `Olá ${userInfo?.name}, tudo bem?` : 'Bem vindo visitante'}</h2>
    <Views.Divider />
    <Views.CentredMessage
      text="Por enquanto estamos cadastrando os produtos e preparando nosso estabelecimento digital, volte mais tarde e confira as novidades que estamos preparando para você!"
    />
  {:else}
    <h2 class="background">{userInfo?.name ? `Olá ${userInfo?.name}, tudo bem?` : 'Bem vindo visitante'}</h2>
    <Views.Divider />
    <Views.CentredMessage
      text="Pra começarmos precisa escolher o tipo do seu pedido para podermos lhe exibir os produtos certos!"
    />
  {/if}
</Views.Scroll>

<style>
  .mainPicture > :global(img) {
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
    padding: 12pt;
    border-radius: 8pt;
  }
  .filters > .divider {
    width: 100%;
    height: 1pt;
    margin: 12pt 0 0;
    background-color: #ccc;
  }
  .filters > .filter {
    width: 100%;
    height: 64pt;
    align-items: flex-end;
    display: flex;
    flex-direction: row;
  }
</style>
