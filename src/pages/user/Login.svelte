<script>
  import { Auth, PushNotificationToken } from "../../stores/Auth";
  import * as AuthNetwork from "../../network/Auth";
  import { Views } from "@tian/components";
  import { Routes, Navigation } from "../../stores/Navigation";
  import { faPhone, faUnlock } from "@fortawesome/free-solid-svg-icons";
  import { Utils } from "@tian/components";
  import { registerPushNotificationToken } from "../../network/PushNotification";
  import { Layout, Settings } from "../../stores/Setup";

  let isLoading = false;
  let phone = "11953635016";
  let initialValue = "(11) 95363-5016";
  let password = "123456";
  let isValidPassword = false;
  let isValidPhone = false;

  $: canLogin = isValidPhone && isValidPhone;
  let errorAlert;
  let showAlert = false;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  async function doSubscribe() {
    Navigation.goTo(Routes.subscribe);
  }

  async function forgotPassword() {
    Navigation.goTo(Routes.forgotPassword);
  }

  async function doLogin() {
    isLoading = true;
    const response = await AuthNetwork.doLogin(55, phone, password);
    if (response?.success) {
      const token = await Utils.Jws.extractToken(response?.data);
      if (token !== null) {
        Auth.setToken(response?.data);
        if ($PushNotificationToken && $PushNotificationToken !== {}) {
          await registerPushNotificationToken($PushNotificationToken);
        }
        Navigation.reset(Routes.home);
      } else {
        toggleErrorAlert("Token não é valido");
      }
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }
</script>

{#if isLoading}
  <Views.Loading />
{/if}
<main style="background: {$Layout.background};height: 100%;">
  <div class="avatar">
    {#if $Settings?.profile?.mainPicture}
      <img
        src={$Settings?.profile?.mainPicture}
        alt={$Settings?.profile?.restaurantName}
      />
    {:else}
      <div class="avatarCircle">
        {$Settings?.profile?.restaurantName?.[0]}{$Settings?.profile
          ?.restaurantName?.[1]}
      </div>
      <h2>{$Settings?.profile?.restaurantName}</h2>
    {/if}
  </div>
  <h3>
    Se você ainda não abriu sua conta, <span
      on:click={doSubscribe}
      style="color:red;">clique aqui</span
    > é rápido e fácil.
  </h3>
  <Views.TextEdit
    bind:rawValue={phone}
    bind:value={initialValue}
    icon={faPhone}
    type="phone"
    placeHolder="Numero de celular"
    bind:isValid={isValidPhone}
  />
  <Views.TextEdit
    bind:value={password}
    icon={faUnlock}
    placeHolder="Senha"
    secret={true}
    type="password"
    bind:isValid={isValidPassword}
  />
  <div />
  <Views.Button {Layout} on:click={doLogin} disabled={!canLogin}
    >Entrar</Views.Button
  >
  <Views.Button {Layout} type="transparent" on:click={doSubscribe}
    >Criar conta</Views.Button
  >
  <Views.Button {Layout} type="transparent" on:click={forgotPassword}
    >Esqueci minha senha</Views.Button
  >
  <Views.MessageAlert {Layout} object={errorAlert} bind:show={showAlert} />
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
  main > p,
  main > div {
    margin-bottom: 30px;
  }
  .avatar {
    display: flex;
    align-items: center;
    flex-direction: column;
  }
  .avatar > img {
    font-size: 3em;
    width: 100%;
    max-width: 100%;
    border-radius: 45px;
    line-height: 90px;
    vertical-align: middle;
    display: table-cell;
    overflow: hidden;
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
