import { Network, Types, Stores, Logics } from '@ikomida/shared-frontend'
import OrderType from '../stores/OrderType'
const cache = Stores.Cache.createInstance('Products')
let timeout = 0

export function resetTimeout() {
  timeout = 0
}

export async function all(): Promise<Types.Classes.CCategoryProducts[]> {
  if (!timeout || timeout < new Date().getTime() - 2 * 60 * 1000) {
    const orderType = await OrderType.get()
    const response = await Network.instance?.get(`/products?orderType=${orderType?.id ?? ''}`, true)
    if (response?.success) {
      const data = (Types.Classes.CCategoryProducts.fromObject(response?.data) as Types.Classes.CCategoryProducts[])
        .filter(item => (item.products?.length ?? 0) > 0)
        .map(item => item.toJSON())
      cache.setObject('Products', data)
      timeout = new Date().getTime()
      return sortItems(Types.Classes.CCategoryProducts.fromObject(data))
    } else {
      return []
    }
  } else {
    return sortItems(Types.Classes.CCategoryProducts.fromObject(cache.getObject('Products')))
  }
}

export async function search(query: string): Promise<Types.Classes.CCategoryProducts[]> {
  return sortItems(
    (await all())
      .map(section => {
        return {
          title: section.title,
          products: section.products?.filter(item => {
            if (typeof item == 'object') {
              return (
                item.title?.toLowerCase().includes(query.toLowerCase()) ||
                item.description?.toLowerCase().includes(query.toLowerCase())
              )
            } else {
              return true
            }
          })
        } as Types.Classes.CCategoryProducts
      })
      .filter(item => (item.products?.length ?? 0) > 0)
  )
}

export async function getProduct(id?: string) {
  return Network.instance?.get(`/product/${id}`, true)
}


function isBusinessTime(business?: Types.Classes.CBusinessTime) {
  return !business || (!business.days && !business.hours) || Logics.DateTime.isBusinessTime(business!)
}

function sortItems(items: Types.Classes.CCategoryProducts[]) {
  return items
    .map(category => {
      category.products = category?.products?.sort((i1, i2) => (i1?.order ?? 0) - (i2?.order ?? 0))
      return category
    })
    .sort((i1, i2) => (i1.order ?? 0) - (i2.order ?? 0))
    .sort((i1, i2) => (isBusinessTime(i2.business) ? 1 : 0) - (isBusinessTime(i1.business) ? 1 : 0))
}
