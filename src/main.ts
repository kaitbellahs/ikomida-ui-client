window.environment = 'ENVIRONMENT'

import App from './App.svelte'
import { Network, Stores } from '@ikomida/shared-frontend'
import Routes from './stores/Routes'
import { Cart } from './stores/Cart'

const appVersion = '${{version}}$'
const agent = 'CLIENT'
const url: any = {
  production: 'https://api.ikomida.com',
  development: 'https://dev.api.ikomida.com',
  homologation: 'https://hmlg.api.ikomida.com'
}
Stores.Cache.createInstance()
Stores.Auth.Auth.createInstance(agent)
Stores.MenuHamburger.createInstance()
Stores.Menu.createInstance()
Stores.Title.createInstance()
Stores.PushNotificationToken.createInstance()
Stores.Navigation.createInstance(Routes.home)
Stores.LoadMore.createInstance()
Stores.Layout.createInstance()
Cart.createInstance()
Network.createInstance(
  url[window.environment],
  '${{iKomidaId}}$',
  agent,
  '6LebYzshAAAAAIXhka3WrAjus5tDXtefR1QefVZS',
  appVersion
)

export default new App({
  target: document.body
})
