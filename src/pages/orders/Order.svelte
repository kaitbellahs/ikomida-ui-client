<script>
  import { Share } from "@capacitor/share";
  import { onMount } from "svelte";
  import html2canvas from "html2canvas";
  import { Views, Utils, Types } from "@ikomida/components";
  import { faShare } from "@fortawesome/free-solid-svg-icons";
  import { Filesystem, Directory } from "@capacitor/filesystem";
  import {
    Navigation,
    Title,
    Router,
    Routes,
    Menu,
  } from "../../stores/Navigation";
  import { OrderStatus, ChangeOrderStatus } from "../../network/Orders";
  import { StatusBar } from "../../stores/Setup";
  import { Layout, Settings } from "../../stores/Setup";

  const { newOrder, order } = $Router.options;
  let isLoading = false;
  let screenShot = false;
  let showImage = true;
  let orderScreen;

  $: if (newOrder) {
    Navigation.backCallBack = () => {
      Navigation.reset(Routes.orders);
    };
  }

  async function changeOrderStatus(status) {
    isLoading = true;
    const response = await ChangeOrderStatus(order?.id, status);
    const orderStatus = response?.data;
    if (
      response?.success &&
      orderStatus?.id === order?.id &&
      orderStatus?.status === status
    ) {
      order.status = orderStatus?.status;
      order.finishedAt = orderStatus?.finishedAt;
      toggleErrorAlert("O pedido foi atualizado com sucesso!");
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }
  async function delivered() {
    await changeOrderStatus(Types.OrderStatusType.DELIVERED);
  }
  async function cancel() {
    await changeOrderStatus(Types.OrderStatusType.CANCELED);
  }
  let errorAlert;
  let showAlert = false;
  $: total =
    Number(order?.subtotal ?? 0) +
    Number(order?.delivery ?? 0) -
    Number(order?.discount ?? 0);

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  async function share() {
    async function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    // const checkPermissions = await Filesystem.checkPermissions();
    // console.log(checkPermissions);
    // if (checkPermissions === "denied") {
    //   return;
    // }
    // if (
    //   checkPermissions !== "granted" &&
    //   (await Filesystem.requestPermissions()) !== "granted"
    // ) {
    //   return;
    // }
    isLoading = true;
    screenShot = true;
    await sleep(1);
    const canvas = await html2canvas(orderScreen, {
      logging: false,
      backgroundColor: "#dfdfdf",
    });
    screenShot = false;
    isLoading = false;
    const data = canvas.toDataURL().split(",");
    const screenShotFile = await Filesystem.writeFile({
      path: `screenshots/order-${order?.customID}.jpg`,
      data: data?.[1],
      directory: Directory.Cache,
      recursive: true,
    });
    //TODO: -- report identifier of the app that received the share action. Can be an empty string in some cases. On web it will be undefined.
    const activityType = await Share.share({
      title: `Pedido #${order?.customID}`,
      text: "Eu estou compartilhando com você meu pedido",
      url: `file://${screenShotFile?.uri}`,
      dialogTitle: "Compartilhar o pedido",
    });
  }
  onMount(async () => {
    if (await Share.canShare()) {
      Menu.addItem({ name: "Compartilhar", icon: faShare, callback: share });
    }
  });
  function erroLoadImage(event) {
    showImage = false;
  }
  Title.set("Detalhes do predido");
</script>

<div class="order {screenShot ? 'screenShot' : ''}" bind:this={orderScreen}>
  <div class="avatar {screenShot ? 'screenShot' : ''}">
    <div class="avatar">
      {#if $Settings?.profile?.mainPicture && showImage}
        <img
          on:error={erroLoadImage}
          src={$Settings?.profile?.mainPicture ??
            "assets/icons/transparent-logo-1.svg"}
          alt={$Settings?.profile?.restaurantName ?? "iKomida"}
        />
      {:else if $Settings?.profile?.restaurantName}
        <h1>{$Settings?.profile?.restaurantName}</h1>
      {:else}
        <img src="assets/icons/transparent-logo-1.svg" alt="iKomida" />
        <h2>{$Settings?.profile?.restaurantName}</h2>
      {/if}
    </div>
    <Views.Divider height="30" />
  </div>
  {#if [Types.OrderStatusType.WAITING_PAYMENT, Types.OrderStatusType.OPEN, Types.OrderStatusType.ACCEPTED, Types.OrderStatusType.WAITING_DELIVERY, Types.OrderStatusType.IN_DELIVERY].includes(order.status) && new Date(new Date(order?.createdAt).getTime() + order?.preparation?.max * 1000) < new Date()}
    <Views.Status
      {Layout}
      type={Views.Status.Types.ERROR}
      circle={false}
      showIcon={false}>Pedido atrasado</Views.Status
    >
  {/if}
  {#if [Types.OrderStatusType.DELIVERED].includes(order.status)}
    <Views.Status {Layout} type={Views.Status.Types.SUCCESS} circle={true}
      >Pedido entregue</Views.Status
    >
  {/if}
  {#if [Types.OrderStatusType.CANCELED].includes(order.status)}
    <Views.Status {Layout} type={Views.Status.Types.ERROR} circle={false}
      >Pedido cancelado</Views.Status
    >
  {/if}
  <Views.Divider />
  <h3 class="title">Pedido N˚: {order?.customID}</h3>
  <Views.Divider />

  {#if ![Types.OrderStatusType.DELIVERED, Types.OrderStatusType.CANCELED].includes(order.status)}
    <Views.Status {Layout}>
      Pedido {OrderStatus(order?.status)}
    </Views.Status>
    <Views.Divider />
  {/if}
  <span class="time"
    >Data: {Utils.Strings.timestampToString(order?.createdAt)}</span
  >
  <Views.Divider />
  <h3>Itens a entregar</h3>
  {#each order?.products as { id, title, price, quantity, discount, discountType }, index}
    <div class="product">
      <span class="quantity">{quantity}</span><span class="title">{title}</span
      ><span class="price"
        >{Utils.Strings.currency(
          quantity *
            (price - Utils.Numbers.calcDiscount(price, discount, discountType))
        )}</span
      >
    </div>
  {/each}
  <Views.Divider />
  <h3>Dados da entrega</h3>
  <div class="address">
    Endereço:
    <span class="street"
      >{order?.address?.street}, {order?.address?.number}{order?.address
        ?.complement
        ? ` - ${order?.address?.complement}`
        : ""}</span
    ><br />
    <span class="neighborhood"
      >{order?.address?.neighborhood}<br />
      <span class="city"
        >{order?.address?.city}/{order?.address?.stat} CEP: {order?.address
          ?.postalCode}</span
      >
    </span>
  </div>
  <Views.Divider />
  <h3>Dados de pagamento</h3>
  <Views.Divider />
  <div class="paymentMethod">
    <span
      >Pago com <b
        >{new Types.PaymentMethodType(order?.payment.type).name}
        {new Types.PaymentMethodType(order?.payment.type).description}</b
      ></span
    >
    <span class="brand">
      {#if order?.payment.type === Types.PaymentMethodType.CREDIT_CARD_ONLINE}
        <img
          src="/Assets/cardBrand/{order?.payment.brand}.svg"
          alt={order?.payment.brand}
        />
        **** {order?.payment.lastDigits}
      {/if}
    </span>
  </div>
  <div data-html2canvas-ignore class="buttonGroup">
    {#if [Types.OrderStatusType.WAITING_PAYMENT, Types.OrderStatusType.OPEN].includes(order?.status)}
      <Views.Button multiplier="0.8" type="secondary" on:click={cancel}
        >Cancelar</Views.Button
      >
    {/if}
    {#if [Types.OrderStatusType.OPEN, Types.OrderStatusType.ACCEPTED, Types.OrderStatusType.WAITING_DELIVERY, Types.OrderStatusType.IN_DELIVERY].includes(order?.status)}
      <Views.Button multiplier="1" on:click={delivered}
        >Confirmar entrega</Views.Button
      >
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
        <td class="resumeValue">{Utils.Strings.currency(order?.subtotal)}</td>
      </tr>
      {#if Number(order?.discount) > 0}
        <tr>
          <td class="resumeText">Desconto</td>
          <td class="resumeValue"
            ><span class="deliveryFree"
              >- {Utils.Strings.currency(order?.discount)}</span
            ></td
          >
        </tr><tr>
          <td class="coupon" colspan="2"
            >{order?.coupon?.name?.toUpperCase()} (- {order?.coupon?.type?.toUpperCase() ===
            Types?.DiscountTypes?.PERCENT?.toUpperCase()
              ? Utils.Strings.percent(order?.coupon?.value)
              : Utils.Strings.currency(order?.coupon?.value)})</td
          >
        </tr>
      {/if}
      <tr>
        <td class="resumeText">Taxa de entrega</td>
        <td class="resumeValue"
          ><span class:deliveryFree={order?.delivery == 0}
            >{Utils.Strings.currency(order?.delivery)}</span
          ></td
        >
      </tr>
      <tr>
        <td class="resumeText"><b>Total</b></td>
        <td class="resumeValue"><b>{Utils.Strings.currency(total)}</b></td>
      </tr>
    </tbody>
  </table>

  <div class="signature {screenShot ? 'screenShot' : ''}">
    <Views.Divider height="30" />
    <span>Feito com carinho por</span><img
      src="assets/icons/transparent-logo-1.svg"
      alt="iKomida"
    />
  </div>
</div>
<Views.GTerms />
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}

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
  .product > .quantity {
    font-family: RobotoMedium;
    font-size: 1em;
    background: #ccc;
    width: 20px;
    height: 20px;
    padding: 2px;
    text-align: center;
    vertical-align: middle;
  }
  .product > .quantity {
    font-family: RobotoMedium;
    font-size: 1em;
  }
  .address {
    font-size: 0.9em;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  .address > .street {
    font-family: "RobotoMedium";
    margin-bottom: 10px;
  }
  .address > .neighborhood {
    font-family: "RobotoMedium";
    font-size: 1em;
    width: 100%;
  }
  .paymentMethod {
    font-size: 0.9em;
    margin-bottom: 5px;
    display: flex;
    flex-direction: column;
  }
  .paymentMethod > .brand > img {
    height: 14px;
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
  .avatar > img {
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
  .signature > img {
    height: 45px;
  }
</style>
