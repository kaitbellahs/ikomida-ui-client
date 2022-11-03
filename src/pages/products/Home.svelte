<script lang="ts">
  import Routes from '../../stores/Routes'
  import { all, resetTimeout } from '../../network/Products'
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { GetSettings } from '../../network/User'
  import { Settings } from '../../stores/Setup'
  import { onMount } from 'svelte'
  import OrderType from '../../stores/OrderType'
  import { Cart } from '../../stores/Cart'

  let categoriesAndProducts: Types.Classes.CCategoryProducts[] | undefined = undefined
  let orderType: Types.Types.TOrderType | undefined | null = null
  $: if (orderType !== null) {
    OrderType.set(orderType)
    if (orderType) {
      updateAll()
    }
  }
  async function updateAll() {
    Stores.Loading.instance.start()
    resetTimeout()
    await Cart.instance.updateType()
    await Cart.instance.products()
    categoriesAndProducts = await all()
    Stores.Loading.instance.stop()
  }
  onMount(async () => {
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
    if (!$Settings.orderTypes.includes(orderType)) {
      orderType = undefined
    }
    Stores.Loading.instance.stop()
  })
  $: Stores.Title.instance.set($Settings?.profile?.contractName ?? 'iKomida')
</script>

<h3 class="preparationTitle">Tempo de preparação dos pedidos</h3>
<div class="preparationTime">
  entre {Utils.Strings.timeToString($Settings?.preparation?.min * 60)}, e {Utils.Strings.timeToString(
    $Settings?.preparation?.max * 60
  )}
</div>
<Views.Divider height={10} />
<div class="filters">
  {#if orderType !== null}
    <Views.Selector bind:selected={orderType} options={$Settings.orderTypes} name="Tipo do seu pedido" />
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
  <Views.CentredMessage
    text="Pra começarmos precisa escolher o tipo do seu pedido para podermos lhe exibir os produtos certos!"
  />
{/if}

<style>
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
