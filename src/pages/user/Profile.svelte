<script>
  import { Auth } from "../../stores/Auth";
  import { Title } from "../../stores/Navigation";
  import { Views, Utils, Network } from "@ikomida/components";
  import { onMount } from "svelte";
  import { StatusBar, Layout } from "../../stores/Setup";
  import { updatePassword } from "../../network/Auth";

  let userInfo;
  let isLoading = false;

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

  async function logout() {
    Auth.setToken(null);
    await Network.instance.clearAllCache();
  }

  onMount(async () => {
    userInfo = await Utils.Jws.extractToken($Auth);
  });

  Title.set("Perfil");
</script>

{#if userInfo}
  <Views.UploadablePhoto
    type="profile"
    image={userInfo?.avatar}
    name={userInfo.name[0]}
    lastName={userInfo.lastName[0]}
  />
  <Views.Divider />
  <div class="data">
    <h2>{userInfo.name} {userInfo.lastName}</h2>
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
      type="password"
      placeHolder="Senha atual"
      bind:value={passwordObject.oldPass}
    />
    <Views.TextEdit
      type="password"
      placeHolder="Nova senha"
      bind:value={passwordObject.newPass}
      bind:isValid={passwordValidationObject.newPass}
      error="A senha deve ter um tamanho entre 8 e 40 caracteres e contendo no mínimo
        uma letra maiúscula, uma letra minúscula, um número e um símbolo"
    />
    <Views.TextEdit
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
  <Views.Button {Layout} type="transparent" on:click={logout}
    >Logout</Views.Button
  >
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
</style>
