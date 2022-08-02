<script>
  import {
    Title,
    Navigation,
    Routes,
    Menu,
    Router,
  } from "../../stores/Navigation";
  import { Views, Utils } from "@ikomida/components";
  import { StatusBar } from "../../stores/Setup";
  import { faPhone, faUnlock } from "@fortawesome/free-solid-svg-icons";
  import {
    requestPhoneValidation,
    validatePhoneValidationCode,
    subscribe,
  } from "../../network/Auth";
  import { getTermOfUse } from "../../network/Terms";
  import { Layout } from "../../stores/Setup";
  import { onDestroy, onMount } from "svelte";

  const countdownWaitTime = 60;

  let showRequestValidatingCodeAlert = false;
  let isLoading = false;
  let subscribeObject = {
    ...Utils.Objects.copy($Router.options),
    ...{ phone: null, phoneValidationCode: null, signature: null },
    areaCode: 55,
  };
  let canDigitValidationCode = false;
  let canSubscribe = false;
  let canRequestCode = false;
  let isValidationValid = false;
  let errorAlert;
  let showAlert = false;
  let timer = null;
  let countdownCanRequestCode = true;
  let countdown = 0;
  let callbackId;

  $: if (countdown === 0) {
    if (timer) {
      clearInterval(timer);
    }
    countdownCanRequestCode = true;
    countdown = countdownWaitTime;
  }

  $: styleHeight = `${Number($StatusBar.height) + 50}px`;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  async function doSubscribe() {
    isLoading = true;
    const response = await subscribe(subscribeObject);
    if (response?.success) {
      callbackId = "doSubscribe";
      toggleErrorAlert(
        "Seu cadastro foi concluído com sucesso, agora é só você usar seu número de telefone como usuário e sua senha para acessar a área logada e usufruir dos nossos produtos e serviços."
      );
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  function closeCallBack() {
    if (callbackId === "doSubscribe") {
      callbackId = null;
      Navigation.reset(Routes.login);
    }
  }

  function validateValidationCode(validationValid) {
    return (validationValid?.length ?? 0) == 4;
  }

  function toggleshowRequestValidatingCodeAlert() {
    showRequestValidatingCodeAlert = !showRequestValidatingCodeAlert;
  }

  async function RequestPhoneValidation() {
    isLoading = true;
    showRequestValidatingCodeAlert = false;
    subscribeObject.phone = subscribeObject.phone;
    const response = await requestPhoneValidation(subscribeObject);
    if (response?.success) {
      subscribeObject = { ...subscribeObject, signature: response?.data };
      canDigitValidationCode = true;
      countdownCanRequestCode = false;
      countdown = countdownWaitTime;
      timer = setInterval(() => {
        countdown--;
      }, 1000);
      toggleErrorAlert(
        `Digite o código que você receberá em instantes no seu celular no campo "Código de validação" e clica no botão “CONFIRMAR”`
      );
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function ValidatePhoneCode() {
    isLoading = true;
    const response = await validatePhoneValidationCode(subscribeObject);
    if (response?.success) {
      canSubscribe = true;
      toggleErrorAlert(
        `O código inserido é correto!, agora é só clicar no botão “CONTINUAR” para finalizar seu cadastro`
      );
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function goToTAC() {
    Navigation.goTo(Routes.tac);
  }

  async function goToPP() {
    Navigation.goTo(Routes.pp);
  }

  onMount(async () => {
    const term = await getTermOfUse();
    if (term) {
      subscribeObject.termId = term?.id;
    }
  });

  onDestroy(() => {
    if (timer) {
      clearInterval(timer);
    }
  });

  Title.set("Cadastro");
</script>

<Views.NavigationBar
  {Layout}
  {Menu}
  {Title}
  paddingTop={$StatusBar.height}
  {Navigation}
/>
{#if isLoading}
  <Views.Loading />
{/if}
<main
  style="margin-top:{styleHeight};padding: 20px; padding-top: 0; padding-bottom: 0; overflow: hidden;max-width: 100%; background: {$Layout.background};height: 100%;"
>
  <h2>Por favor informe seu número de telefone cadastrado</h2>
  <small
    >clique em "<b>Solicitar</b>" para solicitar o código de validação</small
  >
  <Views.TextEdit
    type="phone"
    bind:value={subscribeObject.phone}
    buttonName="Solicitar"
    callback={toggleshowRequestValidatingCodeAlert}
    buttonDisabled={!canRequestCode || !countdownCanRequestCode}
    bind:isValid={canRequestCode}
    placeHolder="Número do telefone"
  />
  {#if !countdownCanRequestCode}
    <small
      >Caso não receber o código, espera {countdown} segundos para solicitar um novo!</small
    >
  {/if}
  <Views.TextEdit
    type="number"
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
  <Views.Button {Layout} on:click={doSubscribe} disabled={!canSubscribe}
    >Confirmar</Views.Button
  >
  <Views.Divider />
  <small
    >Ao confirmar você concorda com <a href="#/" on:click={goToTAC}
      >termos de uso</a
    >
    e nossa <a on:click={goToTAC} href="#/">politica de privacidade</a></small
  >
  <Views.GTerms />
  <Views.MessageAlert
    {closeCallBack}
    {Layout}
    object={errorAlert}
    bind:show={showAlert}
  />

  {#if showRequestValidatingCodeAlert}
    <Views.Alert
      title="Alerta"
      message={`Verifica se seu número de telefone inserido ${Utils.Strings.formatAsPhone(
        subscribeObject?.phone
      )} está correto para prosseguir`}
      closeCallBack={toggleshowRequestValidatingCodeAlert}
      buttons={[
        {
          name: "Quero corrigir",
          callback: toggleshowRequestValidatingCodeAlert,
        },
        {
          name: "Está correto",
          callback: RequestPhoneValidation,
          principal: true,
        },
      ]}
    />
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    min-width: 90%;
    margin: 0 auto;
  }
</style>
