<script>
  import { Title, Navigation, Routes } from "../../stores/Navigation";
  import { search } from "../../network/Products";
  import { Views } from "@tian/components";
  import { faSearch } from "@fortawesome/free-solid-svg-icons";

  let items = [];
  let value = "";
  let oldValue;
  let error = false;

  $: if (value != oldValue) {
    error = false;
    if (value.length > 0) {
      items = search(value);
      oldValue = value;
    } else {
      items = [];
      oldValue = "";
    }
  }

  function goToOrders() {
    Navigation.goTo(Routes.orders);
  }

  Title.set("Home");
</script>

<div>
  <Views.TextEdit icon={faSearch} bind:value placeHolder="Buscar no cardápio" />
  {#if items.length > 0 && !error}
    <Views.ItemsList {items} productPage={Routes.product} {Navigation} />
  {:else if error}
    <h2>Nenhum produto foi encontrado</h2>
    <h3>Tente usar outro termo para pequisar</h3>
  {/if}
</div>
