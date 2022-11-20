<script lang="ts">
  import { StatusBar } from '../../stores/Setup'
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { onMount } from 'svelte'
  import { getPrivacyPolicy } from '../../network/Terms'

  $: styleHeight = `${Number($StatusBar.height) + 56}pt`
  let term: Types.Classes.CTerm

  onMount(async () => {
    const response = await getPrivacyPolicy()
    if (response && response?.success) {
      term = Types.Classes.CTerm.fromObject(response?.data)
    }
    Stores.Loading.instance.stop()
  })
  $: Stores.Title.instance.set(term?.name ?? 'Política de privacidade')
</script>

<Views.Divider />
<div class="container">
  {#if term}
    <div class="jambtron">
      <h1>{term?.name}</h1>
      <Views.Divider />
      <h2>id: #{term?.id}</h2>
      <h3>
        Grava esse código de identificação em algum lugar, ele é a identificação do termo que você está assinando.
      </h3>
    </div>
    <div class="content">
      {@html term?.text}
    </div>
    <small>Data do termo: {Utils.Strings.dateToDateString(term?.createdAt)}</small>
  {:else}
    <h2 class="error">Ocorreu um erro, não conclua o seu pedido sem ler o termo e entre em contato com a gente</h2>
  {/if}
</div>

<style>
  .jambtron {
    display: flex;
    flex-direction: column;
    /* align-items: center; */
    place-content: center;
    margin-bottom: 32pt;
    min-height: 24vh;
    background: #cccccc25;
    border-radius: 8pt;
    box-shadow: 0 4pt 8pt #0000009e;
    width: 100%;
    padding: 16pt;
  }
  .jambtron > h1 {
    align-self: center;
    place-self: center;
  }
  .container {
    text-align: justify;
  }
  .container > * {
    text-align: justify;
  }
  .container > h2 {
    font-size: 1.5em;
    text-align: center;
  }
  .container > .content,
  .container > small {
    text-align: justify;
  }
</style>
