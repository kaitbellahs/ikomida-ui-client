<script>
  import { CAPNativeLog } from "capacitor-native-log";
  import { App } from "@capacitor/app";
  import { Auth, PushNotificationToken } from "./stores/Auth";
  import Login from "./pages/user/Login.svelte";
  import ForgotPassword from "./pages/user/ForgotPassword.svelte";
  import Main from "./pages/Main.svelte";
  import Subscribe from "./pages/user/Subscribe.svelte";
  import ConfirmSubscribe from "./pages/user/ConfirmSubscribe.svelte";
  import Tac from "./pages/user/Tac.svelte";
  import { Network } from "@capacitor/network";
  import { onMount } from "svelte";
  import { StatusBar as _StatusBar, Layout, Settings } from "./stores/Setup";
  import { Router, Routes } from "./stores/Navigation";
  import { StatusBar } from "@capacitor/status-bar";
  import { Utils, PushNotification } from "@ikomida/components";
  import { registerPushNotificationToken } from "./network/PushNotification";
  import { getLayout } from "./network/Layout";
  import { GetSettings } from "./network/User";
  import NoService from "./pages/user/NoService.svelte";

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

  async function hasRegisteredCallBack(token, platform) {
    CAPNativeLog.log({ level: "info", message: JSON.stringify(token) });
    const tokenObject = { platform, token };
    PushNotificationToken.setToken(tokenObject);
    await registerPushNotificationToken(tokenObject);
  }

  function pushNotificationReceivedCallBack(notification) {
    CAPNativeLog.log({ level: "info", message: JSON.stringify(notification) });
  }

  function pushNotificationActionPerformedCallBack(notification) {
    CAPNativeLog.log({ level: "info", message: JSON.stringify(notification) });
  }

  let pushNotification = new PushNotification(
    hasRegisteredCallBack,
    pushNotificationReceivedCallBack,
    pushNotificationActionPerformedCallBack
  );

  onMount(async () => {
    let response = await GetSettings();
    if (response?.success && response?.data) {
      Settings.set({ ...$Settings, ...response?.data });
    }
    response = await getLayout();
    if (response?.success && response?.data) {
      Layout.set(response?.data);
    }
    networkStatus = await Network.getStatus();
    if (Capacitor.isNativePlatform()) {
      pushNotification.init();
      const statusBar = await StatusBar.getInfo();
      statusBar.topMargin = statusBar?.topMargin || 0;
      _StatusBar.setStatusBar();
    }
  });
  $: if (networkStatus == null || !networkStatus.connected) {
    const statusBar = $_StatusBar;
    statusBar.topMargin = 20;
    _StatusBar.setStatusBar(statusBar);
  } else {
    const statusBar = $_StatusBar;
    statusBar.topMargin = 0;
    _StatusBar.setStatusBar(statusBar);
  }

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

<!-- {#if !$Settings.isActive}
  <NoService />
{:else if logedIn} -->
{#if logedIn}
  <Main />
{:else if route == Routes.login}
  <Login />
{:else if route == Routes.subscribe}
  <Subscribe />
{:else if route == Routes.forgotPassword}
  <ForgotPassword />
{:else if route == Routes.confirmSubscribe}
  <ConfirmSubscribe />
{:else if route == Routes.tac}
  <Tac />
{:else}
  <Login />
{/if}
{#if networkStatus == null || !networkStatus.connected}
  <div id="internetError">Esperando por conexão a internet...</div>
{/if}

<style>
  #internetError {
    background-color: #b52124;
    color: white;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding-left: 10px;
    padding-right: 10px;
  }
</style>
