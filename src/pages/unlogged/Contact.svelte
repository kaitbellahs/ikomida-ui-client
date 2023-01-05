<script lang="ts">
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { Settings } from '../../stores/Setup'
  import { onMount } from 'svelte'
  import { AppLauncher } from '@capacitor/app-launcher'
  import { Clipboard } from '@capacitor/clipboard'

  let userInfo: Types.Classes.CUser

  $: settings = $Settings?.profile

  async function openAddress() {
    if (settings?.address?.location?.latitude && settings?.address?.location?.longitude) {
      const url = `geo:${settings?.address?.location?.latitude},${settings?.address?.location?.longitude}`
      const { value } = await AppLauncher.canOpenUrl({ url })
      await AppLauncher.openUrl({ url })
      if (!value) {
        await Clipboard.write({ string: url })
        Stores.MessageAlert.instance.show(
          `Se o navigador externo nao abriu: abra o e digitar essa URL: ${url}, também foi copiado para sua área de transferência para colar-lo!`
        )
      }
    }
  }

  async function openWhatsapp() {
    if (userInfo) {
      const url = `https://api.whatsapp.com/send/?phone=${settings?.areaCode}${settings?.phone}&amp;text=Ol%C3%A1%2C%20tudo%20bem%3F%0ASou%20${userInfo.name}%20${userInfo.lastName}&amp;type=phone_number&amp;app_absent=0&amp;_fb_noscript=1`
      const { value } = await AppLauncher.canOpenUrl({ url })
      await AppLauncher.openUrl({ url })
      if (!value) {
        await Clipboard.write({ string: url })
        Stores.MessageAlert.instance.show(
          `Se o navigador externo nao abriu: abra o e digitar essa URL: ${url}, também foi copiado para sua área de transferência para colar-lo!`
        )
      }
    }
  }

  async function openEmail() {
    if (userInfo) {
      const url = `mailto:${settings?.email}?subject=Solicitação de suporte&body=Ol%C3%A1%2C%20tudo%20bem%3F%0ASou%20${userInfo.name}%20${userInfo.lastName}%2C%20usu%C3%A1rio%20do%20seuo%20app%20${settings?.contractName}%2C%20e%20preciso%20de%20suporte%20para%20resolver%20%E2%80%A6`
      const { value } = await AppLauncher.canOpenUrl({ url })
      await AppLauncher.openUrl({ url })
      if (!value) {
        await Clipboard.write({ string: url })
        Stores.MessageAlert.instance.show(
          `Se o navigador externo nao abriu: abra o e digitar essa URL: ${url}, também foi copiado para sua área de transferência para colar-lo!`
        )
      }
    }
  }

  onMount(async () => {
    userInfo = await Utils.Jws.extractToken((await Stores.Auth.Auth.instance.data()) ?? '')
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
  <div class="data shadow" on:click={openWhatsapp}>
    <Views.TextValue
      text="Celular:"
      value={Utils?.Strings?.formatAsPhone(settings?.phone)}
      fontSize="1.3em"
      leftMargin={30}
    />
  </div>
  <Views.Divider />
  <div class="data shadow" on:click={openEmail}>
    <Views.TextValue text="Email:" value={settings?.email} fontSize="1.3em" leftMargin={30} />
  </div>
  <Views.Divider />
  <div class="data shadow" on:click={openAddress}>
    <h3>Endereço:</h3>
    <br />
    {settings?.address?.street}, {settings?.address?.number}{settings?.address?.complement
      ? ` - ${settings?.address?.complement}`
      : ''}<br />{settings?.address?.neighborhood}<br />
    {settings?.address?.city}/{settings?.address?.stat} CEP: {settings?.address?.postalCode}
  </div>
  <Views.Divider />
  <div class="data shadow">
    <Views.TextValue
      text="CNPJ:"
      value={Utils?.Strings?.formatString(/\d/gi, '__.___.___/____-__', '_', settings?.contractIdentity)}
      fontSize="1.3em"
      leftMargin={30}
    />
  </div>
</content>

<style>
  h2 {
    text-align: center;
  }
  .data {
    padding: 16px;
    border-radius: 8px;
  }
</style>
