<script>
  import { Title, Navigation, Router } from "../../stores/Navigation";
  import { search } from "../../network/Products";
  import TextEdit from "../../components/TextEdit.svelte";
  import ItemsList from "../../components/ItemsList.svelte";
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
      // error = Math.random() < 0.7;
    } else {
      items = [];
      oldValue = "";
    }
  }

  function goToOrders() {
    Navigation.goTo(Router.values.orders);
  }

  Title.set("Home");
</script>

<div>
  <TextEdit icon={faSearch} bind:value placeHolder="Buscar no cardápio" />
  {#if items.length > 0 && !error}
    <ItemsList {items} />
  {:else if error}
    <h2>Nenhum produto foi encontrado</h2>
    <h3>Tente usar outro termo para pequisar</h3>
  {/if}
</div>
