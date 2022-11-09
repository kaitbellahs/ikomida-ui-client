<script lang="ts">
  import Routes from '../../stores/Routes'
  import { all, resetTimeout } from '../../network/Products'
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { GetSettings } from '../../network/User'
  import { Settings } from '../../stores/Setup'
  import { onMount } from 'svelte'
  import OrderType from '../../stores/OrderType'
  import { Cart } from '../../stores/Cart'

  let userInfo: Types.Classes.CUser | undefined = undefined
  let categoriesAndProducts: Types.Classes.CCategoryProducts[] | undefined = undefined
  let orderType: Types.Types.TOrderType | undefined | null = null
  let working = false
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
    if (!orderType || !$Settings.orderTypes?.includes(orderType)) {
      orderType = undefined
    }
    Stores.Loading.instance.stop()
  })
  $: Stores.Title.instance.set($Settings?.profile?.contractName ?? 'iKomida')
</script>

<h3 class="preparationTitle">Tempo de preparação dos pedidos</h3>
<div class="preparationTime">
  entre {Utils.Strings.timeToString(($Settings?.preparation?.min ?? 0) * 60)} até {Utils.Strings.timeToString(
    ($Settings?.preparation?.max ?? 0) * 60
  )}
</div>
<Views.Divider height={10} />
<div class="filters">
  {#if orderType !== null}
    <Views.Selector bind:selected={orderType} options={$Settings.orderTypes ?? []} name="Tipo do seu pedido" />
  {/if}
</div>
<Views.Divider height={30} />

{#if orderType}
  {#if (categoriesAndProducts?.length ?? 0) > 0}
    <Views.ItemsList bind:categoriesAndProducts productPage={Routes.product} />
  {:else}
    <Views.CentredMessage
      text="Por enquanto estamos ainda organizando o nosso cardápio para este tipo de pedidos, volte a verificar de novo mais tarde!"
    />
  {/if}
{:else}
  <div class="mainPicture">
    <Views.Image source={$Settings.profile?.mainPicture} name={$Settings.profile?.contractName} />
  </div>
  <Views.Divider />
  <h2>{userInfo?.name ? `Olá ${userInfo?.name}, tudo bem?` : 'Bem vindo visitante'}</h2>
  <Views.CentredMessage
    text="Pra começarmos precisa escolher o tipo do seu pedido para podermos lhe exibir os produtos certos!"
  />
{/if}

<style>
  h2 {
    text-align: center;
  }
  .mainPicture > :global(img) {
    border-radius: 40px;
    height: 210px;
    max-width: 500px;
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
    height: 73px;
    display: flex;
    flex-direction: row;
  }
</style>
