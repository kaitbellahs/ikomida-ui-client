<script>
  import { onMount } from "svelte";
  import { App } from "@capacitor/app";
  import { Network } from "@capacitor/network";
  import { StatusBar } from "@ikomida/capacitor-plugin-status-bar";
  import {
    Utils,
    PushNotification,
    Views,
    Network as iKomidaNetwork,
    Stores,
  } from "@ikomida/components";

  import { StatusBar as _StatusBar, Layout, Settings } from "./stores/Setup";
  import Routes from "./stores/Routes";

  import { registerPushNotificationToken } from "./network/PushNotification";
  import { getLayout } from "./network/Layout";
  import { GetSettings } from "./network/User";

  import Login from "./pages/unlogged/Login.svelte";
  import ForgotPassword from "./pages/unlogged/ForgotPassword.svelte";
  import Subscribe from "./pages/unlogged/Subscribe.svelte";
  import ConfirmSubscribe from "./pages/unlogged/ConfirmSubscribe.svelte";
  import Tac from "./pages/unlogged/Tac.svelte";
  import Pp from "./pages/unlogged/Pp.svelte";
  import NoService from "./pages/unlogged/NoService.svelte";
  import LaunchScreen from "./pages/unlogged/LaunchScreen.svelte";
  import Main from "./pages/Main.svelte";

  let networkStatus = null;
  let showNotificationPopup = false;
  let notificationIds = [];
  let logedIn = false;
  let notificationPopup = {
    title: null,
    body: null,
    buttons: [],
  };
  let auth;
  let router = Stores.Navigation.instance.router;

  $: route = $router.route;

  $: isActive = $Settings?.isActive ?? true;

  $: if ($auth && isActive) {
    logedIn = false;
    Utils.Jws.extractToken($auth).then((token) => {
      logedIn = token !== null;
    });
  } else {
    logedIn = false;
  }

  $: if (networkStatus == null || !networkStatus.connected) {
    const statusBar = $_StatusBar;
    statusBar.topMargin = 20;
    _StatusBar.setStatusBar(statusBar);
  } else {
    const statusBar = $_StatusBar;
    statusBar.topMargin = 0;
    _StatusBar.setStatusBar(statusBar);
  }

  function togglePushNotificationPopup() {
    showNotificationPopup = !showNotificationPopup;
  }

  const checkAppLaunchUrl = async () => {
    const { url } = await App.getLaunchUrl();

    alert("App opened with URL: " + url);
  };

  async function hasRegisteredCallBack(token, platform) {
    const tokenObject = { platform, token };
    Stores.PushNotificationToken.setToken(tokenObject);
    const response = await registerPushNotificationToken(tokenObject);
  }

  async function hasErrorCallBack(error) {
    //TODO: -- handle and report error
    console.log({ level: "error", message: JSON.stringify(error) });
  }

  async function permissionStatus(permissionStatus) {
    //TODO: -- handle and report permissions
    console.log({
      level: "info",
      message: `permissionStatusObject: ${JSON.stringify(permissionStatus)}`,
    });
  }

  function receivedCallBack(notification) {
    console.log({ level: "info", message: JSON.stringify(notification) });
    if (
      !notificationIds.includes(notification?.id) &&
      (logedIn || !((notification?.data?.logon ?? "true") === "true"))
    ) {
      notificationIds.push(notification?.id);
      notificationPopup.title = notification?.title;
      notificationPopup.body = notification?.body;
      notificationPopup.buttons = [
        {
          name: "Fechar",
          callback: togglePushNotificationPopup,
        },
      ];
      if (notification?.data?.uri) {
        notificationPopup?.buttons?.push({
          name: "Abrir",
          callback: () => {
            showNotificationPopup = false;
            openNotification(notification);
          },
          principal: true,
        });
      }
      notificationPopup = notificationPopup;
      console.log({ level: "info", message: "Inside" });
      togglePushNotificationPopup();
    }
  }

  function actionPerformedCallBack(notification) {
    console.log({ level: "info", message: JSON.stringify(notification) });
    openNotification(notification?.notification);
  }

  async function openNotification(notification) {
    if (logedIn) {
      if (["/order/", "/orders/"].includes(notification?.data?.uri)) {
        await iKomidaNetwork.instance.clearCache(Stores.Cache.Types.ORDERS);
        Stores.Navigation.instance.goTo(Routes.orders, false);
      }
    }
  }

  let pushNotification = new PushNotification(
    hasRegisteredCallBack,
    receivedCallBack,
    actionPerformedCallBack,
    hasErrorCallBack,
    permissionStatus
  );

  onMount(async () => {
    auth = await Stores.Auth.instance.store();
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
      statusBar.topMargin = statusBar?.topMargin ?? 0;
      _StatusBar.setStatusBar(statusBar);
    }
  });

  Network.addListener("networkStatusChange", (status) => {
    networkStatus = status;
  });
</script>

<Views.LoadJS
  url="https://www.google.com/recaptcha/api.js?render=6LebYzshAAAAAIXhka3WrAjus5tDXtefR1QefVZS"
/>
{#if !$Settings || $Settings?.isActive === null}
  <LaunchScreen />
{:else if !isActive}
  <NoService />
{:else if logedIn}
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
{:else if route == Routes.pp}
  <Pp />
{:else}
  <Login />
{/if}
{#if networkStatus == null || !networkStatus.connected}
  <div id="internetError">Esperando por conexão a internet...</div>
{/if}
{#if showNotificationPopup}
  <Views.Alert
    title={notificationPopup?.title}
    message={notificationPopup?.body}
    closeCallBack={togglePushNotificationPopup}
    buttons={notificationPopup?.buttons}
  />
{/if}

<style>
  #internetError {
    background-color: #4c0708;
    color: white;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding-left: 10px;
    padding-right: 10px;
  }
  :global(.grecaptcha-badge) {
    visibility: hidden;
  }
</style>
