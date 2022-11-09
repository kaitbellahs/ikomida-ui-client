import { Preferences } from '@capacitor/preferences'
import Routes from './Routes'

const ikomidaLastRoute = 'ikomidaLastRoute'

export default class LastRoute {
  static async set(route?: Symbol) {
    await Preferences.set({
      key: ikomidaLastRoute,
      value: route?.description ?? ''
    })
  }
  static async get() {
    const symbol = (
      await Preferences.get({
        key: ikomidaLastRoute
      })
    ).value
    for (const route of Object.values(Routes)) {
      if (route.description === symbol) {
        return route
      }
    }
    return undefined
  }
}
