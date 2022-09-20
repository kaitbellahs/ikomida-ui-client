<script lang="ts">
  import { onMount } from 'svelte';
  import { Network } from '@capacitor/network';
  import { StatusBar } from '@ikomida/capacitor-plugin-status-bar';
  import { StatusBar as _StatusBar, Settings } from './stores/Setup';
  import type { StatusBarType } from './stores/Setup';
  import Routes from './stores/Routes';
  import { registerPushNotificationToken } from './network/PushNotification';
  import { getLayout } from './network/Layout';
  import { GetSettings } from './network/User';
  import Login from './pages/unlogged/Login.svelte';
  import ForgotPassword from './pages/unlogged/ForgotPassword.svelte';
  import Subscribe from './pages/unlogged/Subscribe.svelte';
  import ConfirmSubscribe from './pages/unlogged/ConfirmSubscribe.svelte';
  import Tac from './pages/unlogged/Tac.svelte';
  import Pp from './pages/unlogged/Pp.svelte';
  import NoService from './pages/unlogged/NoService.svelte';
  import LaunchScreen from './pages/unlogged/LaunchScreen.svelte';
  import Main from './pages/Main.svelte';
  import type { ConnectionStatus } from '@capacitor/network';
  import { Utils, Views, Network as iKomidaNetwork, Stores, Types } from '@ikomida/shared-frontend';
  import { Capacitor } from '@capacitor/core';
  import type { IAlertButton } from '@ikomida/shared-frontend/lib/components/Alert.svelte';

  let auth: Stores.Auth.IStore;
  let router = Stores.Navigation.instance.router;
  let notificationIds: string[] = [];
  let networkStatus: ConnectionStatus | null = null;
  let notificationPopup = {
    title: '',
    body: '',
    buttons: [] as IAlertButton[],
  };
  let showNotificationPopup = false;
  let logedIn = false;
  let isActive = false;
  $: route = $router.route;
  $: if ($auth && isActive) {
    logedIn = false;
    Utils.Jws.extractToken($auth).then(async (token) => {
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

  async function hasRegisteredCallBack(token: string, platform: string) {
    const tokenObject: Types.Classes.CRegisterPushNotification = Types.Classes.CRegisterPushNotification.fromObject({
      platform,
      token,
    });
    Stores.PushNotificationToken.instance.setToken(token);
    await registerPushNotificationToken(tokenObject);
  }

  async function hasErrorCallBack(error: any) {
    //TODO: -- handle and report error
    console.log({ level: 'error', message: JSON.stringify(error) });
  }

  async function permissionStatus(permissionStatus: any) {
    //TODO: -- handle and report permissions
    console.log({
      level: 'info',
      message: `permissionStatusObject: ${JSON.stringify(permissionStatus)}`,
    });
  }

  function receivedCallBack(notification: Types.Classes.CNotificationPayload) {
    console.log({ level: 'info', message: JSON.stringify(notification) });
    if (
      notification?.id &&
      !notificationIds.includes(notification?.id) &&
      (logedIn || !((notification?.data?.logon ?? 'true') === 'true'))
    ) {
      notificationIds.push(notification?.id);
      notificationPopup.title = notification?.title ?? '';
      notificationPopup.body = notification?.body ?? '';
      notificationPopup.buttons = [
        {
          name: 'Fechar',
          callback: togglePushNotificationPopup,
          principal: false,
        },
      ];
      if (notification?.data?.uri) {
        notificationPopup?.buttons?.push({
          name: 'Abrir',
          callback: () => {
            showNotificationPopup = false;
            openNotification(notification);
          },
          principal: true,
        });
      }
      notificationPopup = notificationPopup;
      console.log({ level: 'info', message: 'Inside' });
      togglePushNotificationPopup();
    }
  }

  function actionPerformedCallBack(notification: Types.Classes.CNotificationPayload) {
    console.log({ level: 'info', message: JSON.stringify(notification) });
    if (notification?.notification) {
      openNotification(notification?.notification);
    }
  }

  async function openNotification(notification: Types.Classes.CNotificationPayload) {
    if (logedIn) {
      if (notification?.data?.uri && ['/order/', '/orders/'].includes(notification?.data?.uri)) {
        await iKomidaNetwork.instance?.clearCache(Stores.Cache.Types.ORDERS);
        Stores.Navigation.instance.goTo(Routes.orders, false);
      }
    }
  }

  let pushNotification = new Utils.PushNotification(
    hasRegisteredCallBack,
    receivedCallBack,
    actionPerformedCallBack,
    hasErrorCallBack,
    permissionStatus,
  );

  onMount(async () => {
    auth = await Stores.Auth.Auth.instance.store();
    let response = await GetSettings();
    if (response?.success && response?.data) {
      Settings.set({ ...$Settings, ...response?.data });
      isActive = $Settings?.isActive ?? true;
    }
    response = await getLayout();
    if (response?.success && response?.data) {
      Stores.Layout.instance.set(response?.data);
    }
    networkStatus = await Network.getStatus();
    if (Capacitor.isNativePlatform()) {
      pushNotification.init();
      const statusBar = (await StatusBar.getInfo()) as StatusBarType;
      statusBar.topMargin = statusBar?.topMargin ?? 0;
      _StatusBar.setStatusBar(statusBar);
    }
  });

  Network.addListener('networkStatusChange', (status) => {
    networkStatus = status;
  });

  // App.addListener('appUrlOpen', (data) => {
  //   Stores.Navigation.instance.goTo(Routes.settings, {
  //     callback: true,
  //     ...data,
  //   });
  // });
</script>

<Views.LoadJS url="https://www.google.com/recaptcha/api.js?render=6LebYzshAAAAAIXhka3WrAjus5tDXtefR1QefVZS" />
{#if !isActive}
  <LaunchScreen />
{:else if !isActive}
  <NoService />
{:else if logedIn}
  <Main />
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
<Views.LoadJS url="https://www.google.com/recaptcha/api.js?render=6LebYzshAAAAAIXhka3WrAjus5tDXtefR1QefVZS" />
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
<Views.Loading topPadding={$_StatusBar.height} bottomPadding={$_StatusBar.bottomPadding} />
<Views.MessageAlert />

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
