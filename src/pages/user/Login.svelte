<script>
  import { login } from "../../stores/Auth";
  import * as Auth from "../../network/Auth";
  import TextEdit from "../../components/TextEdit.svelte";
  import Button from "../../components/Button.svelte";
  import Loading from "../../components/Loading.svelte";
  import {Router, Navigation} from '../../stores/Navigation';
  import { faPhone, faUnlock } from "@fortawesome/free-solid-svg-icons";

  let isLoading = false;

  async function doSubscribe() {
    Navigation.goTo(Router.values.subscribe);
  }
  
  async function doLogin() {
    isLoading = true;
    const auth = await Auth.doLogin();
    if(auth)
    login.setLogin(true);
    isLoading = false;
  }
</script>

{#if isLoading}
<Loading />
{/if}
<main>
  <h1>Login!</h1>
  <p>
    Se você ainda não abriu sua conta <a href="#" on:click={doSubscribe}>clica aqui</a> e rápido e facil.
  </p>
  <TextEdit icon={faPhone} placeHolder="(55) 90000-0000" />
  <TextEdit icon={faUnlock} placeHolder="Senha" />
  <div></div>
  <Button on:click={doLogin}>Entrar</Button>
  <Button type="transparent" on:click={doSubscribe}>Criar conta</Button>
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
  main > p, main > div {
    margin-bottom: 30px;
  }
</style>
