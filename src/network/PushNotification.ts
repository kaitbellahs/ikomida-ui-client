import { Network, Types } from '@ikomida/shared-frontend'

export async function registerPushNotificationToken(object: Types.Classes.CRegisterPushNotification) {
  return Network.instance?.post('/notification/register', true, object)
}
