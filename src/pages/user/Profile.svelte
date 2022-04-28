<script>
  import { Auth } from "../../stores/Auth";
  import { Title } from "../../stores/Navigation";
  import { Views, Utils } from "@tian/components";
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
  let errorAlert;
  let showAlert = false;
  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  async function editPassword() {
    if (passwordObject.oldPass === null || passwordObject.oldPass.length < 6) {
      toggleErrorAlert("Senha atual invalida!");
      return;
    } else if (
      passwordObject.newPass === null ||
      passwordObject.newPass.length < 6
    ) {
      toggleErrorAlert("A nova senha invalida!");
      return;
    } else if (passwordObject.newPass !== passwordObject.reNewPass) {
      toggleErrorAlert("Senha nova e verifição não confirem");
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

  function logout() {
    Auth.setToken(null);
  }

  onMount(async () => {
    userInfo = await Utils.Jws.extractToken($Auth);
  });

  Title.set("Perfil");
</script>

{#if userInfo}
  <div class="profil">
    <div class="avatar">
      {#if userInfo.avatar}
        <img class="avatarCircle" src={userInfo.avatar} alt={userInfo.name} />
      {:else}
        <div class="avatarCircle">
          {userInfo.name[0]}{userInfo.lastName[0]}
        </div>
      {/if}
    </div>
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
        name="Senha atual:"
        bind:value={passwordObject.oldPass}
        secret={true}
        placeHolder=""
      />
      <Views.TextEdit
        name="Nova senha:"
        bind:value={passwordObject.newPass}
        secret={true}
        placeHolder=""
      />
      <Views.TextEdit
        name="Confirmação:"
        bind:value={passwordObject.reNewPass}
        secret={true}
        placeHolder=""
      />
      <Views.Divider />
    </div>
    <Views.Button on:click={editPassword}>Atualizar senha</Views.Button>
    <Views.Button {Layout} type="transparent" on:click={logout}
      >Logout</Views.Button
    >
  </div>
  <Views.MessageAlert {Layout} object={errorAlert} bind:show={showAlert} />
{/if}
{#if isLoading || !userInfo}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}

<style>
  .profil {
    padding-bottom: 50px;
  }
  .profil > div {
    width: 100%;
  }
  .profil > .avatar {
    margin-top: 20px;
    display: flex;
    align-items: center;
    flex-direction: column;
  }
  /* .profil > div > h2 {
    margin-left: 20px;
  } */
  .profil > .data {
    width: 100%;
    float: left;
    margin-top: 20px;
  }
  .profil > .data > h2 {
    text-align: center;
  }
  .avatarCircle {
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
