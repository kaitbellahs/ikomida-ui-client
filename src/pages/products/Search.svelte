<script>
  import { Title, Navigation, Routes } from "../../stores/Navigation";
  import { search } from "../../network/Products";
  import { Views, Utils } from "@ikomida/components";
  import { faSearch } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar, Settings } from "../../stores/Setup";

  let items = [];
  let value = "";
  let oldValue;
  let error = false;
  let isLoading = false;

  $: if (value != oldValue) {
    isLoading = true;
    error = false;
    if ((value?.length ?? 0) > 0) {
      search(value).then((_items) => {
        items = _items;
        oldValue = value;
      });
    } else {
      items = [];
      oldValue = "";
    }
    isLoading = false;
  }

  Title.set("Pesquisar produtos");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}

<Views.TextEdit
  marginTop="-"
  icon={faSearch}
  bind:value
  placeHolder="Buscar no cardápio"
/>
<Views.Divider />
{#if (items?.length ?? 0) > 0 && !error}
  <h3 class="preparationTitle">Tempo de preparação dos pedidos</h3>
  <div class="preparationTime">
    entre {Utils.Strings.timeToString($Settings?.preparation?.min * 60)}, e {Utils.Strings.timeToString(
      $Settings?.preparation?.max * 60
    )}
  </div>
  <Views.ItemsList {items} productPage={Routes.product} {Navigation} />
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
