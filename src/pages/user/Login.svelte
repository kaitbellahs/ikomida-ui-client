<script>
  import { Auth } from "../../stores/Auth";
  import * as AuthNetwork from "../../network/Auth";
  import { Views } from "@tian/components";
  import { Routes, Navigation } from "../../stores/Navigation";
  import { faPhone, faUnlock } from "@fortawesome/free-solid-svg-icons";
  import { Utils } from "@tian/components";

  let isLoading = false;
  let cell = "11953635016";
  let initialValue = "(11) 95363-5016";
  let password = "123456";
  let showAlert = false;
  let errorMessage = "";
  let validPhone = false;
  let validPassword = false;

  $: canLogin = validPhone && validPassword;

  async function doSubscribe() {
    Navigation.goTo(Routes.subscribe);
  }

  async function doLogin() {
    isLoading = true;
    const response = await AuthNetwork.doLogin("55" + cell, password);
    if (response.success) {
      const token = await Utils.Jws.extractToken(response.data);
      if (token !== null) {
        Auth.setToken(response.data);
      } else {
        errorMessage = "Token não é valido";
        showAlert = true;
      }
    } else {
      errorMessage = response.message;
      showAlert = true;
    }
    isLoading = false;
  }

  function toggleAlert() {
    showAlert = !showAlert;
  }
</script>

{#if isLoading}
  <Views.Loading />
{/if}
<main>
  {#if showAlert}
    <Views.Alert
      title="Alerta"
      message={errorMessage}
      closeCallBack={toggleAlert}
      buttons={[{ name: "OK!", callback: toggleAlert, principal: true }]}
    />
  {/if}
  <h1>Login!</h1>
  <p>
    Se você ainda não abriu sua conta <Views.Button
      type="transparent"
      on:click={doSubscribe}>clica aqui</Views.Button
    > e rápido e facil.
  </p>
  <Views.TextEdit
    bind:rawValue={cell}
    bind:value={initialValue}
    icon={faPhone}
    type="phone"
    placeHolder="Numero de celular"
    bind:isValid={validPhone}
  />
  <Views.TextEdit
    bind:value={password}
    icon={faUnlock}
    placeHolder="Senha"
    secret={true}
    bind:isValid={validPassword}
    type="password"
  />
  <div />
  <Views.Button on:click={doLogin} disabled={!canLogin}>Entrar</Views.Button>
  <Views.Button type="transparent" on:click={doSubscribe}
    >Criar conta</Views.Button
  >
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    min-width: 90%;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
  main > p,
  main > div {
    margin-bottom: 30px;
  }
</style>
