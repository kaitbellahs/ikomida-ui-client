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

  let isLoading = false;
  let subscribeObject = {
    ...Utils.Objects.copy($Router.options),
    ...{ phone: null, phoneCodeValidation: null, validationSignature: null },
  };
  let isValid = true;

  $: styleHeight = $StatusBar.height + 55 + "px";
  $: canRequestCode =
    subscribeObject.phone && subscribeObject.phone.length == 11;
  $: canValidateCode =
    subscribeObject.phoneCodeValidation &&
    subscribeObject.phoneCodeValidation.length == 4;

  async function doSubscribe() {
    console.log(JSON.stringify(subscribeObject));
    console.log(subscribeObject.phone.length);
    // isLoading = true;
    // const auth = await Auth.doLogin();
    // if (auth) login.setLogin(true);
    // isLoading = false;
  }

  async function requestPhoneValidation() {}

  async function ValidatePhoneCode() {}

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
  />
  <Views.TextEdit
    type="number"
    bind:rawValue={subscribeObject.phoneCodeValidation}
    icon={faUnlock}
    mask="_ _ _ _"
    buttonName="Confirmar"
    callback={ValidatePhoneCode}
    buttonDisabled={!canValidateCode}
  />
  <Views.Divider />
  <Views.Button disabled={!isValid} on:click={doSubscribe}
    >Confirmar</Views.Button
  >
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    min-width: 90%;
    margin: 0 auto;
  }
</style>
