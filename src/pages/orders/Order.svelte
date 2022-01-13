<script>
  import { Title, Navigation, Router } from "../../stores/Navigation";
  import { GetOrders, OrderStatus } from "../../network/Orders";
  import { timestampToString, currency } from "../../Utils/Strings";
  import Loading from "../../components/Loading.svelte";
  import { PaymentType } from "../../network/Payment";

  const order = $Router.options;

  $: total = order.subtotal + order.delivery - order.coupon;
  
  Title.set("Detalhes do predido");
</script>

<span class="time">Feito {timestampToString(order.created)}</span>
<h3>Pedido #{order.id}</h3>
<span class="status">
  {#if order.status == "open"}
    Seu pedido está
    <span>{order.stage}</span>
  {:else}
    {OrderStatus(order.status)} em
    <span class="time">{timestampToString(order.finished)}</span>
  {/if}
</span>
{#each order.products as { title, price, quantity }, index}
  <div class="product">
    <span class="quantity">{quantity}</span><span class="title">{title}</span
    ><span class="price">{currency(quantity * price)}</span>
  </div>
{/each}
<div class="address">Entregue em: <b>{order.address.address}</b></div>
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
      <td class="resumeValue">{currency(order.subtotal)}</td>
    </tr>
    {#if order.coupon > 0}
      <tr>
        <td class="resumeText">Taxa de entrega</td>
        <td class="resumeValue"
          ><span class="deliveryFree">- {currency(order.coupon)}</span></td
        >
      </tr>
    {/if}
    <tr>
      <td class="resumeText">Taxa de entrega</td>
      <td class="resumeValue"
        ><span class:deliveryFree={order.delivery == 0}
          >{currency(order.delivery)}</span
        ></td
      >
    </tr>
    <tr>
      <td class="resumeText"><b>Total</b></td>
      <td class="resumeValue"><b>{currency(total)}</b></td>
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
    font-size: 0.6em;
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
