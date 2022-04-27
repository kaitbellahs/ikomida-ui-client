<script>
  import { Title, Router, Routes, Navigation } from "../../stores/Navigation";
  import { OrderStatus, OrderStage } from "../../network/Orders";
  import { Utils } from "@tian/components";
  import { PaymentType } from "../../network/Payment";
  
  const { newOrder, order } = $Router.options;

  $: total =
    Number(order.subtotal) + Number(order.delivery) - Number(order.discount);

  $: if (newOrder) {
    Navigation.backCallBack = () => {
      Navigation.reset(Routes.orders);
    };
  }
  Title.set("Detalhes do predido");
</script>

<div class="time">Feito {Utils.Strings.dateToString(order.createdAt)}</div>
<div class="status">
  {#if ["waitingPayment", "open", "accepted", "waitingDelivery", "delivery"].includes(order.status)}
    Seu pedido está
    <span class="open">{OrderStage(order.status)}</span>
  {:else}
    Pedido {OrderStatus(order.status)} em
    <span class="open">{Utils.Strings.dateToString(order.finishedAt)}</span>
  {/if}
</div>
{#each order.products as { title, price, discount, discountType, quantity }, index}
  <div class="product">
    <span class="quantity">{quantity}</span><span class="title">{title}</span
    ><span class="price"
      >{Utils.Strings.currency(
        quantity * Utils.Numbers.calcDiscount(price, discount, discountType)
      )}</span
    >
  </div>
{/each}
<div class="address">Entregue em: <b>{order.address.street}</b></div>
<div class="paymentMethod">
  Forma de pagamento: <b>{PaymentType(order.payment.type)}</b>
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
      <td class="resumeValue">{Utils.Strings.currency(order.subtotal)}</td>
    </tr>
    {#if order.discount != 0}
      <tr>
        <td class="resumeText">Desconto</td>
        <td class="resumeValue"
          ><span class="deliveryFree"
            >- {Utils.Strings.currency(order.discount)}</span
          ></td
        >
      </tr>
    {/if}
    <tr>
      <td class="resumeText">Taxa de entrega</td>
      <td class="resumeValue"
        ><span class:deliveryFree={order.delivery == 0}
          >{Utils.Strings.currency(order.delivery)}</span
        ></td
      >
    </tr>
    <tr>
      <td class="resumeText"><b>Total</b></td>
      <td class="resumeValue"><b>{Utils.Strings.currency(total)}</b></td>
    </tr>
  </tbody>
</table>

<style>
  h3 {
    padding: 0;
    margin: 0;
    font-size: 1.1em;
    margin-bottom: 5px;
    margin-top: 10px;
  }
  .status {
    margin-bottom: 10px;
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
</style>
