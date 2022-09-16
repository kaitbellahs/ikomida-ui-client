<script>
  import Routes from "../../stores/Routes";
  import { all } from "../../network/Products";
  import { Views, Utils, Stores } from "@ikomida/components";
  import { StatusBar, Settings } from "../../stores/Setup";
  import { onMount } from "svelte";

  let items = null;

  onMount(async () => {
    items = await all();
    Stores.Loading.instance.stop();
  });
  $: Stores.Title.instance.set($Settings?.profile?.contractName ?? "iKomida");
</script>

{#if (items?.length ?? 0) > 0}
  <h3 class="preparationTitle">Tempo de preparação dos pedidos</h3>
  <div class="preparationTime">
    entre {Utils.Strings.timeToString($Settings?.preparation?.min * 60)}, e {Utils.Strings.timeToString(
      $Settings?.preparation?.max * 60
    )}
  </div>
  <Views.ItemsList {items} productPage={Routes.product} />
{:else}
  <Views.CentredMessage
    text="Por enquanto estamos ainda organizando o nosso cardápio e ainda não cadastramos nenhum produto, volte a verificar de novo mais tarde!"
  />
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
