<script>
  import { App } from "@capacitor/app";
  import { login } from "./stores/Auth";
  import Login from "./pages/user/Login.svelte";
  import Main from "./pages/Main.svelte";
  import Subscribe from "./pages/user/Subscribe.svelte";
  import ConfirmSubscribe from "./pages/user/ConfirmSubscribe.svelte";
  import Tac from "./pages/user/Tac.svelte";
  import { Network } from "@capacitor/network";
  import { onMount } from "svelte";
  import { Router } from "./stores/Navigation";
  import { StatusBar as _StatusBar } from "./stores/Setup";
  import { StatusBar } from "@capacitor/status-bar";

  let networkStatus = null;

  $: route = $Router.route;

  const checkAppLaunchUrl = async () => {
    const { url } = await App.getLaunchUrl();

    alert("App opened with URL: " + url);
  };

  onMount(async () => {
    networkStatus = await Network.getStatus();
    if (Capacitor.isNativePlatform()) {
      _StatusBar.setStatusBar(await StatusBar.getInfo());
    }
  });

  Network.addListener("networkStatusChange", (status) => {
    networkStatus = status;
    console.log("Network status changed", status);
  });
  App.addListener("appStateChange", ({ isActive }) => {
    console.log("App state changed. Is active?", isActive);
  });

  App.addListener("appUrlOpen", (data) => {
    console.log("App opened with URL:", data);
  });

  App.addListener("appRestoredResult", (data) => {
    console.log("Restored state:", data);
  });
</script>

{#if networkStatus == null || !networkStatus.connected}
  <div id="internetError">Esperando por conexão a internet...</div>
{/if}

{#if $login}
  <Main />
{:else if route == Router.values.login}
  <Login />
{:else if route == Router.values.subscribe}
  <Subscribe />
{:else if route == Router.values.confirmSubscribe}
  <ConfirmSubscribe />
{:else if route == Router.values.tac}
  <Tac />
{:else}
  <Login />
{/if}

<style>
  #internetError {
    background-color: red;
    color: white;
  }
</style>
