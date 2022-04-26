<script>
  import { Title, Navigation, Routes, Menu } from "../../stores/Navigation";
  import { Views } from "@tian/components";
  import { StatusBar, Layout } from "../../stores/Setup";
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
    identity: null,
    email: null,
    password: null,
  };
  // let subscribeObject = {
  //   name: "khalid",
  //   lastName: "Ait Bellahs",
  //   cpf: null,
  //   email: "aitbellahs@gmail.com",
  //   password: "123456",
  // };
  let isValidCPF = false;
  let isValidEmail = false;
  let isValidPassword = false;

  $: styleHeight = `${Number($StatusBar.height) + 50}px`;
  $: canContinue =
  subscribeObject?.name && (subscribeObject?.name?.length || 0) <= 255 &&
    subscribeObject?.lastName && (subscribeObject?.lastName?.length || 0) <= 255 &&
    isValidCPF &&
    isValidEmail && (subscribeObject?.email?.length || 0) <= 255 &&
    isValidPassword;

  async function doSubscribe() {
    Navigation.goTo(Routes.confirmSubscribe, subscribeObject);
  }

  Title.set("Cadastro");
</script>

<Views.NavigationBar
  {Layout}
  {Menu}
  {Title}
  paddingTop={$StatusBar.height}
  {Navigation}
/>
{#if isLoading}
  <Views.Loading />
{/if}
<main
  style="margin-top:{styleHeight};padding: 20px; padding-top: 0; padding-bottom: 0; overflow: hidden;max-width: 100%;background: {$Layout.background};height: 100%;"
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
    bind:rawValue={subscribeObject.identity}
    type="cpf"
    placeHolder="CPF"
    bind:isValid={isValidCPF}
  />
  <Views.TextEdit
    type="email"
    icon={faPhone}
    bind:value={subscribeObject.email}
    placeHolder="E-mail"
    bind:isValid={isValidEmail}
  />
  <Views.TextEdit
    type="password"
    icon={faUnlock}
    bind:value={subscribeObject.password}
    placeHolder="Senha"
    secret={true}
    bind:isValid={isValidPassword}
  />
  <Views.Divider />
  <Views.Button {Layout} disabled={!canContinue} on:click={doSubscribe}
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
