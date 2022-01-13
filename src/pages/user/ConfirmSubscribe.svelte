<script>
  import { Title, Navigation, Router } from "../../stores/Navigation";
  import NavigationBar from "../../components/NavigationBar.svelte";
  import TextEdit from "../../components/TextEdit.svelte";
  import Button from "../../components/Button.svelte";
  import { StatusBar } from "../../stores/Setup";
  import {
    faUser,
    faIdCard,
    faPhone,
    faUnlock,
  } from "@fortawesome/free-solid-svg-icons";
  import Loading from "../../components/Loading.svelte";

  let isLoading = false;
  let statusBarInfo = { style: null, visible: true, height: 0 };

  $: styleHeight = $StatusBar.height + 55 + "px";

  async function doSubscribe() {
    isLoading = true;
    const auth = await Auth.doLogin();
    if (auth) login.setLogin(true);
    isLoading = false;
  }

  Title.set("Cadastro");
</script>

<NavigationBar />
{#if isLoading}
  <Loading />
{/if}
<main
  style="padding: 20px; padding-top: {styleHeight}; overflow: hidden;max-width: 100%;"
>
<p>Por favor confirme seu numero de telefone </p>
  <TextEdit icon={faPhone} type="phone" buttonName="Enviar" />
  <TextEdit icon={faUnlock} mask="X X X X" />
  <div />
  <Button on:click={doSubscribe}>Confirmar</Button>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    min-width: 90%;
    margin: 0 auto;
  }
</style>
