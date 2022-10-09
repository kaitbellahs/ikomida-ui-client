import { Network, Types, Stores } from '@ikomida/shared-frontend'
const cache = Stores.Cache.createInstance('Products')
let timeout: Date
export async function all(): Promise<Types.Classes.CCategoryProducts[]> {
  if (!timeout || timeout < new Date(new Date().setMinutes(new Date().getMinutes() + 2))) {
    const response = await Network.instance?.get('/products', true)
    if (response?.success) {
      const data = (
        Types.Classes.CCategoryProducts.fromObject(response?.data) as Types.Classes.CCategoryProducts[]
      ).filter(item => (item.products?.length ?? 0) > 0)
      cache.setObject('Products', data)
      timeout = new Date()
      return data
    } else {
      return []
    }
  } else {
    return cache.getObject('Products')
  }
}

export async function search(query: string): Promise<Types.Classes.CCategoryProducts[]> {
  return (await all())
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
}

export async function getProduct(id?: string) {
  return Network.instance?.get(`/product/${id}`, true)
}

function sortItems(items: Types.Classes.CCategoryProducts[]) {
  return items
    .map(category => {
      category.products = category.products?.sort((i1, i2) => (i1?.order ?? 0) - (i2?.order ?? 0))
      return category
    })
    .sort((i1, i2) => (i1?.order ?? 0) - (i2?.order ?? 0))
}
