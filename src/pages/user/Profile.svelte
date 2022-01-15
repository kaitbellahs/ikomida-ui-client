<script>
  import { UserInfo } from "../../stores/Auth";
  import { Title } from "../../stores/Navigation";
  import { Views } from "@tian/components";
  import Fa from "svelte-fa";
  import {
    faPlusSquare,
    faMinusSquare,
    faCartPlus,
  } from "@fortawesome/free-solid-svg-icons";
  import { Auth } from "../../stores/Auth";

  function logout() {
    Auth.setToken(null);
  }

  Title.set("Perfil");
</script>

<div class="profil">
  <img src={$UserInfo.avatar} alt={$UserInfo.name} />
  <h2>{$UserInfo.name}</h2>
  <Views.Button type="transparent" on:click={logout}>Logout</Views.Button>
</div>

<style>
  .profil {
    padding-bottom: 50px;
  }
</style>
