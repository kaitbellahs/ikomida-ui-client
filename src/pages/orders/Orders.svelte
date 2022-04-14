<script>
  import { Title, Navigation, Routes } from "../../stores/Navigation";
  import { GetOrders, OrderStatus } from "../../network/Orders";
  import { Views, Utils } from "@tian/components";
  import { onMount } from "svelte";
  import { PaymentType } from "../../network/Payment";
  import { StatusBar } from "../../stores/Setup";

  let isLoading = false;
  let orders = [];

  function goToOrder(id) {
    const order = orders.find((order) => {
      return order.id === id;
    });
    Navigation.goTo(Routes.order, order);
  }

  onMount(async () => {
    isLoading = true;
    const response = await GetOrders();
    if (response?.success) {
      orders = response?.data;
    }
    isLoading = false;
  });

  Title.set("Pedidos");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<div>
  {#each orders as { id, status, discount, products, address, payment, createdAt, finishedAt, subtotal, coupon, delivery }}
    <div class="leftShadow orderContainer" on:click={goToOrder(id)}>
      <h3>#{id}: pedido {OrderStatus(status)}</h3>
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
        {console.log(payment)}
        Forma de pagamento: <b>{PaymentType(payment.type)}</b>
      </div>
      <div class="time">{Utils.Strings.timestampToString(createdAt)}</div>
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
  }
  .orderContainer > h3 {
    padding: 0;
    margin: 0;
    font-size: 1.1em;
    margin-bottom: 5px;
  }
  .orderContainer > .product {
    font-family: RobotoLight;
    font-size: 0.9em;
    margin-bottom: 2px;
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
    font-size: 0.6em;
  }
</style>
