<script lang="ts">
  import { Views, Stores } from '@ikomida/shared-frontend'
  import { onMount } from 'svelte'
  const Layout = Stores.Layout.instance.store

  onMount(() => Stores.Loading.instance.stop())
</script>

<main style="background: {$Layout.background};height: 100%;">
  <Views.Image source="assets/icons/transparent-logo-1.svg" name="iKomida" />
  <h3>Carregando...</h3>
</main>

<style>
  main {
    align-items: center;
    place-content: center;
  }
  main > :global(img) {
    width: 100%;
    padding: 16px;
  }
</style>
