<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { Network } from '@capacitor/network'
  import { StatusBar } from '@ikomida/capacitor-plugin-status-bar'
  import { StatusBar as _StatusBar, Settings } from './stores/Setup'
  import type { StatusBarType } from './stores/Setup'
  import Routes from './stores/Routes'
  import { Cart as CartStore } from './stores/Cart'
  import { registerPushNotificationToken } from './network/PushNotification'
  import { getLayout } from './network/Layout'
  import { GetSettings } from './network/User'
  import ForgotPassword from './pages/unlogged/ForgotPassword.svelte'
  import Subscribe from './pages/unlogged/Subscribe.svelte'
  import ConfirmSubscribe from './pages/unlogged/ConfirmSubscribe.svelte'
  import Tac from './pages/unlogged/Tac.svelte'
  import Pp from './pages/unlogged/Pp.svelte'
  import NoService from './pages/unlogged/NoService.svelte'
  import LaunchScreen from './pages/unlogged/LaunchScreen.svelte'
  import Main from './pages/Main.svelte'
  import type { ConnectionStatus } from '@capacitor/network'
  import { Utils, Views, Network as iKomidaNetwork, Stores, Types, Logics } from '@ikomida/shared-frontend'
  import { Capacitor } from '@capacitor/core'
  import type { IAlertButton } from '@ikomida/shared-frontend/lib/components/Alert.svelte'
  import { getOrder } from './network/Orders'
  import {
    faHome,
    faList,
    faUser,
    faSearch,
    faMoneyBill1Wave,
    faAddressCard,
    faHourglass,
    faPhone,
    faRocket
  } from '@fortawesome/free-solid-svg-icons'
  import BusinessHours from './pages/user/BusinessHours.svelte'
  import Home from './pages/products/Home.svelte'
  import Search from './pages/products/Search.svelte'
  import Product from './pages/products/Product.svelte'
  import Contact from './pages/unlogged/Contact.svelte'
  import type { IStore } from './stores/Cart'
  import Cart from './pages/cart/Cart.svelte'
  import { Classes } from '@ikomida/shared-types'
  import { Writable } from 'svelte/store'

  let initialazation = true
  let logedIn = false
  let Store: IStore
  let auth: Stores.Auth.IStore
  let router = Stores.Navigation.instance.router
  let notificationIds: string[] = []
  let networkStatus: ConnectionStatus | null = null
  let cache: Stores.Cache = Stores.Cache.instance
  let network: Stores.Navigation = Stores.Navigation.instance
  let notificationPopup = {
    title: '',
    body: '',
    buttons: [] as IAlertButton[]
  }
  let showNotificationPopup = false
  let isActive = true

  const Layout: Writable<Classes.CLayout | undefined> = Stores.Layout.instance?.store
  let style: HTMLElement

  $: if (style)
    if (showCart) {
      style.innerHTML = `
        main {
          --backgroundColor: ${$Layout?.background ?? 'rgb(223, 223, 223)'};
          --paddingTop: ${styleHeight};
          --paddingBottom: 128pt;
        }
      `
      document.head.appendChild(style)
    } else {
      style.innerHTML = `
        main {
          --backgroundColor: ${$Layout?.background ?? 'rgb(223, 223, 223)'};
          --paddingTop: ${styleHeight};
          --paddingBottom: 64pt;
        }
      `
    }

  $: styleHeight = `${Number($_StatusBar.height + ($_StatusBar.topMargin ?? 0)) + 48}pt`
  $: route = $router.route
  $: if ($auth) {
    Utils.Jws.extractToken($auth).then(async token => {
      logedIn = token !== null
    })
  } else if (!$auth && logedIn) {
    logedIn = false
  }

  $: if (!networkStatus?.connected) {
    const statusBar = $_StatusBar
    statusBar.topMargin = 22
    _StatusBar.setStatusBar(statusBar)
  } else {
    const statusBar = $_StatusBar
    statusBar.topMargin = 0
    _StatusBar.setStatusBar(statusBar)
  }
  $: optionsTotal = () => {
    const totalOptionsArray =
      $Store?.map(product => {
        let calcTotal = 0
        for (const option of product?.options ?? []) {
          calcTotal +=
            product.quantity *
            option.units *
            (option.price - Logics.Finances.calcDiscount(option.price, product.discount, product.discountType))
        }
        return calcTotal
      }) ?? []
    return (totalOptionsArray?.length ?? 0) > 0 ? totalOptionsArray.reduce((a, b) => a + b) : 0
  }

  $: subtotalArray = [
    ...($Store?.map(
      product =>
        product.quantity *
        (product?.price - Logics.Finances.calcDiscount(product.price, product.discount, product.discountType))
    ) ?? []),
    optionsTotal()
  ]

  $: subtotal = subtotalArray.length > 0 ? subtotalArray.reduce((a, b) => a + b) : 0
  $: delivery = 0
  $: total = subtotal + delivery
  $: showCart =
    ($Store?.length ?? 0) > 0 &&
    route !== Routes.cart &&
    route !== Routes.product &&
    route !== Routes.checkout &&
    route !== Routes.orders &&
    route !== Routes.order &&
    route !== Routes.newAddress &&
    route !== Routes.newMethod &&
    route !== Routes.profile

  function goToCart() {
    Stores.Navigation.instance.goTo(Routes.cart)
  }

  async function togglePushNotificationPopup() {
    await tick()
    showNotificationPopup = !showNotificationPopup
  }

  async function hasRegisteredCallBack(token: string, platform: string) {
    const tokenObject: Types.Classes.CRegisterPushNotification = Types.Classes.CRegisterPushNotification.fromObject({
      platform,
      token
    })
    Stores.PushNotificationToken.instance.setToken(token)
    await registerPushNotificationToken(tokenObject)
  }

  async function hasErrorCallBack(error: any) {
    //TODO: -- handle and report error
    console.log({ level: 'error', message: JSON.stringify(error) })
  }

  async function permissionStatus(permissionStatus: any) {
    //TODO: -- handle and report permissions
    console.log({
      level: 'info',
      message: `permissionStatusObject: ${JSON.stringify(permissionStatus)}`
    })
  }

  async function receivedCallBack(notification: Types.Classes.CNotificationPayload, go = false) {
    if (
      notification?.id &&
      !notificationIds.includes(notification?.id) &&
      (logedIn || (notification?.data?.logon ?? 'true') !== 'true')
    ) {
      notificationIds.push(notification?.id)
      notificationPopup.title = notification?.title ?? ''
      notificationPopup.body = notification?.body ?? ''
      notificationPopup.buttons = [
        {
          name: 'Fechar',
          callback: togglePushNotificationPopup,
          principal: notification?.data?.uri ? false : true
        }
      ]
      if (notification?.data?.uri) {
        notificationPopup?.buttons?.push({
          name: 'Abrir',
          callback: () => {
            showNotificationPopup = false
            openNotification(notification)
          },
          principal: true
        })
      }
      if (notification?.data?.uri && ['/vendorNotification/'].includes(notification?.data?.uri)) {
        await iKomidaNetwork.instance?.clearCache(Stores.Cache.Types.PUSH_NOTIFICATIONS)
        if (route == Routes.pushNotifications || go) {
          if (route == Routes.pushNotifications) {
            network.reset(Routes.home)
            Stores.Loading.instance.reset()
          }
          await tick()
          network.goTo(Routes.pushNotifications)
        } else {
          togglePushNotificationPopup()
        }
      } else if (notification?.data?.uri && ['/order/', '/orders/'].includes(notification?.data?.uri)) {
        const response = await getOrder(notification.data.payload)
        let order: Types.Classes.COrder | undefined = undefined
        if (response?.success) {
          order = Types.Classes.COrder.fromObject(response?.data)
        }
        let cachedOrders: Types.Classes.COrder[] =
          Types.Classes.COrder.fromObject(cache.getObject(Stores.Cache.Types.ORDERS)) ?? []
        if (order) {
          const cachedOrder = cachedOrders.filter(cachedOrder => cachedOrder.id === order?.id)?.[0]
          if (cachedOrder) {
            const orderIndex = cachedOrders.indexOf(cachedOrder)
            cachedOrders[orderIndex] = order
          } else {
            cachedOrders.push(order)
            cachedOrders = cachedOrders.sort((i1, i2) => (i2.timestamp ?? 0) - (i1.timestamp ?? 0))
          }
          cache.setObject(Stores.Cache.Types.ORDERS, cachedOrders)
          if (route == Routes.order || go) {
            if (route == Routes.order) {
              network.reset(Routes.orders)
              Stores.Loading.instance.reset()
            }
            await tick()
            network.goTo(Routes.order, {
              newOrder: false,
              order
            })
          } else if (route == Routes.orders) {
            network.reset(Routes.home)
            await tick()
            Stores.Loading.instance.reset()
            network.reset(Routes.orders)
          } else {
            togglePushNotificationPopup()
          }
        }
      } else {
        togglePushNotificationPopup()
      }
    }
  }
  async function actionPerformedCallBack(notification: any) {
    await receivedCallBack(notification.notification, true)
  }

  async function openNotification(notification: Types.Classes.CNotificationPayload) {
    if (logedIn) {
      if (notification?.data?.uri && ['/order/', '/orders/'].includes(notification.data?.uri)) {
        const cachedOrders = (cache.getObject(Stores.Cache.Types.ORDERS) ?? []) as Types.Classes.COrder[]
        if (cachedOrders.length > 0) {
          const order = cachedOrders.filter(cachedOrder => cachedOrder.id === notification.data?.payload)?.[0]
          network.goTo(Routes.order, {
            newOrder: false,
            order
          })
        }
      } else if (notification?.data?.uri && ['/vendorNotification/'].includes(notification.data?.uri)) {
        network.goTo(Routes.pushNotifications)
      }
    }
  }

  let pushNotification = new Utils.PushNotification(
    hasRegisteredCallBack,
    receivedCallBack,
    actionPerformedCallBack,
    hasErrorCallBack,
    permissionStatus
  )

  Stores.MenuHamburger.instance.reset()
  const tabs = [
    {
      name: 'Home',
      route: Routes.home,
      icon: faHome
    },
    {
      name: 'Busca',
      route: Routes.search,
      icon: faSearch
    },
    {
      name: 'Pedidos',
      route: Routes.orders,
      icon: faList
    }
  ]
  const menuHamburgerItems = [
    {
      name: 'Home',
      callback: () => Stores.Navigation.instance.reset(Routes.home),
      icon: faHome
    },
    {
      name: 'Perfil',
      callback: () => Stores.Navigation.instance.goTo(Routes.profile),
      icon: faUser
    },
    {
      name: 'Endereços',
      callback: () => Stores.Navigation.instance.goTo(Routes.addresses),
      icon: faAddressCard
    },
    {
      name: 'Meios de pagamento',
      callback: () => Stores.Navigation.instance.goTo(Routes.payments),
      icon: faMoneyBill1Wave
    },
    {
      name: 'Notificações',
      callback: () => Stores.Navigation.instance.goTo(Routes.pushNotifications),
      icon: faRocket
    },
    {
      name: 'Horario de funcionamento',
      callback: () => Stores.Navigation.instance.goTo(Routes.businessHours),
      icon: faHourglass
    },
    {
      name: 'Contato',
      callback: () => Stores.Navigation.instance.goTo(Routes.contact),
      icon: faPhone
    }
  ]
  menuHamburgerItems.forEach(page => Stores.MenuHamburger.instance.addItem(page))

  onMount(async () => {
    await CartStore.createInstance()
    style = document.createElement('style')
    document.head.appendChild(style)
    Store = await CartStore.instance.store()
    auth = await Stores.Auth.Auth.instance.store()
    if ($auth) {
      const token = await Utils.Jws.extractToken($auth)
      logedIn = token !== null
    } else {
      logedIn = false
    }
    let response = await GetSettings()
    if (response?.success && response?.data) {
      Settings.set({ ...$Settings, ...response?.data })
      isActive = $Settings?.isActive ?? true
    }
    response = await getLayout()
    if (response?.success && response?.data) {
      Stores.Layout.instance.set(response?.data)
    }
    networkStatus = await Network.getStatus()
    if (Capacitor.isNativePlatform()) {
      pushNotification.init()
      const statusBar = (await StatusBar.getInfo()) as StatusBarType
      statusBar.topMargin = statusBar?.topMargin ?? 0
      _StatusBar.setStatusBar(statusBar)
    }
    initialazation = false
    //MARK: --test push notification
    // await actionPerformedCallBack({
    //   notification: {
    //     id: new Date().getTime(),
    //     title: 'test',
    //     body: 'test body',
    //     data: {
    //       // logon: 'true',
    //       // uri: '/order/',
    //       // payload: '5231febb-42a7-4d87-96aa-0b9d272a971c'
    //     }
    //   }
    // })
  })

  Network.addListener('networkStatusChange', status => {
    networkStatus = status
  })

  // App.addListener('appUrlOpen', (data) => {
  //   Stores.Navigation.instance.goTo(Routes.settings, {
  //     callback: true,
  //     ...data,
  //   });
  // });
  $: isPageList = [Routes.orders, Routes.pushNotifications].includes(route)
  $: styleParams = `padding: ${isPageList ? 0 : 16}pt;margin-top:${styleHeight};padding-bottom: ${
    showCart || route === Routes.checkout || route === Routes.cart || route === Routes.product ? '128pt' : '64pt'
  }; overflow: scroll;max-width: 100%;background: ${$Layout?.background};height: 100%;`
