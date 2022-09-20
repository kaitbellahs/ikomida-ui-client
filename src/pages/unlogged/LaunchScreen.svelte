<script lang="ts">
  import { Views, Stores } from '@ikomida/shared-frontend';
  import { onMount } from 'svelte';
  import { StatusBar } from '../../stores/Setup';
  const Layout = Stores.Layout.instance.store;

  onMount(() => Stores.Loading.instance.stop());
  Stores.Title.instance.set('Sem serviço');
</script>

<Views.NavigationBar paddingTop={$StatusBar.height} />
<main style="background: {$Layout.background};height: 100%;">
  <img src="assets/icons/transparent-logo-1.svg" alt="iKomida" />
  <h3>Carregando...</h3>
</main>

<style>
  main {
    align-items: center;
    place-content: center;
  }
  img {
    width: 100%;
  }
</style>
