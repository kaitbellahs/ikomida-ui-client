<script>
  import { Views, Utils, Stores } from "@ikomida/components";
  import { onMount } from "svelte";
  import { StatusBar, Layout } from "../../stores/Setup";
  import { updatePassword, logout } from "../../network/Auth";

  let userInfo;
  let auth;

  let isLoading = true;

  let passwordObject = {
    oldPass: null,
    newPass: null,
    reNewPass: null,
  };
  let passwordValidationObject = {
    newPass: false,
    reNewPass: false,
  };
  let errorAlert;
  let showAlert = false;

  $: if (userInfo?.avatar) {
    // update()
  }

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  async function out() {
    isLoading = true;
    await logout();
    isLoading = false;
  }

  async function editPassword() {
    if (!passwordValidationObject.newPass) {
      toggleErrorAlert("A nova senha não está correta!");
      return;
    } else if (!passwordValidationObject.reNewPass) {
      toggleErrorAlert("A confirmação da senha não está correta");
      return;
    }
    isLoading = true;
    let response = await updatePassword(passwordObject);
    if (response.success) {
      toggleErrorAlert("Senha atualizada com sucesso!");
    } else {
      toggleErrorAlert(response?.data);
      isLoading = false;
      return;
    }
    isLoading = false;
  }

  onMount(async () => {
    auth = await Stores.Auth.instance.store();
    userInfo = await Utils.Jws.extractToken($auth);
    isLoading = false;
  });

  Stores.Title.instance.set("Perfil");
</script>

{#if userInfo}
  <Views.UploadablePhoto
    {Layout}
    type="profile"
    image={userInfo?.avatar}
    name={userInfo.name[0]}
    lastName={userInfo.lastName[0]}
  />
  <Views.Divider />
  <div class="data" style="--color:{$Layout?.button?.background ?? '#4c0708'};">
    <h2 class="name">{userInfo.name} {userInfo.lastName}</h2>
    <Views.Divider />
    <Views.TextValue
      {Layout}
      text="CPF:"
      value={Utils?.Strings?.formatString(
        /\d/gi,
        "___.___.___-__",
        "_",
        userInfo?.identity
      )}
      fontSize="1.3em"
      leftMargin="30"
    />
    <Views.TextValue
      {Layout}
      text="Telefone:"
      value={Utils?.Strings?.formatString(
        /\d/gi,
        "(__) _____-____",
        "_",
        userInfo?.phone
      )}
      fontSize="1.3em"
      leftMargin="30"
    />
    <Views.TextValue
      {Layout}
      text="mail:"
      value={userInfo.email}
      fontSize="1.3em"
      leftMargin="30"
    />
    <Views.Divider />
    <h2>Senha</h2>
    <Views.TextEdit
      {Layout}
      type="password"
      placeHolder="Senha atual"
      bind:value={passwordObject.oldPass}
    />
    <Views.TextEdit
      {Layout}
      type="password"
      placeHolder="Nova senha"
      bind:value={passwordObject.newPass}
      bind:isValid={passwordValidationObject.newPass}
      error="A senha deve ter um tamanho entre 8 e 40 caracteres e contendo no mínimo
        uma letra maiúscula, uma letra minúscula, um número e um símbolo"
    />
    <Views.TextEdit
      {Layout}
      type="password"
      placeHolder="Confirmação"
      bind:value={passwordObject.reNewPass}
      bind:isValid={passwordValidationObject.reNewPass}
      validation={(password) => passwordObject.newPass === password}
      error="A confirmação da senha não é válida"
    />
    <Views.Divider />
  </div>
  <Views.Button on:click={editPassword}>Atualizar senha</Views.Button>
  <Views.Button {Layout} type="transparent" on:click={out}>Logout</Views.Button>
  <Views.GTerms />
  <Views.MessageAlert {Layout} object={errorAlert} bind:show={showAlert} />
{/if}
{#if isLoading || !userInfo}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}

<style>
  h2 {
    text-align: center;
  }
  h2.name {
    color: var(--color);
  }
</style>
