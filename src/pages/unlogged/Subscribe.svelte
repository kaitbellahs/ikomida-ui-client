<script lang="ts">
  import Routes from '../../stores/Routes';
  import { Views, Stores, Types } from '@ikomida/shared-frontend';
  import { StatusBar } from '../../stores/Setup';
  import { faUser } from '@fortawesome/free-solid-svg-icons';
  import { onMount } from 'svelte';

  const Layout = Stores.Layout.instance.store;

  let subscribeObject: Types.Classes.CUser = Types.Classes.CUser.fillWith(null);

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
    Stores.Loading.instance.stop();
  });

  Stores.Title.instance.set('Criar conta');
</script>

<Views.NavigationBar paddingTop={$StatusBar.height} />

<main
  style="margin-top:{styleHeight};padding: 20px; padding-top: 0; padding-bottom: 0; overflow: hidden;max-width: 100%;background: {$Layout.background};height: 100%;"
>
  <Views.TextEdit
    icon={faUser}
    bind:value={subscribeObject.name}
    initialValue={subscribeObject.name}
    type={Types.TTextEdit.NAME}
    placeHolder="Nome"
  />
  <Views.TextEdit
    icon={faUser}
    bind:value={subscribeObject.lastName}
    initialValue={subscribeObject.lastName}
    type={Types.TTextEdit.NAME}
    placeHolder="Sobre nome"
  />
  <Views.TextEdit
    bind:value={subscribeObject.identity}
    type={Types.TTextEdit.CPF}
    placeHolder="CPF"
    bind:isValid={isValidCPF}
  />
  <Views.TextEdit
    type={Types.TTextEdit.EMAIL}
    bind:value={subscribeObject.email}
    placeHolder="E-mail"
    bind:isValid={isValidEmail}
  />
  <Views.TextEdit
    type={Types.TTextEdit.PASSWORD}
    bind:value={subscribeObject.password}
    placeHolder="Senha"
    bind:isValid={isValidPassword}
    error="A senha deve ter um tamanho entre 8 e 40 caracteres e contendo no mínimo
  uma letra maiúscula, uma letra minúscula, um número e um símbolo"
  />
  <Views.Divider />
  <Views.Button disabled={!canContinue} on:click={doSubscribe}>Cadastrar</Views.Button>
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
