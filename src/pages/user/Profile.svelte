<script>
  import { Auth } from "../../stores/Auth";
  import { Title } from "../../stores/Navigation";
  import { Views, Utils } from "@tian/components";
  import { onMount } from "svelte";
  import { StatusBar, Layout } from "../../stores/Setup";

  let userInfo;

  onMount(async () => {
    userInfo = await Utils.Jws.extractToken($Auth);
  });

  function logout() {
    Auth.setToken(null);
  }

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
