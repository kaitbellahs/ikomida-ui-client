<script>
  import Routes from "../../stores/Routes";
  import { Views, Stores } from "@ikomida/components";
  import { StatusBar, Layout } from "../../stores/Setup";
  import { faUser } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";

  let isLoading = true;
  let subscribeObject = {
    name: null,
    lastName: null,
    identity: null,
    email: null,
    password: null,
  };

  let isValidCPF = false;
  let isValidEmail = false;
  let isValidPassword = false;

  $: styleHeight = `${Number($StatusBar.height) + 50}px`;
  $: canContinue =
    subscribeObject?.name &&
    (subscribeObject?.name?.length ?? 0) <= 255 &&
    subscribeObject?.lastName &&
    (subscribeObject?.lastName?.length ?? 0) <= 255 &&
    isValidCPF &&
    isValidEmail &&
    (subscribeObject?.email?.length ?? 0) <= 255 &&
    isValidPassword;

  async function doSubscribe() {
    Stores.Navigation.instance.goTo(Routes.confirmSubscribe, subscribeObject);
  }

  onMount(() => {
    isLoading = false;
  });

  Stores.Title.instance.set("Criar conta");
</script>

<Views.NavigationBar {Layout} paddingTop={$StatusBar.height} />
{#if isLoading}
  <Views.Loading />
{/if}
<main
  style="margin-top:{styleHeight};padding: 20px; padding-top: 0; padding-bottom: 0; overflow: hidden;max-width: 100%;background: {$Layout.background};height: 100%;"
>
  <Views.TextEdit
    {Layout}
    icon={faUser}
    bind:value={subscribeObject.name}
    initialValue={subscribeObject.name}
    type="name"
    placeHolder="Nome"
  />
  <Views.TextEdit
    {Layout}
    icon={faUser}
    bind:value={subscribeObject.lastName}
    initialValue={subscribeObject.lastName}
    type="name"
    placeHolder="Sobre nome"
  />
  <Views.TextEdit
    {Layout}
    bind:value={subscribeObject.identity}
    type="cpf"
    placeHolder="CPF"
    bind:isValid={isValidCPF}
  />
  <Views.TextEdit
    {Layout}
    type="email"
    bind:value={subscribeObject.email}
    placeHolder="E-mail"
    bind:isValid={isValidEmail}
  />
  <Views.TextEdit
    {Layout}
    type="password"
    bind:value={subscribeObject.password}
    placeHolder="Senha"
    secret={true}
    bind:isValid={isValidPassword}
    error="A senha deve ter um tamanho entre 8 e 40 caracteres e contendo no mínimo
  uma letra maiúscula, uma letra minúscula, um número e um símbolo"
  />
  <Views.Divider />
  <Views.Button {Layout} disabled={!canContinue} on:click={doSubscribe}
    >Cadastrar</Views.Button
  >
  <Views.Divider />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    min-width: 90%;
    margin: 0 auto;
  }
</style>
