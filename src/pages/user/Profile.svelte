<script>
  import { Auth } from "../../stores/Auth";
  import { Title } from "../../stores/Navigation";
  import { Views } from "@tian/components";
  import { onMount } from "svelte";
  import { StatusBar } from "../../stores/Setup";
  import { Utils } from "@tian/components";

  let userInfot;

  onMount(
    async () => {
      userInfot = await Utils.Jws.extractToken($Auth);
    }
  );
  
  function logout() {
    Auth.setToken(null);
  }

  Title.set("Perfil");
</script>

{#if userInfot}
  <div class="profil">
    <div>
      {#if userInfot.avatar}
        <img class="avatarCircle" src={userInfot.avatar} alt={userInfot.name} />
      {:else}
        <div class="avatarCircle">
          {userInfot.name[0]}{userInfot.lastName[0]}
        </div>
      {/if}
      <h2>{userInfot.name} {userInfot.lastName}</h2>
    </div>
    <div class="data">
      <Views.TextValue text="CPF:" value={userInfot.cpf} fontSize="1.5em" />
      <Views.TextValue
        text="Telefone:"
        value={userInfot.phone}
        fontSize="1.5em"
      />
      <Views.TextValue text="mail:" value={userInfot.email} fontSize="1.5em" />
    </div>
    <!-- <Views.Button type="transparent" on:click={logout}>Atualizar</Views.Button> -->
    <Views.Button type="transparent" on:click={logout}>Logout</Views.Button>
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
