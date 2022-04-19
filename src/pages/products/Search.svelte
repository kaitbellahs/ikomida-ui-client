<script>
  import { Title, Navigation, Routes } from "../../stores/Navigation";
  import { search } from "../../network/Products";
  import { Views } from "@tian/components";
  import { faSearch } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";

  let items = [];
  let value = "";
  let oldValue;
  let error = false;
  let isLoading = false;

  $: if (value != oldValue) {
    isLoading = true;
    error = false;
    if ((value?.length || 0) > 0) {
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

<div>
  <Views.TextEdit icon={faSearch} bind:value placeHolder="Buscar no cardápio" />
  <Views.Divider />
  {#if items.length > 0 && !error}
    <Views.ItemsList {items} productPage={Routes.product} {Navigation} />
  {:else if error}
    <h2>Nenhum produto foi encontrado</h2>
    <h3>Tente usar outro termo para pequisar</h3>
  {:else}
    <h2>Nenhum produto foi encontrado</h2>
    <h3>Tente usar outro termo para pequisar</h3>
  {/if}
</div>
