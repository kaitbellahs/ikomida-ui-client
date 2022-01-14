<script>
  import { Title, Navigation, Routes, Menu } from "../../stores/Navigation";
  import { Views } from "@tian/components";
  import { StatusBar } from "../../stores/Setup";
  import {
    faPhone,
    faUnlock,
  } from "@fortawesome/free-solid-svg-icons";

  let isLoading = false;

  $: styleHeight = $StatusBar.height + 55 + "px";

  async function doSubscribe() {
    isLoading = true;
    const auth = await Auth.doLogin();
    if (auth) login.setLogin(true);
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
  <Views.TextEdit icon={faPhone} type="phone" buttonName="Enviar" />
  <Views.TextEdit icon={faUnlock} mask="X X X X" />
  <div />
  <Views.Button on:click={doSubscribe}>Confirmar</Views.Button>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    min-width: 90%;
    margin: 0 auto;
  }
</style>
