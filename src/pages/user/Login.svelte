<script>
  import { Auth } from "../../stores/Auth";
  import * as AuthNetwork from "../../network/Auth";
  import { Views } from "@tian/components";
  import { Routes, Navigation } from "../../stores/Navigation";
  import { faPhone, faUnlock } from "@fortawesome/free-solid-svg-icons";

  let isLoading = false;
  let cell = "";
  let password = "";
  let showAlert = false;
  let errorMessage = '';


  async function doSubscribe() {
    Navigation.goTo(Routes.subscribe);
  }

  async function doLogin() {
    isLoading = true;
    const response = await AuthNetwork.doLogin("55"+cell, password);
    if (response.success) {
      Auth.setToken(response.token);
    }else{
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
    buttons={[
      { name: "OK!", callback: toggleAlert, principal: true },
    ]}
  />
{/if}
  <h1>Login!</h1>
  <p>
    Se você ainda não abriu sua conta <Views.Button
      type="transparent"
      on:click={doSubscribe}>clica aqui</Views.Button
    > e rápido e facil.
  </p>
  <Views.TextEdit bind:rawValue={cell} icon={faPhone} mask="(XX) XXXXX-XXXX" placeHolder="Numero de celular" />
  <Views.TextEdit bind:value={password} icon={faUnlock} placeHolder="Senha" />
  <div />
  <Views.Button on:click={doLogin}>Entrar</Views.Button>
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
