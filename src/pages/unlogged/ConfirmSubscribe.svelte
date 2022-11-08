<script lang="ts">
  import Routes from '../../stores/Routes'
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { faUnlock } from '@fortawesome/free-solid-svg-icons'
  import { requestPhoneValidation, validatePhoneValidationCode, subscribe } from '../../network/Auth'
  import { StatusBar } from '../../stores/Setup'
  import { onDestroy, onMount } from 'svelte'

  const countdownWaitTime = 60
  const router = Stores.Navigation.instance.router
  const Layout = Stores.Layout.instance.store

  let showRequestValidatingCodeAlert = false
  let subscribeObject: Types.Classes.CUser = $router.options
  let canDigitValidationCode = false
  let canSubscribe = false
  let canRequestCode = false
  let isValidationValid = false
  let timer: NodeJS.Timer | null = null
  let countdownCanRequestCode = true
  let countdown = 0
  let callbackId: string | null

  $: if (countdown === 0) {
    if (timer) {
      clearInterval(timer)
    }
    countdownCanRequestCode = true
    countdown = countdownWaitTime
  }
  $: styleHeight = `${Number($StatusBar.height) + 50}px`

  async function doSubscribe() {
    Stores.Loading.instance.start()
    const response = await subscribe(subscribeObject)
    if (response?.success) {
      callbackId = 'doSubscribe'
      Stores.MessageAlert.instance.show(
        'Seu cadastro foi concluído com sucesso, agora é só você usar seu número de telefone como usuário e sua senha para acessar a área logada e usufruir dos nossos produtos e serviços.',
        closeCallBack
      )
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  function closeCallBack() {
    if (callbackId === 'doSubscribe') {
      callbackId = null
      Stores.Navigation.instance.reset(Routes.login)
    }
  }

  function validateValidationCode(validationValid: string) {
    return (validationValid?.length ?? 0) == 4
  }

  function toggleshowRequestValidatingCodeAlert() {
    showRequestValidatingCodeAlert = !showRequestValidatingCodeAlert
  }

  async function RequestPhoneValidation() {
    Stores.Loading.instance.start()
    showRequestValidatingCodeAlert = false
    subscribeObject.phone = subscribeObject.phone
    const response = await requestPhoneValidation(subscribeObject)
    if (response?.success) {
      subscribeObject.signature = response?.data
      canDigitValidationCode = true
      countdownCanRequestCode = false
      countdown = countdownWaitTime
      timer = setInterval(() => {
        countdown--
      }, 1000)
      Stores.MessageAlert.instance.show(
        `Digite o código que você receberá em instantes no seu celular no campo "Código de validação" e clica no botão “CONFIRMAR”`
      )
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  async function ValidatePhoneCode() {
    Stores.Loading.instance.start()
    const response = await validatePhoneValidationCode(subscribeObject)
    if (response?.success) {
      canSubscribe = true
      Stores.MessageAlert.instance.show(
        `O código inserido é correto!, agora é só clicar no botão “CONTINUAR” para finalizar seu cadastro`
      )
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  async function goToTAC() {
    Stores.Navigation.instance.goTo(Routes.tac)
  }

  async function goToPP() {
    Stores.Navigation.instance.goTo(Routes.pp)
  }

  onMount(() => {
    Stores.Loading.instance.stop()
  })

  onDestroy(() => {
    if (timer) {
      clearInterval(timer)
    }
  })

  Stores.Title.instance.set('Cadastro')
</script>

<h2>Por favor informe seu número de telefone cadastrado</h2>
<small>clique em "<b>Solicitar</b>" para solicitar o código de validação</small>
<Views.TextEdit
  type={Types.TTextEdit.PHONE}
  bind:value={subscribeObject.phone}
  buttonName="Solicitar"
  callback={toggleshowRequestValidatingCodeAlert}
  buttonDisabled={!canRequestCode || !countdownCanRequestCode}
  bind:isValid={canRequestCode}
  placeHolder="Número do telefone"
/>
{#if !countdownCanRequestCode}
  <small>Caso não receber o código, espera {countdown} segundos para solicitar um novo!</small>
{/if}
<Views.TextEdit
  type={Types.TTextEdit.NUMBER}
  bind:value={subscribeObject.phoneValidationCode}
  icon={faUnlock}
  mask="_ _ _ _"
  buttonName="Confirmar"
  callback={ValidatePhoneCode}
  buttonDisabled={!isValidationValid}
  disabled={!canDigitValidationCode}
  bind:isValid={isValidationValid}
  validation={validateValidationCode}
  placeHolder="Código de validação"
/>
<Views.Divider />
<Views.Button on:click={doSubscribe} disabled={!canSubscribe}>Confirmar</Views.Button>
<Views.Divider />
<small
  >Ao confirmar você concorda com <a href="#/" on:click={goToTAC}>termos de uso</a>
  e nossa <a on:click={goToTAC} href="#/">politica de privacidade</a></small
>
<Views.GTerms />

{#if showRequestValidatingCodeAlert}
  <Views.Alert
    title="Alerta"
    message={`Verifica se seu número de telefone inserido ${Utils.Strings.formatAsPhone(
      subscribeObject?.phone
    )} está correto para prosseguir`}
    closeCallBack={toggleshowRequestValidatingCodeAlert}
    buttons={[
      {
        name: 'Quero corrigir',
        callback: toggleshowRequestValidatingCodeAlert
      },
      {
        name: 'Está correto',
        callback: RequestPhoneValidation,
        principal: true
      }
    ]}
  />
{/if}
