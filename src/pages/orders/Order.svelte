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

  const router = Stores.Navigation.instance.router
  const newOrder: boolean = $router.options.newOrder
  const order: Types.Classes.COrder = Types.Classes.COrder.fromObject($router.options.order)

  let screenShot = false
  let orderScreen: HTMLElement

  $: if (newOrder) {
    Stores.Navigation.instance.setBack(() => {
      Stores.Navigation.instance.reset(Routes.orders)
    })
  }
  $: total = Number(order.subtotal ?? 0) + Number(order.delivery ?? 0) - Number(order.discount ?? 0)

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
      text: 'Eu estou compartilhando com você meu pedido',
      url: `file://${screenShotFile?.uri}`,
      dialogTitle: 'Compartilhar o pedido'
    })
  }

  onMount(async () => {
    if (await Share.canShare()) {
      Stores.Menu.instance.addItem({
        name: 'Compartilhar',
        icon: faShare,
        callback: share
      })
    }
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
          <h4>Opções do produto:</h4>
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
    </div>
  {/each}
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
    </span>
  </div>
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
      {/if}
    </span>
  </div>
  <div data-html2canvas-ignore class="buttonGroup">
    {#if order.status && [Types.Types.TOrderStatus.WAITING_PAYMENT, Types.Types.TOrderStatus.OPEN].includes(order.status)}
      <Views.Button sizeMultiplier={0.8} type={Types.TButton.SECONDARY} on:click={cancel}>Cancelar</Views.Button>
    {/if}
    {#if order.status && [Types.Types.TOrderStatus.OPEN, Types.Types.TOrderStatus.ACCEPTED, Types.Types.TOrderStatus.WAITING_DELIVERY, Types.Types.TOrderStatus.IN_DELIVERY].includes(order.status)}
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
      <tr>
        <td class="resumeText">Taxa de entrega</td>
        <td class="resumeValue"
          ><span class:deliveryFree={order.delivery == 0}>{Utils.Strings.currency(order.delivery)}</span></td
        >
      </tr>
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
    padding: 20px;
  }
  .product {
    font-family: RobotoLight;
    font-size: 0.9em;
    margin-top: 10px;
    margin-bottom: 0;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ccc;
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
  .product > div > .option > .units {
    margin-right: 5px;
    font-family: RobotoMedium;
    font-size: 1em;
    background: rgba(204, 204, 204, 0.356);
    width: 20px;
    height: 20px;
    padding: 2px;
    text-align: center;
    vertical-align: middle;
  }
  .product > div > .option > .price {
    margin-left: 5px;
    font-family: RobotoMedium;
    font-size: 0.9em;
  }
  .address {
    font-size: 0.9em;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  .address > .street {
    font-family: 'RobotoMedium';
    margin-bottom: 10px;
  }
  .address > .neighborhood {
    font-family: 'RobotoMedium';
    font-size: 1em;
    width: 100%;
  }
  .paymentMethod {
    font-size: 0.9em;
    margin-bottom: 5px;
    display: flex;
    flex-direction: column;
  }
  .paymentMethod > .brand > :global(img) {
    height: 14px;
    width: auto;
  }
  .paymentMethod > .brand {
    font-weight: lighter;
    font-size: 1em;
    width: 100%;
    margin-top: 5px;
  }
  .time {
    font-size: 0.8em;
    margin-top: 5px;
  }
  table {
    width: 100%;
    padding-bottom: 10px;
  }
  .resumeHead {
    font-size: 1.1em;
  }
  .resumeText {
    text-align: left;
    width: 50%;
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
    margin-top: 20px;
  }
  .order > .buttonGroup > :global(*) {
    flex: 1;
  }
  .order > .buttonGroup > :global(*):first-child {
    margin-right: 5px;
  }
  .order > .buttonGroup > :global(*):last-child {
    margin-left: 5px;
  }
  .order > h3 {
    border-left: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    padding: 0 20px;
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
    border-radius: 45px;
    line-height: 90px;
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
    height: 45px;
    width: auto;
  }
</style>
