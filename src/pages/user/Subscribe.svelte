<script>
  import { Title, Navigation, Routes, Menu } from "../../stores/Navigation";
  import { Views } from "@tian/components";
  import { StatusBar } from "../../stores/Setup";
  import {
    faUser,
    faIdCard,
    faPhone,
    faUnlock,
  } from "@fortawesome/free-solid-svg-icons";

  let isLoading = false;
  let subscribeObject = {
    name: null,
    lastName: null,
    cpf: null,
    email: null,
    password: null,
  };

  $: styleHeight = $StatusBar.height + 55 + "px";
  $: canContinue =
    subscribeObject.name &&
    subscribeObject.lastName &&
    subscribeObject.cpf &&
    subscribeObject.name &&
    subscribeObject.password;

  async function doSubscribe() {
    Navigation.goTo(Routes.confirmSubscribe, subscribeObject);
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
  <Views.TextEdit
    icon={faUser}
    bind:value={subscribeObject.name}
    type="name"
    placeHolder="Nome"
  />
  <Views.TextEdit
    icon={faUser}
    bind:value={subscribeObject.lastName}
    type="name"
    placeHolder="Sobre nome"
  />
  <Views.TextEdit
    icon={faIdCard}
    bind:rawValue={subscribeObject.cpf}
    type="cpf"
    placeHolder="CPF"
  />
  <Views.TextEdit
    icon={faPhone}
    bind:value={subscribeObject.email}
    placeHolder="E-mail"
  />
  <Views.TextEdit
    icon={faUnlock}
    bind:value={subscribeObject.password}
    placeHolder="Senha"
    secret={true}
  />
  <Views.Divider />
  <Views.Button disabled={!canContinue} on:click={doSubscribe}
    >Cadastrar</Views.Button
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
