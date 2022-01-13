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

  $: styleHeight = $StatusBar.height + 55 + "px";

  async function doSubscribe() {
    Navigation.goTo(Router.values.confirmSubscribe);
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
<TextEdit icon={faUser} placeHolder="Nome" />
<TextEdit icon={faUser} placeHolder="Sobre nome completo" />
  <TextEdit icon={faIdCard} type="cpf" placeHolder="CPF" />
  <TextEdit icon={faPhone} placeHolder="Email" />
  <TextEdit icon={faUnlock} placeHolder="Senha" />
  <div />
  <Button on:click={doSubscribe}>Cadastrar</Button>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    min-width: 90%;
    margin: 0 auto;
  }
</style>
