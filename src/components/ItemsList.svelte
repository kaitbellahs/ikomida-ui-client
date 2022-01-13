<script>
  import Item from "../components/Item.svelte";
  
  export let items = [];
</script>

<div>
  {#each items as { title, items }, i}
    <h2>{title}</h2>
    {#each items as { title, description, serves, price, oldPrice, src, weight, quantity }, i}
      <Item {title} {description} {serves} {price} {oldPrice} {src} {weight} {quantity} />
    {/each}
  {/each}
</div>

<style>
  h2 {
    text-align: center;
    padding: 0;
    margin: 0;
    padding-bottom: 15px;
    border-bottom: 1px solid #ccc;
    margin-bottom: 15px;
  }
</style>
