import { Network, Types } from '@ikomida/shared-frontend'

export async function doLogin(areaCode: string, phone: string, password: string) {
  return Network.instance?.post(
    '/auth',
    undefined,
    {
      areaCode,
      phone,
      password
    },
    'login'
  )
}

export async function updatePassword(object: Types.Classes.CUser) {
  return Network.instance?.post('/password', true, object, 'updatePassword')
}

export async function requestPasswordPhoneValidation(object: Types.Classes.CUser) {
  return Network.instance?.post('/requestPasswordPhoneValidation', undefined, object, 'requestPasswordPhoneValidation')
}
export async function validatePasswordPhoneValidationCode(object: Types.Classes.CUser) {
  return Network.instance?.post(
    '/validatePasswordPhoneValidationCode',
    undefined,
    object,
    'validatePasswordPhoneValidationCode'
  )
}

export async function requestPassword(object: Types.Classes.CUser) {
  return Network.instance?.post('/requestPassword', undefined, object, 'requestPassword')
}

export async function logout() {
  return Network.instance?.logout()
}

export async function deleteProfile() {
  return (Network.instance as Network | undefined)?.remove('/deleteAccount', true, undefined, 'deleteAccount')
}

export async function requestPhoneValidation(object: Types.Classes.CUser) {
  return Network.instance?.post('/requestPhoneValidation', undefined, object, 'requestPhoneValidation')
}

export async function validatePhoneValidationCode(object: Types.Classes.CUser) {
  return Network.instance?.post('/validatePhoneValidationCode', undefined, object, 'validatePhoneValidationCode')
}

export async function subscribe(object: Types.Classes.CUser) {
  return Network.instance?.post('/subscribe', undefined, object, 'subscribe')
}
