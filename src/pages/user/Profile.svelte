<script>
  import { Auth } from "../../stores/Auth";
  import { Title } from "../../stores/Navigation";
  import { Views, Utils } from "@tian/components";
  import { onMount } from "svelte";
  import { StatusBar, Layout } from "../../stores/Setup";
  import { updatePassword } from "../../network/Auth";

  let userInfo;

  let passwordObject = {
    oldPass: null,
    newPass: null,
    reNewPass: null,
  };

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
    <div>
      {#if userInfo.avatar}
        <img class="avatarCircle" src={userInfo.avatar} alt={userInfo.name} />
      {:else}
        <div class="avatarCircle">
          {userInfo.name[0]}{userInfo.lastName[0]}
        </div>
      {/if}
      <h2>{userInfo.name} {userInfo.lastName}</h2>
    </div>
    <div class="data">
      <Views.TextValue
        {Layout}
        text="CPF:"
        value={userInfo.cpf}
        fontSize="1.5em"
      />
      <Views.TextValue
        {Layout}
        text="Telefone:"
        value={userInfo.phone}
        fontSize="1.5em"
      />
      <Views.TextValue
        {Layout}
        text="mail:"
        value={userInfo.email}
        fontSize="1.5em"
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
      <Views.Button on:click={editPassword}>Atualizar senha</Views.Button>
    </div>
    <!-- <Views.Button type="transparent" on:click={logout}>Atualizar</Views.Button> -->
    <Views.Button {Layout} type="transparent" on:click={logout}
      >Logout</Views.Button
    >
  </div>
{:else}
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
  .profil > div > h2 {
    margin-left: 20px;
  }
  .profil > .data {
    width: 100%;
    float: left;
    margin-top: 20px;
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
