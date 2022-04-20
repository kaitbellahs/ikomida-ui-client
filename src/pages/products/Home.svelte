<script>
  import { Title, Navigation, Routes } from "../../stores/Navigation";
  import { all } from "../../network/Products";
  import { Views } from "@tian/components";
  import { StatusBar } from "../../stores/Setup";

  Title.set("Home");
</script>

{#await all()}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{:then items}
  <Views.Divider />
  {#if (items?.length || 0) > 0}
    <Views.ItemsList {items} productPage={Routes.product} {Navigation} />
  {:else}
    Não há produtos para exibir!
  {/if}
{/await}
