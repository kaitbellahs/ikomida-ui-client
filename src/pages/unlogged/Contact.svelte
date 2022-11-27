<script lang="ts">
  import { Views, Utils, Stores } from '@ikomida/shared-frontend'
  import { Settings } from '../../stores/Setup'
  import { onMount } from 'svelte'

  $: settings = $Settings?.profile

  onMount(async () => {
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Contato')
</script>

<jumbotron class="mainPicture">
  {#if $Settings?.profile?.mainPicture}
    <Views.Image
      source={$Settings?.profile?.mainPicture ?? 'assets/icons/transparent-logo-1.svg'}
      name={$Settings?.profile?.contractName ?? 'iKomida'}
    />
  {:else if $Settings?.profile?.contractName}
    <div class="avatarCircle">
      {$Settings?.profile?.contractName?.[0]}{$Settings?.profile?.contractName?.[1]}
    </div>
    <h2>{$Settings?.profile?.contractName}</h2>
  {:else}
    <Views.Image source="assets/icons/transparent-logo-1.svg" name="iKomida" />
    <h2>{$Settings?.profile?.contractName}</h2>
  {/if}
</jumbotron>
<content>
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
</content>
