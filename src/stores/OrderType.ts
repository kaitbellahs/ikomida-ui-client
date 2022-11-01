import { Preferences } from '@capacitor/preferences'
import { Types } from '@ikomida/shared-frontend'

const ikomidaOrderType = 'ikomidaOrderType'

export default class OrderType {
  static async set(orderType?: Types.Types.TOrderType) {
    await Preferences.set({
      key: ikomidaOrderType,
      value: orderType?.id ?? ''
    })
  }
  static async get() {
    const orderType = (
      await Preferences.get({
        key: ikomidaOrderType
      })
    ).value
    return Types.Types.TOrderType.valueOf(orderType ?? '') ?? undefined
  }
}
