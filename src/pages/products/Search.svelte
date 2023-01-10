<script lang="ts">
  import Routes from '../../stores/Routes'
  import { search } from '../../network/Products'
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { faSearch } from '@fortawesome/free-solid-svg-icons'
  import { Settings } from '../../stores/Setup'
  import { onMount } from 'svelte'
  import { Writable } from 'svelte/store'
  import { Classes } from '@ikomida/shared-types'

  const Layout: Writable<Classes.CLayout | undefined> = Stores.Layout.instance?.store
  let mainScroll = Stores.MainScroll.createInstance().store

  let itemsList: HTMLDivElement[] = []
  let categoriesAndProducts: Types.Classes.CCategoryProducts[] = []
  let value = ''
  let oldValue = ''
  let error = false

  $: if (value != oldValue) {
    Stores.Loading.instance.start()
    error = false
    if ((value?.length ?? 0) > 0) {
      search(value).then(_categoriesAndProducts => {
        categoriesAndProducts = _categoriesAndProducts
        oldValue = value
      })
    } else {
      categoriesAndProducts = []
      oldValue = ''
    }
    Stores.Loading.instance.stop()
  }
  onMount(() => {
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Pesquisar produtos')
</script>

<data>
  <div class="shadow filters backgroundCustomColor">
    <h3 class="preparationTitle">Tempo de preparação do pedido</h3>
    {#if ($Settings?.preparation?.min ?? 0) > 0}
      <div class="preparationTime">
        {($Settings?.preparation?.max ?? 0) > ($Settings?.preparation?.min ?? 0) ? `entre` : ''}
        {Utils.Strings.timeToString(($Settings?.preparation?.min ?? 0) * 60)}
        {($Settings?.preparation?.max ?? 0) > ($Settings?.preparation?.min ?? 0)
          ? `e ${Utils.Strings.timeToString(($Settings?.preparation?.max ?? 0) * 60)}`
          : ''}
      </div>
      <div class="divider" />
    {/if}
    <Views.TextEdit marginTop={24} icon={faSearch} bind:value placeHolder="Buscar no cardápio" />
  </div>
  <Views.Divider />
  {#if (categoriesAndProducts?.length ?? 0) > 0 && !error}
    <Views.Scroll
      tag="content"
      style="top: calc(50vw - 0px);"
      {itemsList}
      animationIn={$Layout?.product?.animation?.in}
      animationOut={$Layout?.product?.animation?.out}
      backgroundImage={$Layout?.backgroundImage}
      showHeader={($mainScroll?.top ?? 0) > ($mainScroll?.offsetHeight ?? 0) / 4}
    >
      <Views.ItemsList bind:itemsList bind:categoriesAndProducts productPage={Routes.product} />
    </Views.Scroll>
  {:else}
    <Views.CentredMessage text="Nenhum produto foi encontrado">
      <h3>Tente usar outro termo para pequisar</h3>
    </Views.CentredMessage>
  {/if}
</data>

<style>
  .preparationTitle,
  .preparationTime {
    text-align: center;
  }
  .preparationTime {
    font-size: 1.1em;
  }
  .filters {
    padding: 12px;
    border-radius: 8px;
    width: 100%;
  }
  .filters > .divider {
    width: 100%;
    height: 1px;
    margin: 12px 0 0;
    background-color: #ccc;
  }
</style>
