<script lang="ts">
  import Routes from '../../stores/Routes';
  import { search } from '../../network/Products';
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend';
  import { faSearch } from '@fortawesome/free-solid-svg-icons';
  import { Settings } from '../../stores/Setup';
  import { onMount } from 'svelte';

  let categoriesAndProducts: Types.Classes.CCategoryProducts[] = [];
  let value = '';
  let oldValue = '';
  let error = false;

  $: if (value != oldValue) {
    Stores.Loading.instance.start();
    error = false;
    if ((value?.length ?? 0) > 0) {
      search(value).then((_categoriesAndProducts) => {
        categoriesAndProducts = _categoriesAndProducts;
        oldValue = value;
      });
    } else {
      categoriesAndProducts = [];
      oldValue = '';
    }
    Stores.Loading.instance.stop();
  }
  onMount(() => {
    Stores.Loading.instance.stop();
  });

  Stores.Title.instance.set('Pesquisar produtos');
</script>

<Views.TextEdit icon={faSearch} bind:value placeHolder="Buscar no cardápio" />
<Views.Divider />
{#if (categoriesAndProducts?.length ?? 0) > 0 && !error}
  <h3 class="preparationTitle">Tempo de preparação dos pedidos</h3>
  <div class="preparationTime">
    entre {Utils.Strings.timeToString($Settings?.preparation?.min * 60)}, e {Utils.Strings.timeToString(
      $Settings?.preparation?.max * 60,
    )}
  </div>
  <Views.ItemsList {categoriesAndProducts} productPage={Routes.product} />
{:else}
  <Views.CentredMessage text="Nenhum produto foi encontrad">
    <h3>Tente usar outro termo para pequisar</h3>
  </Views.CentredMessage>
{/if}

<style>
  .preparationTitle,
  .preparationTime {
    text-align: center;
  }
  .preparationTime {
    font-size: 1.1em;
    margin-bottom: 20px;
  }
</style>
