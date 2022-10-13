<script lang="ts">
  import { Views, Utils, Types, Logics, Stores } from '@ikomida/shared-frontend'
  import { Capacitor } from '@capacitor/core'
  import { Geolocation } from '@capacitor/geolocation'
  import { onMount } from 'svelte'
  import { Cart } from '../../stores/Cart'
  import type { IStore } from '../../stores/Cart'
  import { Settings } from '../../stores/Setup'
  import { GetPaymentMethods, AddCoupon } from '../../network/Payment'
  import { NewOrders } from '../../network/Orders'
  import { GetAddresses, GetSettings } from '../../network/User'
  import Routes from '../../stores/Routes'

  let Products: IStore
  let location: Types.Classes.CLocation
  let coupon: string | undefined
  let couponObject: Types.Classes.CCoupon | undefined = undefined

  let address: Types.Classes.CAddress | undefined
  let payment: Types.Classes.CPaymentMethod | undefined

  $: optionsTotal = () => {
    const totalOptionsArray =
      $Products?.map(product => {
        let calcTotal = 0
        for (const option of product?.options ?? []) {
          calcTotal +=
            option.units *
            (option.price - Logics.Finances.calcDiscount(option.price, product.discount, product.discountType))
        }
        return calcTotal
      }) ?? []
    return (totalOptionsArray?.length ?? 0) > 0 ? totalOptionsArray.reduce((a, b) => a + b) : 0
  }

  $: subtotalArray = [
    ...($Products?.map(
      product =>
        product.quantity *
        (product?.price - Logics.Finances.calcDiscount(product.price, product.discount, product.discountType))
    ) ?? []),
    optionsTotal()
  ]

  $: subtotal = (subtotalArray?.length ?? 0) > 0 ? subtotalArray.reduce((a, b) => a + b) : 0
  $: calcDelivery = address ? ((address?.distance ?? 0) / 1000) * ($Settings?.delivery?.value ?? 0) : 0
  $: delivery = $Settings?.delivery?.free
    ? 0
    : calcDelivery < $Settings?.delivery?.min
    ? $Settings?.delivery?.min
    : calcDelivery
  $: netTotal = subtotal + delivery
  $: discount = couponObject ? Logics.Finances.calcDiscount(subtotal, couponObject.value, couponObject.valueType) : 0
  $: total = netTotal - discount
  $: validate = address && payment
  $: businessTime = Logics.DateTime.isBusinessTime($Settings.business)

  function addMoreItems() {
    Stores.Navigation.instance.pop(3)
  }

  async function getLocation() {
    if (Capacitor.isNativePlatform()) {
      const res = await Geolocation.getCurrentPosition()
      location = Types.Classes.CLocation.fromObject({
        latitude: res.coords.latitude,
        longitude: res.coords.longitude
      })
    } else {
      navigator.geolocation.getCurrentPosition(res => {
        location = Types.Classes.CLocation.fromObject({
          latitude: res.coords.latitude,
          longitude: res.coords.longitude
        })
      })
    }
  }

  async function forward() {
    Stores.Loading.instance.start()
    if (!address || !payment?.type) {
      Stores.Loading.instance.stop()
      return
    }
    const products: Types.CCart[] = []
    products.push(
      ...$Products.map(CartProduct => {
        const product: Types.CCart = Types.CCart.fromObject(CartProduct.toJSON())
        console.log('product:', product)
        product.optionsCategories = undefined
        product.image = undefined
        product.order = undefined
        product.options = product.options?.map(option => {
          option.image = undefined
          return option
        })
        return product
      })
    )
    const payload: Types.Classes.COrder = Types.Classes.COrder.init(
      netTotal,
      discount,
      delivery,
      products,
      address,
      payment?.type,
      $Settings.preparation,
      couponObject,
      undefined,
      undefined,
      undefined,
      undefined,
      payment
    )
    const response = await NewOrders(payload)
    Stores.Loading.instance.stop()
    if (response && response?.success) {
      await Cart.instance.reset()
      Stores.Navigation.instance.goTo(Routes.order, {
        newOrder: true,
        order: Types.Classes.COrder.fromObject(response?.data)
      })
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
  }

  async function addCoupon() {
    if (coupon && coupon.length >= 3) {
      Stores.Loading.instance.start()
      const response = await AddCoupon(coupon)
      if (response?.success) {
        couponObject = Types.Classes.CCoupon.fromObject(response.data)
      } else {
        Stores.MessageAlert.instance?.show(response?.data)
      }
      Stores.Loading.instance.stop()
    }
  }

  function removeCoupon() {
    couponObject = undefined
    coupon = undefined
  }

  function manageCard() {
    Stores.Navigation.instance.goTo(Routes.payments)
  }

  function manageAddress() {
    Stores.Navigation.instance.goTo(Routes.addresses)
  }

  onMount(async () => {
    try {
      console.log('onMount')
      Products = await Cart.instance.store()
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
      response = await GetAddresses()
      if (response?.success) {
        const data: Types.Classes.CAddress[] = Types.Classes.CAddress.fromObject(response.data)
        const addresses = data.filter(address => address.selected)
        address = (addresses?.length ?? 0) === 1 ? addresses[0] : undefined
      }
      response = await GetPaymentMethods()
      if (response?.success) {
        const data: Types.Classes.CPaymentMethod[] = Types.Classes.CPaymentMethod.fromObject(response.data)
        const payments = data.filter(paymentMethod => paymentMethod.selected)
        payment = (payments?.length ?? 0) === 1 ? payments[0] : undefined
      }
      if (Capacitor.isNativePlatform()) {
        const checkpermissions = await Geolocation.checkPermissions()
        if (checkpermissions.location != 'prompt') {
          const permissions = await Geolocation.requestPermissions()
          if (permissions.location != 'granted') {
            await getLocation()
          }
        } else {
          await getLocation()
        }
      } else {
        if (navigator.permissions && navigator.permissions.query) {
          const permission = await navigator.permissions.query({
            name: 'geolocation'
          })
          if (permission.state != 'denied') {
            await getLocation()
          }
        } else if (navigator.geolocation) {
          await getLocation()
        }
      }
    } catch (exception: any) {
      console.error(exception)
    }
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Resumo e pagamento')
</script>

<h3 class="resumeHead">Resumo</h3>
{#if $Products}
  {#each $Products as product}
    <div class="product">
      <header>
        <span class="quantity">{product.quantity}</span><span class="title">{product.title}</span><span class="price"
          >{Utils.Strings.currency(
            product.quantity *
              (product.price - Logics.Finances.calcDiscount(product.price, product.discount, product.discountType))
          )}</span
        >
      </header>
      {#if (product.options?.length ?? 0) > 0}
        <div>
          {#each product.options ?? [] as option, optionIndex}
            <div class="option">
              <span class="units">{option.units}</span><span class="name">{option.name}</span><span class="price"
                >{Utils.Strings.currency(
                  (option.units ?? 0) *
                    ((option.price ?? 0) -
                      Logics.Finances.calcDiscount(option.price ?? 0, product.discount ?? 0, product.discountType))
                )}</span
              >
            </div>
          {/each}
        </div>
      {/if}
      {#if product.observation}
        <small><b>Obs:</b> {product.observation}</small>
      {/if}
    </div>
  {/each}
  <Views.Divider />
{/if}
<table>
  <tbody>
    <tr>
      <td class="resumeText">Subtotal</td>
      <td class="resumeValue">{Utils.Strings.currency(subtotal)}</td>
    </tr>
    {#if discount !== 0}
      <tr>
        <td class="resumeText"
          >cupom (- {couponObject?.valueType === Types.Types.TDiscount.PERCENT
            ? Utils.Strings.percent(couponObject?.value)
            : Utils.Strings.currency(couponObject?.value)})
        </td>
        <td class="resumeValue"><span class="deliveryFree">- {Utils.Strings.currency(discount)}</span></td>
      </tr>
    {/if}
    <tr>
      <td class="resumeText">Taxa de entrega</td>
      <td class="resumeValue"
        ><span class:deliveryFree={delivery == 0}>{delivery == 0 ? 'Gratis' : Utils.Strings.currency(delivery)}</span
        ></td
      >
    </tr><tr class="spacer" />
    <tr class="total">
      <td class="resumeText">Total</td>
      <td class="resumeValue total">{Utils.Strings.currency(total)}</td>
    </tr>
  </tbody>
</table>
{#if couponObject}
  <Views.Button type={Types.TButton.TRANSPARENT} on:click={removeCoupon}>Remover o cupom</Views.Button>
{:else}
  <Views.TextEdit
    bind:value={coupon}
    placeHolder="Adicionar cupom"
    buttonName="Adicionar"
    callback={addCoupon}
    type={Types.TTextEdit.ALPHA_NUMERIC}
    upper={true}
  />
{/if}
<Views.Button type={Types.TButton.TRANSPARENT} on:click={addMoreItems}>Adicionar mais itens</Views.Button>
<Views.Divider />
<Views.Button on:click={manageAddress}>trocar endereço</Views.Button>
{#if address === undefined}
  <Views.LocalLoading size={2} />
{:else if address}
  <div class="address">
    <div class="content">
      <span class="delivery">A entrega será realizada na</span>
      <span>{address?.street}, {address?.number}{address?.complement ? ` - ${address?.complement}` : ''}</span>
      <span class="neighborhood">{address?.neighborhood} </span>
      <span class="city">{address?.city}/{address?.stat} CEP: {address?.postalCode}</span>
    </div>
  </div>
{:else}
  <h3>Para continuar precisa selecionar ou adicionar um endereço</h3>
{/if}
<Views.Divider />
<Views.Button on:click={manageCard}>Trocar meio de pagamento</Views.Button>
{#if payment === undefined}
  <Views.LocalLoading size={2} />
{:else if payment}
  <div class="paymentCard">
    <div class="content">
      <span class="payWith">A cobrança será realizada com</span>
      <span class="paymentType">{Utils.Strings.capitalizeFirstLeter(payment.type?.name)}</span>
      {payment?.type.description}
      <span class="brand">
        {#if payment?.type === Types.Types.TPaymentMethod.CREDIT_CARD_ONLINE}
          <Views.Image source="/assets/cardBrand/{payment?.brand}.svg" name={payment?.brand} />
          **** {payment?.lastDigits}
        {/if}
      </span>
    </div>
  </div>
{:else}
  <h3>Para continuar precisa selecionar ou adicionar um novo cartão de crédito</h3>
{/if}
{#if businessTime}
  <Views.Button disabled={!validate} isFloat={true} on:click={forward}>
    <span
      >Confirmar o {!payment?.type ||
      [
        Types.Types.TPaymentMethod.CASH_ON_DELIVERY,
        Types.Types.TPaymentMethod.CREDIT_CARD_ON_DELIVERY,
        Types.Types.TPaymentMethod.DEBT_CARD_ON_DELIVERY,
        Types.Types.TPaymentMethod.PIX_ON_DELIVERY
      ].includes(payment.type)
        ? 'pedido'
        : 'pagamento'}</span
    ></Views.Button
  >
{:else}
  <h2 class="businessHoursError">Estámos fora do horario do funcionamento, confire os nossos horários</h2>
{/if}
<Views.GTerms />

<style>
  .product {
    font-family: RobotoLight;
    font-size: 0.9em;
    margin-top: 10px;
    margin-bottom: 0;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ccc;
    border-left: 1px solid #ccc;
    display: flex;
    flex-direction: column;
  }
  .product > small {
    margin-left: 5px;
  }
  .product > header > .quantity {
    margin-right: 5px;
    font-family: RobotoMedium;
    font-size: 1em;
    background: #ccc;
    width: 20px;
    height: 20px;
    padding: 2px;
    text-align: center;
    vertical-align: middle;
  }
  .product > header > .price {
    margin-left: 5px;
    font-family: RobotoMedium;
    font-size: 0.9em;
  }
  .product > div {
    margin-left: 15px;
    margin-bottom: 5px;
    margin-top: 5px;
    font-size: 0.9em;
  }
  .product > div > .option > .units {
    margin-right: 5px;
    font-family: RobotoMedium;
    font-size: 1em;
    background: rgba(204, 204, 204, 0.356);
    width: 20px;
    height: 20px;
    padding: 0 2px;
    text-align: center;
    vertical-align: middle;
  }
  .product > div > .option > .price {
    margin-left: 5px;
    font-family: RobotoMedium;
    font-size: 0.9em;
  }
  .paymentCard {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }
  .paymentCard > .content {
    display: flex;
    flex-direction: column;
    flex-grow: 10;
  }
  .paymentCard > .content > .payWith {
    font-weight: lighter;
    font-size: 0.9em;
    width: 100%;
  }
  .paymentCard > .content > .brand > :global(img) {
    height: 14px;
    width: auto;
  }
  .paymentCard > .content > .brand {
    font-weight: lighter;
    font-size: 1em;
    width: 100%;
    margin-top: 5px;
  }
  .address {
    width: 100%;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ccc;
    padding: 10px 0;
  }
  .address > .content {
    display: flex;
    flex-direction: column;
    flex-grow: 2;
  }
  .address > .content > .delivery {
    font-weight: lighter;
    font-size: 0.9em;
    width: 100%;
  }
  .address > .content > .neighborhood {
    font-weight: lighter;
    font-size: 1em;
    width: 100%;
  }
  .address > .content > .city {
    font-weight: lighter;
    font-size: 0.9em;
    width: 100%;
  }
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 0.4em;
  }
  .resumeHead {
    font-size: 1.1em;
    text-align: center;
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
  tr.total {
    padding-top: 10px;
  }
  .resumeValue.total {
    font-size: 1.1em;
  }
  .deliveryFree {
    color: green;
  }
  .businessHoursError {
    text-align: center;
    color: #4c0708;
    margin-top: 20px;
  }
</style>