</script>

<mainContainer>
  {#if initialazation}
    <LaunchScreen />
  {:else if !isActive}
    <NoService />
  {:else}
    <Views.MainContainer style={styleParams}>
      {#if route == Routes.home}
        <Home />
      {:else if route == Routes.cart}
        <Cart />
      {:else if route == Routes.search}
        <Search />
      {:else if route == Routes.product}
        <Product />
      {:else if route == Routes.businessHours}
        <BusinessHours />
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
      {:else if route == Routes.contact}
        <Contact />
      {:else}
        <Main />
      {/if}
      {#if showCart}
        <Views.Button bottomPadding={$_StatusBar.bottomPadding} on:click={goToCart} isFloat={true}
          >Ver sacola {Utils.Strings.currency(total)}</Views.Button
        >
      {/if}
    </Views.MainContainer>
    <Views.NavigationBar
      logo={$Settings?.profile?.mainPicture || 'assets/icons/transparent-logo-1.svg'}
      paddingTop={$_StatusBar.height}
      topMargin={$_StatusBar.topMargin}
    />
    <Views.Tabs {tabs} bottomPadding={$_StatusBar.bottomPadding} />
  {/if}

  <Views.LoadJS url="https://www.google.com/recaptcha/api.js?render=6LebYzshAAAAAIXhka3WrAjus5tDXtefR1QefVZS" />
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
</mainContainer>

<style>
  #internetError {
    background-color: #4c0708;
    color: white;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding-top: 1pt;
    padding-bottom: 1pt;
    padding-left: 16pt;
    padding-right: 16pt;
    z-index: 9999999999;
    text-align: center;
    border-bottom: 1pt solid white;
  }
  :global(.grecaptcha-badge) {
    visibility: hidden;
  }
</style>
