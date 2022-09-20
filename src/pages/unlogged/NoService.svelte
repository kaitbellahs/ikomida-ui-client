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
  <Views.CentredMessage text="Serviço suspenso, favor entrar em contato com o responsável pelo estabelecimento!"
    >Se você é o responsável pelo estabelecimento por favor entre em contato com o suporte.</Views.CentredMessage
  >
</main>
