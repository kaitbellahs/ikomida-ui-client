<script>
  import { Title } from "../../stores/Navigation";
  import { all } from "../../network/Products";
  import ItemsList from "../../components/ItemsList.svelte";
  import Loading from "../../components/Loading.svelte";
  
  Title.set("Home");
</script>

{#await all()}
  <Loading />
{:then items}
  <ItemsList {items} />
{/await}
