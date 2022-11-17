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
  import OrderType from '../../stores/OrderType'

  let Products: IStore
  let location: Types.Classes.CLocation
  let coupon: string | undefined = undefined
  let table: string | undefined = undefined
  let change: number | undefined | 'undefined' = undefined
  let couponObject: Types.Classes.CCoupon | undefined = undefined
  let orderType: Types.Types.TOrderType | undefined = undefined
  let showLocationAlertAlert = false
  let address: Types.Classes.CAddress | undefined | null = undefined
  let payment: Types.Classes.CPaymentMethod | undefined = undefined

  $: optionsTotal = () => {
    const totalOptionsArray =
      $Products?.map(product => {
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
    ...($Products?.map(
      product =>
        product.quantity *
        (product?.price - Logics.Finances.calcDiscount(product.price, product.discount, product.discountType))
    ) ?? []),
    optionsTotal()
  ]

  $: subtotal = (subtotalArray?.length ?? 0) > 0 ? subtotalArray.reduce((a, b) => a + b) : 0
  $: calcDelivery = address ? ((address?.distance ?? 0) / 1000) * ($Settings?.delivery?.value ?? 0) : 0
  $: delivery = Math.ceil(
    $Settings?.delivery?.free
      ? 0
      : calcDelivery < ($Settings.delivery?.min ?? 0)
      ? $Settings.delivery?.min ?? 0
      : calcDelivery
  )
  $: tip = Logics.Finances.calcDiscount(subtotal, $Settings.tip ?? 0, Types.Types.TDiscount.PERCENT)
  $: netTotal =
    subtotal +
    (orderType === Types.Types.TOrderType.DELIVERY ? delivery : orderType === Types.Types.TOrderType.LOCAL ? tip : 0)
  $: discount = couponObject ? Logics.Finances.calcDiscount(subtotal, couponObject.value, couponObject.valueType) : 0
  $: total = netTotal - discount
  $: validate =
    payment &&
    (orderType === Types.Types.TOrderType.DELIVERY
      ? address
      : orderType === Types.Types.TOrderType.LOCAL
      ? table
      : true) &&
    subtotal >= (couponObject?.minValue ?? 0) &&
    (payment?.type === Types.Types.TPaymentMethod.CASH_ON_DELIVERY ? Number(change) > 0 : true)
  $: businessTime = $Settings.business && Logics.DateTime.isBusinessTime($Settings.business)

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

  async function canForward() {
    if (!payment?.type || !$Settings.profile?.address) {
      return
    }
    if (!location && orderType === Types.Types.TOrderType.LOCAL) {
      Stores.MessageAlert.instance.show(
        'Para continuar, precisa habilitar a sua geolocalização para que possamos validar o local do seu pedido.'
      )
      await requestGeoLocation()
      return
    }
    if (
      location &&
      orderType === Types.Types.TOrderType.LOCAL &&
      $Settings.profile?.address.location &&
      Logics.GeoLocation.distanceBetweenTwoLocations($Settings.profile?.address.location, location) > 500
    ) {
      Stores.MessageAlert.instance.show(
        'Você está longe do estabelecimento, para usar o garçom digital, por favor vá até o estabelecimento e escolha uma mesa, para que você possa concluir o seu pedido, ou troque o tipo do pedido para entrega a domicílio ou retirada no local.'
      )
      return
    }
    if (
      location &&
      orderType === Types.Types.TOrderType.LOCAL &&
      address?.location &&
      Logics.GeoLocation.distanceBetweenTwoLocations(address.location, location) > 500
    ) {
      toggleShowLocationAlertAlert()
      return
    }
    await forward()
  }

  async function forward() {
    Stores.Loading.instance.start()
    const products: Types.CCart[] = []
    products.push(
      ...$Products.map(CartProduct => {
        const product: Types.CCart = Types.CCart.fromObject(CartProduct.toJSON())
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
      orderType === Types.Types.TOrderType.DELIVERY ? delivery : 0,
      products,
      address!,
      payment!.type!,
      $Settings.preparation ?? Types.Classes.CVendorPreparation.fillWith(undefined),
      couponObject,
      undefined,
      undefined,
      undefined,
      undefined,
      payment,
      undefined,
      location,
      orderType,
      orderType === Types.Types.TOrderType.LOCAL ? $Settings.tip : 0,
      orderType === Types.Types.TOrderType.LOCAL ? table : undefined,
      payment!.type! === Types.Types.TPaymentMethod.CASH_ON_DELIVERY ? Number(change) : undefined
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
    if (coupon && orderType && coupon.length >= 3) {
      Stores.Loading.instance.start()
      const payload = Types.Classes.CCoupon.init(coupon, 0, subtotal, Types.Types.TDiscount.NO, undefined, undefined, [
        orderType
      ])
      const response = await AddCoupon(payload)
      if (response?.success) {
        couponObject = Types.Classes.CCoupon.fromObject(response.data)
        if ((couponObject?.minValue ?? 0) > subtotal) {
          Stores.MessageAlert.instance?.show(
            `Este cupom é válido apenas para compras assim do ${Utils.Strings.currency(couponObject?.minValue ?? 0)}`
          )
          couponObject = undefined
        }
      } else {
        couponObject = undefined
        Stores.MessageAlert.instance?.show(response?.data ?? 'E')
      }
      Stores.Loading.instance.stop()
    }
  }

  function removeCoupon() {
    couponObject = undefined
    coupon = undefined
  }

  function toggleShowLocationAlertAlert() {
    showLocationAlertAlert = !showLocationAlertAlert
  }

  function manageCard() {
    Stores.Navigation.instance.goTo(Routes.payments)
  }

  function manageAddress() {
    Stores.Navigation.instance.goTo(Routes.addresses)
  }

  async function requestGeoLocation() {
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
  }

  onMount(async () => {
    try {
      orderType = await OrderType.get()
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
      if (orderType === Types.Types.TOrderType.DELIVERY) {
        response = await GetAddresses()
        if (response?.success) {
          const data: Types.Classes.CAddress[] = Types.Classes.CAddress.fromObject(response.data)
          const addresses = data.filter(address => address.selected)
          address = (addresses?.length ?? 0) === 1 ? addresses[0] : null
        } else {
          address = null
        }
      }
      response = await GetPaymentMethods()
      if (response?.success) {
        const data: Types.Classes.CPaymentMethod[] = Types.Classes.CPaymentMethod.fromObject(response.data)
        const payments = data.filter(paymentMethod => paymentMethod.selected)
        payment = (payments?.length ?? 0) === 1 ? payments[0] : undefined
      }
      await requestGeoLocation()
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
                  (product.quantity ?? 0) *
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
    <tr class="spacer" />
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
    marginTop={16}
    bind:value={coupon}
    placeHolder="Adicionar cupom"
    buttonName="Adicionar"
    callback={addCoupon}
    type={Types.TTextEdit.ALPHA_NUMERIC}
    upper={true}
  />
{/if}
<Views.Button type={Types.TButton.TRANSPARENT} on:click={addMoreItems}>Adicionar mais itens</Views.Button>
{#if orderType === Types.Types.TOrderType.DELIVERY}
  <Views.Divider height={16} />
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
    <Views.Status type={Types.Status.WARNING}>Para continuar precisa selecionar ou adicionar um endereço</Views.Status>
  {/if}
{:else if orderType === Types.Types.TOrderType.LOCAL}
  <Views.TextEdit
    marginTop={16}
    placeHolder="Símbolo da mesa"
    bind:value={table}
    initialValue={table}
    type={Types.TTextEdit.ALPHA_NUMERIC}
    min={1}
    max={50}
  />
  {#if !table}
    <Views.Divider height={8} />
    <Views.Status type={Types.Status.WARNING}>Para continuar precisa digitar o símbolo da mesa.</Views.Status>
  {/if}
{/if}
<Views.Divider height={16} />
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
        {:else if payment?.type === Types.Types.TPaymentMethod.CASH_ON_DELIVERY}
          <Views.TextEdit
            placeHolder="Troco para quanto?"
            bind:value={change}
            initialValue={change}
            type={Types.TTextEdit.CURRENCY}
          />
          <!-- //TODO: -- 'undefined' bug fix -->
          {#if isNaN(Number(change)) || Number(change) <= 0}
            <Views.Divider height={8} />
            <Views.Status type={Types.Status.WARNING}
              >Para continuar precisa digitar o valor total das notas ou cédulas que vai usar para o pagamento, para que
              o garçom ou entregador já leva o seu troco.</Views.Status
            >
          {/if}
        {/if}
      </span>
    </div>
  </div>
{:else}
  <Views.Status type={Types.Status.WARNING}
    >Para continuar precisa selecionar ou adicionar uma forma de pagamento.</Views.Status
  >
{/if}
{#if businessTime}
  <Views.Button disabled={!validate} isFloat={true} on:click={canForward}>
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
{#if showLocationAlertAlert}
  <Views.Alert
    title="Alerta"
    message={`Você está longe do endereço da entrega cadastrado, verifique se o endereço da entrega está correto.`}
    closeCallBack={toggleShowLocationAlertAlert}
    buttons={[
      {
        name: 'Quero verificar',
        callback: toggleShowLocationAlertAlert,
        principal: true
      },
      {
        name: 'Continuar',
        callback: forward
      }
    ]}
  />
{/if}

<style>
  .product {
    font-family: RobotoLight;
    font-size: 0.9em;
    margin-top: 16pt;
    margin-bottom: 0;
    display: flex;
    justify-content: space-between;
    border-bottom: 1pt solid #ccc;
    border-left: 1pt solid #ccc;
    display: flex;
    flex-direction: column;
  }
  .product > small {
    margin-left: 8pt;
  }
  .product > header > .quantity {
    margin-right: 8pt;
    font-family: RobotoMedium;
    font-size: 1em;
    background: #ccc;
    width: 24pt;
    height: 24pt;
    padding: 4pt;
    text-align: center;
    vertical-align: middle;
  }
  .product > header > .price {
    margin-left: 8pt;
    font-family: RobotoMedium;
    font-size: 0.9em;
  }
  .product > div {
    margin-left: 16pt;
    margin-bottom: 8pt;
    margin-top: 8pt;
    font-size: 0.9em;
  }
  .product > div > .option > .units {
    margin-right: 8pt;
    font-family: RobotoMedium;
    font-size: 1em;
    background: rgba(204, 204, 204, 0.356);
    width: 24pt;
    height: 24pt;
    padding: 0 4pt;
    text-align: center;
    vertical-align: middle;
  }
  .product > div > .option > .price {
    margin-left: 8pt;
    font-family: RobotoMedium;
    font-size: 0.9em;
  }
  .paymentCard {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: 16pt;
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
    height: 16pt;
    width: auto;
  }
  .paymentCard > .content > .brand {
    font-weight: lighter;
    font-size: 1em;
    width: 100%;
    margin-top: 8pt;
  }
  .address {
    width: 100%;
    display: flex;
    justify-content: space-between;
    border-bottom: 1pt solid #ccc;
    padding: 16pt 0;
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
    padding-top: 16pt;
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
    margin-top: 24pt;
  }
</style>
