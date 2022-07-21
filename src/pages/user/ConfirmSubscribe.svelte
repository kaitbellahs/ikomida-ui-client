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
  import * as AuthNetwork from "../../network/Auth";
  import { Layout } from "../../stores/Setup";
  import { onDestroy } from "svelte";

  const countdownWaitTime = 60;

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
    const response = await AuthNetwork.subscribe(subscribeObject);
    if (response?.success) {
      Navigation.reset(Routes.login);
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  function validateValidationCode(validationValid) {
    return (validationValid?.length || 0) == 4;
  }

  async function requestPhoneValidation() {
    isLoading = true;
    subscribeObject.phone = subscribeObject.phone;
    const response = await AuthNetwork.requestPhoneValidation(subscribeObject);
    if (response?.success) {
      subscribeObject = { ...subscribeObject, signature: response?.data };
      canDigitValidationCode = true;
      countdownCanRequestCode = false;
      countdown = countdownWaitTime;
      timer = setInterval(() => {
        countdown--;
      }, 1000);
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function ValidatePhoneCode() {
    isLoading = true;
    const response = await AuthNetwork.validatePhoneValidationCode(
      subscribeObject
    );
    if (response?.success) {
      canSubscribe = true;
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
  <p>Por favor confirme seu numero de telefone</p>
  <Views.TextEdit
    type="phone"
    bind:rawValue={subscribeObject.phone}
    icon={faPhone}
    buttonName="Enviar"
    callback={requestPhoneValidation}
    buttonDisabled={!canRequestCode || !countdownCanRequestCode}
    bind:isValid={canRequestCode}
  />
  {#if !countdownCanRequestCode}
    <span
      >Caso não receber o codigo, espera {countdown} segundos para solicitar um
      novo!</span
    >
  {/if}
  <Views.TextEdit
    type="number"
    bind:rawValue={subscribeObject.phoneValidationCode}
    icon={faUnlock}
    mask="_ _ _ _"
    buttonName="Confirmar"
    callback={ValidatePhoneCode}
    buttonDisabled={!isValidationValid}
    disabled={!canDigitValidationCode}
    bind:isValid={isValidationValid}
    validation={validateValidationCode}
  />
  <Views.Divider />
  <Views.Button {Layout} on:click={doSubscribe} disabled={!canSubscribe}
    >Confirmar</Views.Button
  >
  <Views.Divider />
  <small>Ao confirmar você concorda com <a href="#/" on:click={goToTAC}>termos de uso</a> e nossa <a on:click={goToTAC} href="#/">politica de privacidade</a></small>
  <Views.MessageAlert {Layout} object={errorAlert} bind:show={showAlert} />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    min-width: 90%;
    margin: 0 auto;
  }
</style>
