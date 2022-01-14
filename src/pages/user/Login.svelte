<script>
  import { login } from "../../stores/Auth";
  import * as Auth from "../../network/Auth";
  import { Views } from "@tian/components";
  import { Routes, Navigation } from "../../stores/Navigation";
  import { faPhone, faUnlock } from "@fortawesome/free-solid-svg-icons";

  let isLoading = false;

  async function doSubscribe() {
    Navigation.goTo(Routes.subscribe);
  }

  async function doLogin() {
    isLoading = true;
    const auth = await Auth.doLogin();
    if (auth) login.setLogin(true);
    isLoading = false;
  }
</script>

{#if isLoading}
  <Views.Loading />
{/if}
<main>
  <h1>Login!</h1>
  <p>
    Se você ainda não abriu sua conta <Views.Button
      type="transparent"
      on:click={doSubscribe}>clica aqui</Views.Button
    > e rápido e facil.
  </p>
  <Views.TextEdit icon={faPhone} placeHolder="(55) 90000-0000" />
  <Views.TextEdit icon={faUnlock} placeHolder="Senha" />
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
