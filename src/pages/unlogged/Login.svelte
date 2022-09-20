<script lang="ts">
  import * as AuthNetwork from '../../network/Auth';
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend';
  import Routes from '../../stores/Routes';
  import { faPhone, faUnlock } from '@fortawesome/free-solid-svg-icons';
  import { registerPushNotificationToken } from '../../network/PushNotification';
  import { Settings } from '../../stores/Setup';
  import { onMount } from 'svelte';

  let pushNotificationToken = Stores.PushNotificationToken.instance?.store;
  let Layout = Stores.Layout.instance?.store;

  let phone: string;
  let password: string;
  let isValidPhone = false;
  let showImage = true;

  $: canLogin = isValidPhone;

  async function doSubscribe() {
    Stores.Navigation.instance.goTo(Routes.subscribe);
  }

  async function forgotPassword() {
    Stores.Navigation.instance.goTo(Routes.forgotPassword);
  }

  async function doLogin() {
    Stores.Loading.instance.start();
    const response = await AuthNetwork.doLogin('55', phone, password);
    if (response?.success) {
      const token = await Utils.Jws.extractToken(response?.data);
      if (token !== null) {
        await Stores.Auth.Auth.instance.setToken(response?.data);
        if ($pushNotificationToken) {
          await registerPushNotificationToken($pushNotificationToken);
        }
        Stores.Navigation.instance.reset(Routes.home);
      } else {
        Stores.MessageAlert.instance.show('O token de acesso não é válido');
      }
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
    Stores.Loading.instance.stop();
  }

  function erroLoadImage() {
    showImage = false;
  }

  onMount(() => {
    Stores.Loading.instance.stop();
  });
</script>

<main style="background: {$Layout.background};height: 100%;">
  <div class="avatar">
    {#if $Settings?.profile?.mainPicture && showImage}
      <img
        on:error={erroLoadImage}
        src={$Settings?.profile?.mainPicture ?? 'assets/icons/transparent-logo-1.svg'}
        alt={$Settings?.profile?.contractName ?? 'iKomida'}
      />
    {:else if $Settings?.profile?.contractName}
      <div class="avatarCircle">
        {$Settings?.profile?.contractName?.[0]}{$Settings?.profile?.contractName?.[1]}
      </div>
      <h2>{$Settings?.profile?.contractName}</h2>
    {:else}
      <img src="assets/icons/transparent-logo-1.svg" alt="iKomida" />
      <h2>{$Settings?.profile?.contractName}</h2>
    {/if}
  </div>
  <h3>
    Se você ainda não tem uma conta, <span on:click={doSubscribe} style="color: #4c0708;">clique aqui</span> é rápido e fácil.
  </h3>
  <Views.TextEdit
    bind:value={phone}
    icon={faPhone}
    type={Types.TTextEdit.PHONE}
    placeHolder="Número de celular"
    bind:isValid={isValidPhone}
  />
  <Views.TextEdit bind:value={password} icon={faUnlock} placeHolder="Senha" type={Types.TTextEdit.PASSWORD} />
  <div />
  <Views.Button on:click={doLogin} disabled={!canLogin}>Entrar</Views.Button>
  <Views.Button type="transparent" on:click={doSubscribe}>Criar conta</Views.Button>
  <Views.Button type="transparent" on:click={forgotPassword}>Recuperar a senha</Views.Button>
  <Views.GTerms />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    min-width: 90%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    place-content: center;
  }

  main > div {
    margin-bottom: 30px;
  }
  .avatar {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
  }
  .avatar > img {
    font-size: 3em;
    width: 100%;
    max-width: 500px;
    border-radius: 40px;
    height: 210px;
    line-height: 90px;
    overflow: hidden;
    object-fit: contain;
  }
  .avatar > .avatarCircle {
    font-size: 3em;
    height: 90px;
    width: 90px;
    background: #ccc;
    border-radius: 45px;
    float: left;
    line-height: 90px;
    text-align: center;
    vertical-align: middle;
    display: table-cell;
    overflow: hidden;
    margin-right: 10px;
  }
</style>
