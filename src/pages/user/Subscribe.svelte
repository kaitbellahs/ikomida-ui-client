<script>
  import { Title, Navigation, Router, Menu } from "../../stores/Navigation";
  import {Views} from "@tian/components";
  import { StatusBar } from "../../stores/Setup";
  import {
    faUser,
    faIdCard,
    faPhone,
    faUnlock,
  } from "@fortawesome/free-solid-svg-icons";

  let isLoading = false;

  $: styleHeight = $StatusBar.height + 55 + "px";

  async function doSubscribe() {
    Navigation.goTo(Router.values.confirmSubscribe);
  }

  Title.set("Cadastro");
</script>

<Views.NavigationBar {Menu} {Title} paddingTop={$StatusBar.height} {Navigation}  />
{#if isLoading}
  <Views.Loading />
{/if}
<main
  style="padding: 20px; padding-top: {styleHeight}; overflow: hidden;max-width: 100%;"
>
<Views.TextEdit icon={faUser} placeHolder="Nome" />
<Views.TextEdit icon={faUser} placeHolder="Sobre nome completo" />
  <Views.TextEdit icon={faIdCard} type="cpf" placeHolder="CPF" />
  <Views.TextEdit icon={faPhone} placeHolder="Email" />
  <Views.TextEdit icon={faUnlock} placeHolder="Senha" />
  <div />
  <Views.Button on:click={doSubscribe}>Cadastrar</Views.Button>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    min-width: 90%;
    margin: 0 auto;
  }
</style>
