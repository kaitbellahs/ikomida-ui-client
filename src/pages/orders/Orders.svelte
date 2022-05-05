<script>
  import {
    Title,
    Navigation,
    Routes,
    Router,
    Menu,
  } from "../../stores/Navigation";
  import { GetOrders, OrderStatus } from "../../network/Orders";
  import { Views, Utils } from "@tian/components";
  import { PaymentType } from "../../network/Payment";
  import { StatusBar } from "../../stores/Setup";
  import { faHistory } from "@fortawesome/free-solid-svg-icons";

  let isLoading = false;
  let orders = [];

  $: if ($Router.options === null || $Router.options !== null) {
    if ($Router.options === null || !$Router.options) {
      Menu.addItem({
        icon: faHistory,
        name: "Históricos",
        callback: goToOrdersHistory,
      });
    }
    update();
  }

  function goToOrder(id) {
    const order = orders?.find((order) => {
      return order?.id === id;
    });
    Navigation.goTo(Routes.order, { newOrder: false, order });
  }

  async function update() {
    isLoading = true;
    orders = await GetOrders($Router.options);
    isLoading = false;
  }

  function goToOrdersHistory() {
    Navigation.goTo(Routes.orders, true);
  }

  Title.set("Pedidos");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<div>
  {#each orders as { id, status, products, address, payment, createdAt, preparation }}
    <div class="leftShadow orderContainer" on:click={goToOrder(id)}>
      {#if ["waitingPayment", "open", "accepted", "waitingDelivery", "delivery"].includes(status)}
        {#if new Date(new Date(createdAt).getTime() + (preparation?.max + address?.duration) * 1000) < new Date()}
          <span class="lateOrder">Pedido atrasado</span>
        {/if}
        <span class="deliveryForecast">Previsão de entrega</span>
        <span class="deliveryForecastValue">
          entre
          {Utils.Strings.dateToString(
            new Date(createdAt).getTime() +
              (preparation?.min + address?.duration) * 1000
          )} e {Utils.Strings.dateToString(
            new Date(createdAt).getTime() +
              (preparation?.max + address?.duration) * 1000
          )}</span
        >
      {/if}
      <h3 class={["delivered"].includes(status) ? 'delivered' : ''}>Pedido {OrderStatus(status)}</h3>
      {#if products.length > 0}
        <div class="product">1. {products[0].title}</div>
      {/if}
      {#if products.length > 1}
        <div class="product">
          e mais {products.length - 1}
          {products.length - 1 == 1 ? "item" : "itens"}
        </div>
      {/if}
      <div class="address">Entregue em: <b>{address.street}</b></div>
      <div class="paymentMethod">
        Forma de pagamento: <b>{PaymentType(payment.type)}</b>
      </div>
      <div class="time">{Utils.Strings.dateToString(createdAt)}</div>
    </div>
  {/each}
</div>

<style>
  .orderContainer {
    border-radius: 4px;
    border: 1px solid #ccc;
    padding: 20px;
    margin-bottom: 10px;
    margin-top: 10px;
    background: #eeeeee33;
    display: flex;
    flex-direction: column;
  }
  .orderContainer > h3 {
    padding: 0;
    margin: 0;
    font-size: 1.1em;
    margin-bottom: 10px;
    margin-top: 10px;
  }
  .orderContainer > h3.delivered {
    color:rgb(0, 177, 0);
  }
  .orderContainer > .product {
    font-family: RobotoLight;
    font-size: 0.9em;
    margin-bottom: 10px;
  }
  .orderContainer > .address {
    font-family: RobotoThin;
    font-size: 0.9em;
    margin-bottom: 2px;
  }
  .orderContainer > .paymentMethod {
    font-family: RobotoThin;
    font-size: 0.9em;
    margin-bottom: 2px;
  }
  .orderContainer > .time {
    font-family: RobotoThin;
    font-size: 0.8em;
  }
  .orderContainer > .deliveryForecast {
    font-size: 1.1em;
    color: #00000099;
  }
  .orderContainer > .deliveryForecastValue {
    color: rgb(0, 177, 0);
  }
  .orderContainer > .lateOrder {
    background-color: red;
    border-radius: 6px;
    color: white;
    padding: 4px 20px;
    align-self: center;
    margin-bottom: 10px;
  }
</style>
