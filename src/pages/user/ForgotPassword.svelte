<script>
  import {
    Title,
    Navigation,
    Routes,
    Menu,
  } from "../../stores/Navigation";
  import { Views } from "@tian/components";
  import { StatusBar } from "../../stores/Setup";
  import { faPhone, faUnlock } from "@fortawesome/free-solid-svg-icons";
  import {
    requestPasswordPhoneValidation,
    validatePasswordPhoneValidationCode,
    requestPassword,
  } from "../../network/Auth";
  import { Layout } from "../../stores/Setup";

  let isLoading = false;
  let requestPasswordObject = {
    phone: null,
    phoneValidationCode: null,
    signature: null,
    areaCode: 55,
  };
  let canDigitValidationCode = false;
  let canRequestPassword = false;
  let canRequestCode = false;
  let isValidationValid = false;
  let errorAlert;
  let showAlert = false;
  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  $: styleHeight = `${Number($StatusBar.height) + 50}px`;

  function validateValidationCode(validationValid) {
    return validationValid.length == 4;
  }

  async function requestNewPassword() {
    isLoading = true;
    const response = await requestPassword(requestPasswordObject);
    if (response?.success) {
      Navigation.reset(Routes.login);
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function requestPhoneValidation() {
    isLoading = true;
    requestPasswordObject.phone = requestPasswordObject.phone;
    const response = await requestPasswordPhoneValidation(
      requestPasswordObject
    );
    if (response?.success) {
      requestPasswordObject = {
        ...requestPasswordObject,
        signature: response?.data,
      };
      canDigitValidationCode = true;
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function ValidatePhoneCode() {
    isLoading = true;
    const response = await validatePasswordPhoneValidationCode(
      requestPasswordObject
    );
    if (response?.success) {
      canRequestPassword = true;
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  Title.set("Recuperar senha");
</script>

<main
  style="margin-top:{styleHeight};padding: 20px; padding-top: 0; padding-bottom: 0; overflow: hidden;max-width: 100%; background: {$Layout.background};height: 100%;"
>
  <Views.Divider />
  <h2>Por favor enforma seu numero de telefone cadastrado</h2>
  <Views.TextEdit
    type="phone"
    bind:rawValue={requestPasswordObject.phone}
    icon={faPhone}
    buttonName="Enviar"
    callback={requestPhoneValidation}
    buttonDisabled={!canRequestCode}
    bind:isValid={canRequestCode}
    name="Numero do telefone"
  />
  <Views.Divider />
  <Views.TextEdit
    type="number"
    bind:rawValue={requestPasswordObject.phoneValidationCode}
    icon={faUnlock}
    mask="_ _ _ _"
    buttonName="Confirmar"
    callback={ValidatePhoneCode}
    buttonDisabled={!isValidationValid}
    disabled={!canDigitValidationCode}
    bind:isValid={isValidationValid}
    validation={validateValidationCode}
    name="Codigo de validação"
  />
  <Views.Divider />
  <Views.Divider />
  <Views.Button
    {Layout}
    on:click={requestNewPassword}
    disabled={!canRequestPassword}>Solicitar nova senha</Views.Button
  >
  <Views.MessageAlert {Layout} object={errorAlert} bind:show={showAlert} />
</main>

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

<style>
  main {
    padding: 1em;
    min-width: 90%;
    margin: 0 auto;
  }
  main > h2 {
    text-align: center;
  }
</style>
