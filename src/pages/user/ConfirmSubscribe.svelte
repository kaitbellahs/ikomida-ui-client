<script>
  import {
    Title,
    Navigation,
    Routes,
    Menu,
    Router,
  } from "../../stores/Navigation";
  import { Views, Utils } from "@tian/components";
  import { StatusBar } from "../../stores/Setup";
  import { faPhone, faUnlock } from "@fortawesome/free-solid-svg-icons";
  import * as AuthNetwork from "../../network/Auth";

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
  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  $: styleHeight = $StatusBar.height + 55 + "px";

  function validateValidationCode(validationValid) {
    return validationValid.length == 4;
  }

  async function doSubscribe() {
    isLoading = true;
    const response = await AuthNetwork.subscribe(subscribeObject);
    if (response?.success) {
      Navigation.reset(Routes.login);
    }else{
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function requestPhoneValidation() {
    isLoading = true;
    subscribeObject.phone = subscribeObject.phone;
    const response = await AuthNetwork.requestPhoneValidation(subscribeObject);
    if (response?.success) {
      subscribeObject = { ...subscribeObject, ...response?.data };
      canDigitValidationCode = true;
    }else{
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function ValidatePhoneCode() {
    isLoading = true;
    const response = await AuthNetwork.ValidatePhoneValidationCode(
      subscribeObject
    );
    if (response?.success) {
      canSubscribe = true;
    }else{
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  Title.set("Cadastro");
</script>

<Views.NavigationBar
  {Menu}
  {Title}
  paddingTop={$StatusBar.height}
  {Navigation}
/>
{#if isLoading}
  <Views.Loading />
{/if}
<main
  style="padding: 20px; padding-top: {styleHeight}; overflow: hidden;max-width: 100%;"
>
  <p>Por favor confirme seu numero de telefone</p>
  <Views.TextEdit
    type="phone"
    bind:rawValue={subscribeObject.phone}
    icon={faPhone}
    buttonName="Enviar"
    callback={requestPhoneValidation}
    buttonDisabled={!canRequestCode}
    bind:isValid={canRequestCode}
  />
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
  <Views.Button on:click={doSubscribe} disabled={!canSubscribe}
    >Confirmar</Views.Button
  >
  <Views.MessageAlert object={errorAlert} bind:show={showAlert} />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    min-width: 90%;
    margin: 0 auto;
  }
</style>
