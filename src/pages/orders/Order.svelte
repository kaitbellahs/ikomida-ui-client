<script lang="ts">
  import { Share } from '@capacitor/share'
  import { onMount, tick } from 'svelte'
  import html2canvas from 'html2canvas'
  import { Views, Utils, Types, Logics, Stores } from '@ikomida/shared-frontend'
  import { faShare } from '@fortawesome/free-solid-svg-icons'
  import { Filesystem, Directory } from '@capacitor/filesystem'
  import Routes from '../../stores/Routes'
  import { OrderStatus, ChangeOrderStatus } from '../../network/Orders'
  import { Settings } from '../../stores/Setup'
  import { Capacitor } from '@capacitor/core'
  import { GetSettings } from '../../network/User'

  const router = Stores.Navigation.instance.router
  const newOrder: boolean = $router.options.newOrder
  const order: Types.Classes.COrder = $router.options.order

  let screenShot = false
  let orderScreen: HTMLElement

  $: if (newOrder) {
    Stores.Navigation.instance.setBack(() => {
      Stores.Navigation.instance.reset(Routes.orders)
    })
  }

  $: tip = Number(Logics.Finances.calcDiscount(order.subtotal, order.tip ?? 0, Types.Types.TDiscount.PERCENT))
  $: total =
    Number(order.subtotal ?? 0) +
    Number(
      order.orderType === Types.Types.TOrderType.DELIVERY
        ? order.delivery
        : order.orderType === Types.Types.TOrderType.LOCAL
        ? Logics.Finances.calcDiscount(order.subtotal ?? 0, tip ?? 0, Types.Types.TDiscount.PERCENT)
        : 0
    ) -
    Number(order.discount ?? 0)
  $: change = (order.change ?? 0) - total

  async function changeOrderStatus(status: Types.Types.TOrderStatus) {
    Stores.Loading.instance.start()
    const response = await ChangeOrderStatus(order.id, status)
    const orderStatus = Types.Classes.COrder.fromObject(response?.data)
    if (response?.success && orderStatus.id === order.id && orderStatus?.status === status) {
      order.status = orderStatus?.status
      order.finishedAt = orderStatus?.finishedAt
      Stores.MessageAlert.instance.show(
        orderStatus?.status === Types.Types.TOrderStatus.CANCELED
          ? `Seu pedido foi cancelado com sucesso${
              order.payment?.type === Types.Types.TPaymentMethod.CREDIT_CARD_ONLINE
                ? ', e o seu pagamento será estornado no próximo fechamento da fatura do seu cartão de crédito.'
                : '!'
            }`
          : 'Obrigado por nos avisar a entrega do seu pedido'
      )
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  async function delivered() {
    await changeOrderStatus(Types.Types.TOrderStatus.DELIVERED)
  }

  async function cancel() {
    await changeOrderStatus(Types.Types.TOrderStatus.CANCELED)
  }

  async function share() {
    Stores.Loading.instance.start()
    screenShot = true
    await tick()
    const canvas = await html2canvas(orderScreen, {
      logging: false,
      backgroundColor: '#dfdfdf'
    })
    screenShot = false
    await tick()
    Stores.Loading.instance.stop()
    if (Capacitor.isNativePlatform()) {
      const data = canvas.toDataURL().split(',')
      const screenShotFile = await Filesystem.writeFile({
        path: `screenshots/order-${order.customID}.jpg`,
        data: data?.[1],
        directory: Directory.Cache,
        recursive: true
      })
      //TODO: -- report identifier of the app that received the share action. Can be an empty string in some cases. On web it will be undefined.
      const activityType = await Share.share({
        title: `Pedido #${order.customID}`,
        text: 'Olha o que eu comprei!',
        url: `file://${screenShotFile?.uri}`,
        dialogTitle: 'Compartilhar o pedido'
      })
    } else {
      canvas.toBlob(function (blob) {
        if (blob) {
          const url = URL.createObjectURL(blob)
          window.open(url, '_blank')
        }
      })
    }
  }

  onMount(async () => {
    if (await Share.canShare()) {
      Stores.Menu.instance.addItem({
        name: 'Compartilhar',
        icon: faShare,
        callback: share
      })
    }
    if (!('PROFILE' in $Settings) || !$Settings?.profile) {
      const response = await GetSettings()
      if (response?.success) {
        $Settings.profile = response.data.profile
        Settings.set($Settings)
      }
    }
    await tick()
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Detalhes do pedido')
</script>

<div class="order {screenShot ? 'screenShot' : ''}" bind:this={orderScreen}>
  <div class="avatar {screenShot ? 'screenShot' : ''}">
    <div class="avatar">
      {#if $Settings?.profile?.mainPicture}
        <Views.Image
          source={$Settings?.profile?.mainPicture ?? 'assets/icons/transparent-logo-1.svg'}
          name={$Settings?.profile?.contractName ?? 'iKomida'}
        />
      {:else if $Settings?.profile?.contractName}
        <h1>{$Settings?.profile?.contractName}</h1>
      {:else}
        <Views.Image source="assets/icons/transparent-logo-1.svg" name="iKomida" />
        <h2>{$Settings?.profile?.contractName}</h2>
      {/if}
    </div>
    <Views.Divider height={30} />
  </div>
  {#if order.status && [Types.Types.TOrderStatus.WAITING_PAYMENT, Types.Types.TOrderStatus.OPEN, Types.Types.TOrderStatus.ACCEPTED, Types.Types.TOrderStatus.WAITING_DELIVERY, Types.Types.TOrderStatus.IN_DELIVERY].includes(order.status) && new Date((order.createdAt?.getTime() ?? 0) + order.preparation?.max * 1000) < new Date()}
    <Views.Status type={Types.Status.ERROR} circle={false} showIcon={false}>Pedido atrasado</Views.Status>
  {/if}
  {#if order.status && [Types.Types.TOrderStatus.DELIVERED].includes(order.status)}
    <Views.Status type={Types.Status.SUCCESS} circle={true}>Pedido entregue</Views.Status>
  {/if}
  {#if order.status && [Types.Types.TOrderStatus.CANCELED].includes(order.status)}
    <Views.Status type={Types.Status.ERROR} circle={false}>Pedido cancelado</Views.Status>
  {/if}
  <Views.Divider />
  <h3 class="title">Pedido N˚: {order.customID}</h3>
  <Views.Divider />
  <Views.Status type={Types.Status.INFO} showIcon={false}
    >Pedido para {order.orderType?.description ?? '-'}</Views.Status
  >
  <Views.Divider />

  {#if !order.status || ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED].includes(order.status)}
    <Views.Status>
      Pedido {OrderStatus(order.status)}
    </Views.Status>
    <Views.Divider />
  {/if}
  <span class="time">Data: {Utils.Strings.timestampToString(order.createdAt)}</span>
  <Views.Divider />
  <h3>Itens a entregar</h3>
  {#each order.products as product, index (product.id ?? index)}
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
          <!-- <h4>Opções do produto:</h4> -->
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
  {#if order.orderType === Types.Types.TOrderType.DELIVERY}
    <Views.Divider />
    <h3>Dados da entrega</h3>
    <div class="address">
      Endereço:
      <span class="street"
        >{order.address?.street ?? '-'}, {order.address?.number ?? '-'}{order.address?.complement
          ? ` - ${order.address?.complement}`
          : ''}</span
      ><br />
      <span class="neighborhood"
        >{order.address?.neighborhood ?? '-'}<br />
        <span class="city"
          >{order.address?.city ?? '-'}/{order.address?.stat ?? '-'} CEP: {order.address?.postalCode ?? '-'}</span
        >
        <span class="city">Tipo: {order?.address?.kind?.name ?? '-'}</span>
        <span class="city">Ref: {order?.address?.reference ?? '-'}</span>
      </span>
    </div>
  {:else if order.orderType === Types.Types.TOrderType.PICKUP}
    <Views.Divider />
    <h3>Você vai realizar a retirada do pedido.</h3>
  {:else if order.orderType === Types.Types.TOrderType.LOCAL}
    <Views.Divider />
    <h3>O pedido vai até sua mesa: <b>{order.table}</b></h3>
  {:else}
    <Views.Status type={Types.Status.ERROR}
      >Não foi possível definir o tipo do pedido, entre em contato com o suporte.</Views.Status
    >
  {/if}
  <Views.Divider />
  <h3>Dados de pagamento</h3>
  <Views.Divider />
  <div class="paymentMethod">
    <span
      >Pago com <b
        >{order.payment?.type.name}
        {order.payment?.type.description}</b
      ></span
    >
    <span class="brand">
      {#if order.payment?.type === Types.Types.TPaymentMethod.CREDIT_CARD_ONLINE}
        <Views.Image source="/assets/cardBrand/{order.payment.brand}.svg" name={order.payment.brand} />
        **** {order.payment.lastDigits}
      {:else if order.payment?.type === Types.Types.TPaymentMethod.CASH_ON_DELIVERY}
        Você daria <b>{Utils.Strings.currency(order.change)}</b> e receberia <b>{Utils.Strings.currency(change)}</b> de troco.
      {/if}
    </span>
  </div>
  <div data-html2canvas-ignore class="buttonGroup">
    {#if order.status && [Types.Types.TOrderStatus.WAITING_PAYMENT, Types.Types.TOrderStatus.OPEN].includes(order.status)}
      <Views.Button sizeMultiplier={0.8} type={Types.TButton.SECONDARY} on:click={cancel}>Cancelar</Views.Button>
    {/if}
    {#if order.status && [Types.Types.TOrderStatus.OPEN, Types.Types.TOrderStatus.ACCEPTED, Types.Types.TOrderStatus.WAITING_DELIVERY, Types.Types.TOrderStatus.IN_DELIVERY, Types.Types.TOrderStatus.WAITING_LOCAL, Types.Types.TOrderStatus.WAITING_PICKUP, Types.Types.TOrderStatus.IN_TABLE_DELIVERY].includes(order.status)}
      <Views.Button on:click={delivered}>Confirmar<br />a entrega</Views.Button>
    {/if}
  </div>
  <Views.Divider />
  <table>
    <thead>
      <tr>
        <th colspan="2" class="resumeHead">Resumo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="resumeText">Subtotal</td>
        <td class="resumeValue">{Utils.Strings.currency(order.subtotal)}</td>
      </tr>
      {#if Number(order.discount) > 0}
        <tr>
          <td class="resumeText">Desconto</td>
          <td class="resumeValue"><span class="deliveryFree">- {Utils.Strings.currency(order.discount)}</span></td>
        </tr><tr>
          <td class="coupon" colspan="2"
            >{order.coupon?.name?.toUpperCase()} (- {order.coupon?.valueType === Types.Types.TDiscount.PERCENT
              ? Utils.Strings.percent(order.coupon?.value)
              : Utils.Strings.currency(order.coupon?.value)})</td
          >
        </tr>
      {/if}

      {#if order.orderType === Types.Types.TOrderType.DELIVERY}
        <tr>
          <td class="resumeText">Taxa de entrega</td>
          <td class="resumeValue"
            ><span class:deliveryFree={order?.delivery == 0}>{Utils.Strings.currency(order?.delivery)}</span></td
          >
        </tr>
      {:else if order.orderType === Types.Types.TOrderType.LOCAL}
        <tr>
          <td class="resumeText">Gorjeta sugerida ({Utils.Strings.percent(order?.tip ?? 0)})</td>
          <td class="resumeValue"><span class:deliveryFree={order?.tip == 0}>{Utils.Strings.currency(tip)}</span></td>
        </tr>
      {/if}
      <tr>
        <td class="resumeText"><b>Total</b></td>
        <td class="resumeValue"><b>{Utils.Strings.currency(total)}</b></td>
      </tr>
    </tbody>
  </table>

  <div class="signature {screenShot ? 'screenShot' : ''}">
    <Views.Divider height={30} />
    <span>Feito com carinho por</span><Views.Image source="assets/icons/transparent-logo-1.svg" name="iKomida" />
  </div>
</div>
<Views.GTerms />

<style>
  .order {
    display: flex;
    flex-direction: column;
  }
  .order.screenShot {
    padding: 16px;
  }
  .product {
    font-family: RobotoLight;
    font-size: 0.9em;
    margin-top: 16px;
    margin-bottom: 0;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ccc;
    border-left: 1px solid #ccc;
    display: flex;
    flex-direction: column;
  }
  .product > small {
    margin-left: 8px;
  }
  .product > header > .quantity {
    margin-right: 8px;
    font-family: RobotoMedium;
    font-size: 1em;
    background: #ccc;
    width: 24px;
    height: 24px;
    padding: 4px;
    text-align: center;
    vertical-align: middle;
  }
  .product > header > .price {
    margin-left: 8px;
    font-family: RobotoMedium;
    font-size: 0.9em;
  }
  .product > div {
    margin-left: 16px;
    margin-bottom: 8px;
    margin-top: 8px;
    font-size: 0.9em;
  }
  .product > div > .option > .units {
    margin-right: 8px;
    font-family: RobotoMedium;
    font-size: 1em;
    background: rgba(204, 204, 204, 0.356);
    width: 24px;
    height: 24px;
    padding: 0 4px;
    text-align: center;
    vertical-align: middle;
  }
  .product > div > .option > .price {
    margin-left: 8px;
    font-family: RobotoMedium;
    font-size: 0.9em;
  }
  .address {
    font-size: 0.9em;
    margin-top: 16px;
    margin-bottom: 16px;
  }
  .address > .street {
    font-family: 'RobotoMedium';
    margin-bottom: 16px;
  }
  .address > .neighborhood {
    font-family: 'RobotoMedium';
    font-size: 1em;
    width: 100%;
  }
  .paymentMethod {
    font-size: 0.9em;
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
  }
  .paymentMethod > .brand > :global(img) {
    height: 16px;
    width: auto;
  }
  .paymentMethod > .brand {
    font-weight: lighter;
    font-size: 1em;
    width: 100%;
    margin-top: 8px;
  }
  .time {
    font-size: 0.8em;
    margin-top: 8px;
  }
  table {
    width: 100%;
    padding-bottom: 16px;
  }
  .resumeHead {
    font-size: 1.1em;
  }
  .resumeText {
    text-align: left;
    width: 70%;
    font-size: 1em;
    font-weight: lighter;
  }
  .resumeValue {
    text-align: right;
    font-size: 1.1em;
  }
  .coupon {
    text-align: center;
    font-size: 0.8em;
  }
  .deliveryFree {
    color: green;
  }
  .order > .buttonGroup {
    display: flex;
    flex-direction: row;
    margin-top: 16px;
  }
  .order > .buttonGroup > :global(*) {
    flex: 1;
  }
  .order > .buttonGroup > :global(*):first-child {
    margin-right: 8px;
  }
  .order > .buttonGroup > :global(*):last-child {
    margin-left: 8px;
  }
  .order > h3 {
    border-left: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    padding: 0 16px;
    margin: 0;
    font-size: 1.1em;
  }
  .order > h3.title {
    text-align: center;
    border: 0;
  }
  .avatar {
    display: none;
    align-items: center;
    flex-direction: column;
  }
  .avatar.screenShot {
    display: flex;
  }
  .avatar > :global(img) {
    font-size: 3em;
    width: 100%;
    max-width: 100%;
    border-radius: 48px;
    line-height: 88px;
    vertical-align: middle;
    display: table-cell;
    overflow: hidden;
  }
  .signature {
    display: none;
    flex-direction: column;
    align-items: center;
    place-content: center;
  }
  .signature.screenShot {
    display: flex;
  }
  .signature > :global(img) {
    height: 48px;
    width: auto;
  }
</style>
