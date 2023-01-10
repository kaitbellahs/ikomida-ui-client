<script lang="ts">
  import { Cart } from '../../stores/Cart'
  import type { IStore } from '../../stores/Cart'
  import Routes from '../../stores/Routes'
  import { faTrash } from '@fortawesome/free-solid-svg-icons'
  import { Views, Utils, Logics, Stores, Types } from '@ikomida/shared-frontend'
  import { Settings } from '../../stores/Setup'
  import { GetAddresses, GetSettings } from '../../network/User'
  import { onMount } from 'svelte'
  import OrderType from '../../stores/OrderType'

  let Products: IStore
  let showAlert = false
  let address: Types.Classes.CAddress | null
  let orderType: Types.Types.TOrderType | undefined = undefined
  let working: Types.Interfaces.IRecord<string, boolean> = {}
  let auth: Stores.Auth.IStore
  let logedIn = false

  $: subtotal = () => {
    const totalOptionsArray = $Products?.map(product => Utils.Numbers.calcProductPrice(product)) ?? []
    return (totalOptionsArray?.length ?? 0) > 0 ? totalOptionsArray.reduce((a, b) => a + b) : 0
  }

  $: calcDelivery = address ? ((address?.distance ?? 0) / 1000) * ($Settings.delivery?.value ?? 0) : 0
  $: delivery = Math.ceil(
    $Settings?.delivery?.free
      ? 0
      : calcDelivery < ($Settings?.delivery?.min ?? 0)
      ? $Settings?.delivery?.min ?? 0
      : calcDelivery
  )
  $: tip = Logics.Finances.calcDiscount(subtotal(), $Settings.tip ?? 0, Types.Types.TDiscount.PERCENT)
  $: total =
    subtotal() +
    (logedIn && orderType === Types.Types.TOrderType.DELIVERY
      ? delivery
      : logedIn && orderType === Types.Types.TOrderType.LOCAL
      ? tip
      : 0)

  $: if ($Products && $Products.length === 0) {
    Stores.Navigation.instance.reset(Routes.home)
  }

  function addMoreProducts() {
    Stores.Navigation.instance.pop(2)
  }

  async function resetCart() {
    await Cart.instance.reset()
    Stores.Navigation.instance.reset(Routes.home)
  }

  function toggleAlert() {
    showAlert = !showAlert
  }

  function forward() {
    if (!('forward' in working) || !working.forward) {
      working.forward = true
      for (const cartProduct of $Products) {
        const productOptionsCategoriesMandatories =
          cartProduct.optionsCategories?.filter(optionsCategory => optionsCategory.min > 0) ?? []
        for (const productOptionsCategoriesMandatory of productOptionsCategoriesMandatories) {
          if (
            getCartOptionsCount(cartProduct, productOptionsCategoriesMandatory) < productOptionsCategoriesMandatory.min
          ) {
            Stores.MessageAlert.instance.show(
              `Certifique-se de que selecionou no mínimo ${productOptionsCategoriesMandatory.min} ${
                productOptionsCategoriesMandatory.min > 1 ? 'opções' : 'opção'
              } na categoria ${productOptionsCategoriesMandatory.name}.`
            )
            working.forward = false
            return
          }
        }
        for (const optionsCategory of cartProduct.optionsCategories ?? []) {
          if (getCartOptionsCount(cartProduct, optionsCategory) > optionsCategory.max) {
            Stores.MessageAlert.instance.show(
              `Diminua a quantidade das opções escolhidas, a categoria "${optionsCategory.name}" aceita no maximo ${
                optionsCategory.max
              } ${optionsCategory.max > 1 ? 'opções' : 'opção'}.`
            )
            working.forward = false
            return
          }
        }
      }
      if (($Settings.delivery?.orderMinValue ?? 0) > total) {
        Stores.MessageAlert.instance.show(
          `Por enquanto só aceitamos pedidos a partir de ${Utils.Strings.currency(
            $Settings.delivery?.orderMinValue ?? 0
          )}, adicione mais itens.`
        )
        return
      }
      working.forward = false
    }
    Stores.Navigation.instance.goTo(Routes.checkout)
  }

  function getCartOptionsCount(cartProduct: Types.CCart, optionsCategory: Types.Classes.CProductOptionsCategory) {
    const optionsCategoryIds = optionsCategory?.options.flatMap(option => option.id) ?? []
    const categoryOptions = cartProduct.options
      ?.filter(option => optionsCategoryIds.includes(option.id))
      ?.flatMap(option => option.units)
    return categoryOptions && categoryOptions.length > 0
      ? categoryOptions.reduce((previousValue, currentValue) => previousValue + currentValue)
      : 0
  }

  async function onRemoveClick(inputCartProduct?: Types.CCart, inputOption?: Types.CCartProductOption) {
    if (!('onRemoveClick' in working) || !working.onRemoveClick) {
      working.onRemoveClick = true
      if (inputCartProduct) {
        const cartProduct = $Products.filter(product => product.equal(inputCartProduct))?.[0]
        if (inputOption) {
          const option = cartProduct.options?.filter(option => option.equal(inputOption))?.[0]
          const optionsCategories = cartProduct.optionsCategories?.filter(optionsCategory => {
            const filtredOptionsCategory = optionsCategory.options.filter(
              productOption => productOption.id === option?.id
            )
            return filtredOptionsCategory.length === 1
          })
          const optionsCategory = optionsCategories?.[0]
          if (optionsCategory && option) {
            if (getCartOptionsCount(cartProduct, optionsCategory) - inputOption.units <= optionsCategory.min) {
              Stores.MessageAlert.instance.show(
                `Não será possível deletar esta opção nesta categoria, porque é obrigatório escolher no mínimo ${
                  optionsCategory.min
                } ${optionsCategory.min > 1 ? 'opções' : 'opção'} na categoria "${
                  optionsCategory.name
                }", tente adicionar outras opções nesta categoria e também pode excluir o produto.`
              )
              working.onRemoveClick = false
              return
            }
            const optionIndex = cartProduct.options?.indexOf(option)
            if (optionIndex) {
              cartProduct.options?.splice(optionIndex, 1)
              await Cart.instance.update($Products)
            }
          }
        } else {
          if (cartProduct) {
            await Cart.instance.update($Products.filter(product => !product.equal(cartProduct)))
          }
        }
      }
      working.onRemoveClick = false
    }
  }

  async function onPlusClick(inputCartProduct?: Types.CCart, inputOption?: Types.CCartProductOption) {
    if (!('onPlusClick' in working) || !working.onPlusClick) {
      working.onPlusClick = true
      let update = false
      if (inputCartProduct) {
        let cartProduct = $Products.filter(product => product.equal(inputCartProduct))?.[0]
        if (inputOption && cartProduct) {
          const option = cartProduct.options?.filter(option => option.equal(inputOption))?.[0]
          const optionsCategory = cartProduct.optionsCategories?.filter(
            optionsCategory =>
              optionsCategory.options.filter(productOption => productOption.id === option.id).length === 1
          )?.[0]
          if (
            optionsCategory &&
            option &&
            option.units < option.maxUnits &&
            getCartOptionsCount(cartProduct, optionsCategory) < optionsCategory?.max
          ) {
            option.units++
            update = true
          }
        } else {
          if (
            cartProduct &&
            cartProduct.quantity < cartProduct.leftQuantity &&
            ((cartProduct.maxQuantityPerOrder ?? 10) <= 0 ||
              cartProduct.quantity < (cartProduct.maxQuantityPerOrder ?? 10))
          ) {
            cartProduct.quantity++
            update = true
          }
        }
      }
      if (update) {
        await Cart.instance.update($Products)
      }
      working.onPlusClick = false
    }
  }

  async function onMinosClick(inputCartProduct?: Types.CCart, inputOption?: Types.CCartProductOption) {
    if (!('onMinosClick' in working) || !working.onMinosClick) {
      working.onMinosClick = true
      if (inputCartProduct) {
        let update = false
        const cartProduct = $Products.filter(product => product.equal(inputCartProduct))?.[0]
        if (inputOption) {
          const option = cartProduct.options.filter(option => option.equal(inputOption))?.[0]
          const optionsCategories = cartProduct.optionsCategories?.filter(optionsCategory => {
            const filtredOptionsCategory = optionsCategory.options.filter(
              productOption => productOption.id === option.id
            )
            return filtredOptionsCategory.length === 1
          })
          const optionsCategory = optionsCategories?.[0]
          if (optionsCategory && option) {
            if (getCartOptionsCount(cartProduct, optionsCategory) <= optionsCategory.min) {
              Stores.MessageAlert.instance.show(
                `Não será possível diminuir a quantidade das opções, porque é obrigatório escolher no mínimo ${
                  optionsCategory.min
                } ${optionsCategory.min > 1 ? 'opções' : 'opção'} na categoria "${
                  optionsCategory.name
                }", tente adicionar outras opções nesta categoria e também pode excluir o produto.`
              )
              working.onMinosClick = false
              return
            }
            if (option.units > 1) {
              option.units--
              update = true
            } else if (option) {
              const optionIndex = cartProduct.options.indexOf(option)
              cartProduct.options.splice(optionIndex, 1)
              update = true
            }
          }
        } else {
          if (cartProduct?.quantity > 1) {
            cartProduct.quantity--
            update = true
          } else {
            await onRemoveClick(cartProduct)
          }
        }
        if (update) {
          await Cart.instance.update($Products)
        }
      }
      working.onMinosClick = false
    }
  }

  async function addOptions(product?: Types.CCart) {
    if (product) {
      Stores.Navigation.instance?.goTo(Routes.product, { product, active: true })
    }
  }

  onMount(async () => {
    orderType = await OrderType.get()
    auth = await Stores.Auth.Auth.instance.store()
    if ($auth) {
      const token = await Utils.Jws.extractToken($auth)
      logedIn = token !== null
    } else {
      logedIn = false
    }
    let response = await GetSettings()
    if (response?.success && response?.data) {
      const settings: Types.Classes.CVendorSettings = Types.Classes.CVendorSettings.fromObject({
        ...Settings.get().toJSON(),
        ...response?.data
      })
      Settings.set(settings)
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    if (logedIn) {
      response = await GetAddresses()
      if (response?.success) {
        const data: Types.Classes.CAddress[] = Types.Classes.CAddress.fromObject(response?.data)
        const addresses = data.filter(address => address.selected)
        address = (addresses?.length ?? 0) === 1 ? addresses[0] : null
      }
    }
    Products = await Cart.instance.store()
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Sacola de compras')
  Stores.Menu.instance.addItem({
    name: 'Limpar',
    icon: faTrash,
    callback: toggleAlert
  })
</script>

<data>
  {#if showAlert}
    <Views.Alert
      title="Alerta"
      message="Você tem certeza que quer remover todos produtos do carrinho de compras?"
      closeCallBack={toggleAlert}
      buttons={[
        { name: 'Não', callback: toggleAlert, principal: true },
        { name: 'Sim', callback: resetCart }
      ]}
    />
  {/if}
  {#if $Settings.delivery?.orderMinValue}
    <info class="shadow">
      Pedido mínimo: <b>{Utils.Strings.currency($Settings.delivery?.orderMinValue ?? 0)}</b>
    </info>
  {/if}
  {#each $Products ?? [] as product}
    <Views.CartItem {addOptions} {onRemoveClick} {onPlusClick} {onMinosClick} {product} />
  {/each}
  <Views.Button type={Types.TButton.TRANSPARENT} on:click={addMoreProducts}>Adicionar mais itens</Views.Button>
  <table>
    <thead>
      <tr>
        <th colspan="2" class="resumeHead">Resumo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="resumeText">Subtotal</td>
        <td class="resumeValue">{Utils.Strings.currency(subtotal())}</td>
      </tr>
      {#if orderType === Types.Types.TOrderType.DELIVERY}
        {#if address}
          <tr>
            <td class="resumeText">Taxa de entrega</td>
            <td class="resumeValue"
              ><span class:deliveryFree={delivery == 0}
                >{delivery == 0 ? 'Gratis' : Utils.Strings.currency(delivery)}</span
              ></td
            >
          </tr>
        {/if}
      {:else if orderType === Types.Types.TOrderType.LOCAL}
        <tr>
          <td class="resumeText">Gorjeta sugerida ({Utils.Strings.percent($Settings?.tip ?? 0)})</td>
          <td class="resumeValue"><span class:deliveryFree={tip == 0}>{Utils.Strings.currency(tip ?? 0)}</span></td>
        </tr>
      {/if}
      <tr>
        <td class="resumeText">Total</td>
        <td class="resumeValue">{Utils.Strings.currency(total)}</td>
      </tr>
    </tbody>
  </table>
  <Views.Button isFloat={true} on:click={forward}><span>Continuar</span></Views.Button>
</data>

<style>
  table {
    width: 100%;
    padding-bottom: 56px;
  }
  .resumeHead {
    font-size: 1.1em;
  }
  .resumeText {
    text-align: left;
    width: 50%;
    font-size: 0.9em;
    font-weight: lighter;
  }
  .resumeValue {
    text-align: right;
    font-size: 0.9em;
  }
  .deliveryFree {
    color: green;
  }
  info {
    padding: 16px;
    border-radius: 8px;
  }
</style>
