<script>
  import { Title, Navigation, Router } from "../../stores/Navigation";
  import { GetOrders, OrderStatus } from "../../network/Orders";
  import { timestampToString } from "../../Utils/Strings";
  import Loading from "../../components/Loading.svelte";
  import { onMount } from "svelte";
  import { PaymentType } from "../../network/Payment";
  
  let isLoading = false;
  let orders = [];
  
  function goToOrder(id) {
    const order = orders.find((order) => {
      return order.id === id;
    });
    Navigation.goTo(Router.values.order, order);
  }

  onMount(async () => {
    isLoading = true;
    orders = await GetOrders();
    isLoading = false;
  });

  Title.set("Pedidos");
</script>
{#if isLoading}
<Loading />
{/if}
<div>
  {#each orders as { id, status, stage, products, address, payment, created, finished, subtotal, coupon, delivery }}
    <div class="leftShadow orderContainer" on:click={goToOrder(id)}>
      <h3>#{id}: pedido {OrderStatus(status)}</h3>
      {#if products.length > 0}
        <div class="product">1. {products[0].title}</div>
      {/if}
      {#if products.length > 1}
        <div class="product">e mais {products.length - 1} {products.length - 1 == 1 ? "item" : "itens"}</div>
      {/if}
      <div class="address">Entregue em: <b>{address.address}</b></div>
      <div class="paymentMethod">Forma de pagamento: <b>{PaymentType(payment.type)}</b></div>
      <div class="time">{timestampToString(created)}</div>
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
