<script>
  import { Title, Router, Routes, Navigation } from "../../stores/Navigation";
  import { OrderStatus } from "../../network/Orders";
  import { Utils, Types, Views } from "@ikomida/components";
  import { PaymentType } from "../../network/Payment";
  import { ChangeOrderStatus } from "../../network/Orders";
  import { StatusBar } from "../../stores/Setup";
  import Cache from "../../stores/Cache";

  $: CACHE_NAME = "ORDERS";

  const { newOrder, order } = $Router.options;
  let isLoading = false;

  let errorAlert;
  let showAlert = false;

  $: total =
    Number(order?.subtotal ?? 0) +
    Number(order?.delivery ?? 0) -
    Number(order?.discount ?? 0);

  $: if (newOrder) {
    Navigation.backCallBack = () => {
      Navigation.reset(Routes.orders);
    };
  }

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
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
      Cache.setObject(CACHE_NAME, null);
      toggleErrorAlert("O pedido foi atualizado con sucesso!");
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function cancel() {
    await changeOrderStatus(Types.OrderStatusType.CANCELED);
  }

  async function delivered() {
    await changeOrderStatus(Types.OrderStatusType.DELIVERED);
  }

  Title.set("Detalhes do predido");
</script>

<h3>N˚ do pedido: {order?.customID}</h3>
<div class="time">Realizado {Utils.Strings.dateToString(order?.createdAt)}</div>
<div class="status">
  {#if [Types.OrderStatusType.WAITING_PAYMENT, Types.OrderStatusType.OPEN, Types.OrderStatusType.ACCEPTED, Types.OrderStatusType.WAITING_DELIVERY, Types.OrderStatusType.IN_DELIVERY].includes(order.status)}
    {#if new Date(new Date(order?.createdAt).getTime() + ((order?.preparation?.max ?? 0) + (order?.address?.duration ?? 0)) * 1000) < new Date()}
      <span class="lateOrder">Pedido atrasado</span>
    {/if}
    <span class="deliveryForecast">Previsão de entrega</span>
    <span class="deliveryForecastValue">
      entre
      {Utils.Strings.dateToString(
        new Date(order?.createdAt).getTime() +
          ((order?.preparation?.min ?? 0) + (order?.address?.duration ?? 0)) *
            1000
      )} e {Utils.Strings.dateToString(
        new Date(order.createdAt).getTime() +
          ((order?.preparation?.max ?? 0) + (order?.address?.duration ?? 0)) *
            1000
      )}</span
    >
    Seu pedido está
    <span class="open">{OrderStatus(order?.status)}</span>
  {:else}
    Pedido {OrderStatus(order?.status)} em
    <span class="open">{Utils.Strings.dateToString(order?.finishedAt)}</span>
  {/if}
</div>
{#each order.products as { title, price, discount, discountType, quantity }, index}
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

<div class="address">Entregue em: <b>{order?.address?.street}</b></div>
<div class="paymentMethod">
  Forma de pagamento: <b>{PaymentType(order?.payment?.type)}</b>
</div>
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
    {#if order?.discount != 0}
      <tr>
        <td class="resumeText">Desconto</td>
        <td class="resumeValue"
          ><span class="deliveryFree"
            >- {Utils.Strings.currency(order?.discount)}</span
          ></td
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
<Views.Divider />
<div class="buttonGroup">
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
<Views.GTerms />
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}

<style>
  h3 {
    padding: 0;
    margin: 0;
    font-size: 1.1em;
    margin-bottom: 5px;
    margin-top: 20px;
    text-align: center;
  }
  .status {
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
  }
  .status > .open {
    font-size: 1.2em;
    font-family: "RobotoBold";
    color: green;
  }
  .product {
    font-family: RobotoLight;
    font-size: 0.9em;
    margin-top: 20px;
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
    font-family: RobotoThin;
    font-size: 0.9em;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  .paymentMethod {
    font-family: RobotoThin;
    font-size: 0.9em;
    margin-bottom: 5px;
  }
  .time {
    font-family: RobotoThin;
    font-size: 1em;
    margin-top: 5px;
    width: 100%;
    margin: 25px 0 10px 0;
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
  .status > .deliveryForecast {
    font-size: 1.1em;
    color: #00000099;
  }
  .status > .deliveryForecastValue {
    color: rgb(0, 177, 0);
    margin-bottom: 10px;
  }
  .status > .lateOrder {
    background-color: #4c0708;
    border-radius: 6px;
    color: white;
    padding: 4px 20px;
    align-self: center;
    margin-bottom: 10px;
  }
  .buttonGroup {
    display: flex;
    flex-direction: row;
    margin-top: 20px;
  }
  .buttonGroup > :global(*) {
    flex: 1;
  }
  .buttonGroup > :global(*):first-child {
    margin-right: 5px;
  }
  .buttonGroup > :global(*):last-child {
    margin-left: 5px;
  }
</style>
