<script lang="ts">
  import { Views, Stores } from '@ikomida/shared-frontend'
  import { onMount } from 'svelte'
  import { Settings } from '../../stores/Setup'

  const Layout = Stores.Layout.instance.store

  onMount(() => Stores.Loading.instance.stop())
  Stores.Title.instance.set('Sem serviço')
</script>

<main style="background: {$Layout.background};height: 100%;">
  <div class="mainPicture">
    <Views.Image source={$Settings.profile?.mainPicture} name={$Settings.profile?.contractName} />
  </div>
  <Views.CentredMessage text="Serviço suspenso, favor entrar em contato com o responsável pelo estabelecimento!"
    >Se você é o responsável pelo estabelecimento por favor entre em contato com o suporte.</Views.CentredMessage
  >
</main>

<style>
  .mainPicture > :global(img) {
    border-radius: 8pt;
    height: 260pt;
    max-width: 480pt;
    object-fit: contain;
    width: 100%;
  }
</style>
