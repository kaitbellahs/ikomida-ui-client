<script>
  import { Title } from "../../stores/Navigation";
  import { Views, Utils } from "@ikomida/components";
  import { Layout, Settings, StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";
  let isLoading = true;
  let showImage = true;

  $: settings = $Settings?.profile;

  function hideImage() {
    showImage = false;
  }

  onMount(async () => {
    isLoading = false;
  });

  Title.set("Contato");
</script>

<div class="settings">
  {#if showImage}
    <img
      on:error={hideImage}
      src={settings.mainPicture}
      alt={settings?.restaurantName}
    />
    <Views.Divider />
  {/if}
  <h2>{settings?.restaurantName}</h2>
  <Views.Divider />
  <Views.TextValue
    text="CNPJ:"
    value={Utils?.Strings?.formatString(
      /\d/gi,
      "__.___.___/____-__",
      "_",
      settings?.cnpj
    )}
    fontSize="1.3em"
    leftMargin="30"
  />
  <Views.Divider />
  <Views.TextValue
    text="Celular:"
    value={Utils?.Strings?.formatAsPhone(settings?.phone)}
    fontSize="1.3em"
    leftMargin="30"
  />
  <Views.Divider />
  <Views.TextValue
    text="Email:"
    value={settings?.email}
    fontSize="1.3em"
    leftMargin="30"
  />
  <Views.Divider />
  <h3>Endereço:</h3>
  <br />
  {settings?.address?.street}, {settings?.address?.number}{settings?.address
    ?.complement
    ? ` - ${settings?.address?.complement}`
    : ""}<br />{settings?.address?.neighborhood}<br />
  {settings?.address?.city}/{settings?.address?.stat} CEP: {settings?.address
    ?.postalCode}
</div>

{#if settings === {} || isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}

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
