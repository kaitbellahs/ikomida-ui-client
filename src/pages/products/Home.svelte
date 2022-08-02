<script>
  import { Title, Navigation, Routes } from "../../stores/Navigation";
  import { all } from "../../network/Products";
  import { Views, Utils } from "@ikomida/components";
  import { StatusBar, Settings } from "../../stores/Setup";

  Title.set("Home");
</script>

{#await all()}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{:then items}
  <Views.Divider />
  {#if (items?.length ?? 0) > 0}
    <h3 class="preparationTitle">Tempo de preparação dos pedidos</h3>
    <div class="preparationTime">
      entre {Utils.Strings.timeToString($Settings?.preparation?.min * 60)}, e {Utils.Strings.timeToString($Settings?.preparation?.max * 60)}
    </div>
    <Views.ItemsList {items} productPage={Routes.product} {Navigation} />
  {:else}
    Não há produtos para exibir!
  {/if}
{/await}

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