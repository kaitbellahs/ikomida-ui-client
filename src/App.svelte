<script>
  import {CAPNativeLog} from 'capacitor-native-log';
  import { App } from "@capacitor/app";
  import { Auth, PushNotificationToken } from "./stores/Auth";
  import Login from "./pages/user/Login.svelte";
  import Main from "./pages/Main.svelte";
  import Subscribe from "./pages/user/Subscribe.svelte";
  import ConfirmSubscribe from "./pages/user/ConfirmSubscribe.svelte";
  import Tac from "./pages/user/Tac.svelte";
  import { Network } from "@capacitor/network";
  import { onMount } from "svelte";
  import { StatusBar as _StatusBar } from "./stores/Setup";
  import { Router, Routes } from "./stores/Navigation";
  import { StatusBar } from "@capacitor/status-bar";
  import { Utils, PushNotification } from "@tian/components";
  import {registerPushNotificationToken} from "./network/PushNotification";

  let networkStatus = null;

  $: route = $Router.route;

  let logedIn = false;

  $: if ($Auth) {
    logedIn = false;
    Utils.Jws.extractToken($Auth).then((token) => {
      logedIn = token !== null;
    });
  } else {
    logedIn = false;
  }

  const checkAppLaunchUrl = async () => {
    const { url } = await App.getLaunchUrl();

    alert("App opened with URL: " + url);
  };

  async function hasRegisteredCallBack(token, platform){
    CAPNativeLog.log({ level: 'info', message: JSON.stringify(token) });
  const tokenObject = {platform, token}
  PushNotificationToken.setToken(tokenObject);
  await registerPushNotificationToken(tokenObject);
  }

  function pushNotificationReceivedCallBack(notification){
    CAPNativeLog.log({ level: 'info', message: JSON.stringify(notification) });
  }

  function pushNotificationActionPerformedCallBack(notification){
    CAPNativeLog.log({ level: 'info', message: JSON.stringify(notification) });
  }
  
  let pushNotification = new PushNotification(hasRegisteredCallBack, pushNotificationReceivedCallBack, pushNotificationActionPerformedCallBack);
  pushNotification.init();

  onMount(async () => {
    networkStatus = await Network.getStatus();
    if (Capacitor.isNativePlatform()) {
      _StatusBar.setStatusBar(await StatusBar.getInfo());
    }
  });

  Network.addListener("networkStatusChange", (status) => {
    networkStatus = status;
  });
  // App.addListener("appStateChange", ({ isActive }) => {
  //   console.log("App state changed. Is active?", isActive);
  // });

  // App.addListener("appUrlOpen", (data) => {
  //   console.log("App opened with URL:", data);
  // });

  // App.addListener("appRestoredResult", (data) => {
  //   console.log("Restored state:", data);
  // });
</script>

{#if networkStatus == null || !networkStatus.connected}
  <div id="internetError">Esperando por conexão a internet...</div>
{/if}
{#if logedIn}
  <Main />
{:else if route == Routes.login}
  <Login />
{:else if route == Routes.subscribe}
  <Subscribe />
{:else if route == Routes.confirmSubscribe}
  <ConfirmSubscribe />
{:else if route == Routes.tac}
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
