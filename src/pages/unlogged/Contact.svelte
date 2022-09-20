<script lang="ts">
  import { Views, Utils, Stores } from '@ikomida/shared-frontend';
  import { Settings } from '../../stores/Setup';
  import { onMount } from 'svelte';

  let showImage = true;

  $: settings = $Settings?.profile;

  function hideImage() {
    showImage = false;
  }

  onMount(async () => {
    Stores.Loading.instance.stop();
  });

  Stores.Title.instance.set('Contato');
</script>

<div class="settings">
  {#if showImage}
    <img on:error={hideImage} src={settings.mainPicture} alt={settings?.contractName} />
    <Views.Divider />
  {/if}
  <h2>{settings?.contractName}</h2>
  <Views.Divider />
  <Views.TextValue
    text="CNPJ:"
    value={Utils?.Strings?.formatString(/\d/gi, '__.___.___/____-__', '_', settings?.contractIdentity)}
    fontSize="1.3em"
    leftMargin={30}
  />
  <Views.Divider />
  <Views.TextValue
    text="Celular:"
    value={Utils?.Strings?.formatAsPhone(settings?.phone)}
    fontSize="1.3em"
    leftMargin={30}
  />
  <Views.Divider />
  <Views.TextValue text="Email:" value={settings?.email} fontSize="1.3em" leftMargin={30} />
  <Views.Divider />
  <h3>Endereço:</h3>
  <br />
  {settings?.address?.street}, {settings?.address?.number}{settings?.address?.complement
    ? ` - ${settings?.address?.complement}`
    : ''}<br />{settings?.address?.neighborhood}<br />
  {settings?.address?.city}/{settings?.address?.stat} CEP: {settings?.address?.postalCode}
</div>

<style>
  .settings {
    width: 100%;
    display: flex;
    flex-direction: column;
    place-content: center;
    align-items: center;
  }
  .settings > :global(*) {
    display: flex;
    width: 100%;
    place-content: center;
  }
  .settings > img {
    font-size: 3em;
    width: 100%;
    max-width: 100%;
    border-radius: 45px;
    line-height: 90px;
    vertical-align: middle;
    display: table-cell;
    overflow: hidden;
  }
</style>
