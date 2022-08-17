<script>
  import { Auth, PushNotificationToken } from "../../stores/Auth";
  import * as AuthNetwork from "../../network/Auth";
  import { Views } from "@ikomida/components";
  import { Routes, Navigation } from "../../stores/Navigation";
  import { faPhone, faUnlock } from "@fortawesome/free-solid-svg-icons";
  import { Utils } from "@ikomida/components";
  import { registerPushNotificationToken } from "../../network/PushNotification";
  import { Layout, Settings } from "../../stores/Setup";

  let isLoading = false;
  let phone;
  let password;
  let isValidPhone = false;
  let showImage = true;

  $: canLogin = isValidPhone;
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
        toggleErrorAlert("O token de acesso não é válido");
      }
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  function erroLoadImage(event) {
    showImage = false;
  }
</script>

{#if isLoading}
  <Views.Loading />
{/if}
<main style="background: {$Layout.background};height: 100%;">
  <div class="avatar">
    {#if $Settings?.profile?.mainPicture && showImage}
      <img
        on:error={erroLoadImage}
        src={$Settings?.profile?.mainPicture ??
          "assets/icons/transparent-logo-1.svg"}
        alt={$Settings?.profile?.restaurantName ?? "iKomida"}
      />
    {:else if $Settings?.profile?.restaurantName}
      <div class="avatarCircle">
        {$Settings?.profile?.restaurantName?.[0]}{$Settings?.profile
          ?.restaurantName?.[1]}
      </div>
      <h2>{$Settings?.profile?.restaurantName}</h2>
    {:else}
      <img src="assets/icons/transparent-logo-1.svg" alt="iKomida" />
      <h2>{$Settings?.profile?.restaurantName}</h2>
    {/if}
  </div>
  <h3>
    Se você ainda não tem uma conta, <span
      on:click={doSubscribe}
      style="color: #4c0708;">clique aqui</span
    > é rápido e fácil.
  </h3>
  <Views.TextEdit
    {Layout}
    bind:value={phone}
    icon={faPhone}
    type="phone"
    placeHolder="Número de celular"
    bind:isValid={isValidPhone}
  />
  <Views.TextEdit
    {Layout}
    bind:value={password}
    icon={faUnlock}
    placeHolder="Senha"
    secret={true}
    type="password"
  />
  <div />
  <Views.Button {Layout} on:click={doLogin} disabled={!canLogin}
    >Entrar</Views.Button
  >
  <Views.Button {Layout} type="transparent" on:click={doSubscribe}
    >Criar conta</Views.Button
  >
  <Views.Button {Layout} type="transparent" on:click={forgotPassword}
    >Recuperar a senha</Views.Button
  >
  <Views.GTerms />
  <Views.MessageAlert {Layout} object={errorAlert} bind:show={showAlert} />
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
  }
  .avatar > img {
    font-size: 3em;
    width: 100%;
    max-width: 100%;
    border-radius: 45px;
    line-height: 90px;
    vertical-align: middle;
    display: table-cell;
    border-radius: 50px;
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
