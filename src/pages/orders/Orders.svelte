<script>
  import {
    Title,
    Navigation,
    Routes,
    Router,
    Menu,
  } from "../../stores/Navigation";
  import { getOrders, OrderStatus } from "../../network/Orders";
  import { Views, Utils } from "@ikomida/components";
  import { PaymentType } from "../../network/Payment";
  import { StatusBar } from "../../stores/Setup";
  import { faHistory, faSync } from "@fortawesome/free-solid-svg-icons";
  import Cache from "../../stores/Cache";
  let orders;

  let hasMore = true;
  let canGetMore = true;
  let lastTimestamp = null;

  async function getMore(e, refresh = false) {
    if (refresh || (canGetMore && hasMore)) {
      isLoading = true;
      const timestamp = refresh
        ? 0
        : orders?.[orders.length - 1]?.timestamp ?? -1;
      canGetMore = false;
      orders = Cache.getObject(CACHE_NAME);
      const newOrders = await getOrders($Router.options, timestamp);
      hasMore = newOrders.length > 0;
      orders = refresh
        ? newOrders
        : orders
        ? [...orders, ...newOrders]
        : newOrders;
      orders.sort((item1, item2) => item2.timestamp - item1.timestamp);
      Cache.setObject(CACHE_NAME, orders);
      canGetMore = refresh || lastTimestamp !== timestamp;
      lastTimestamp = timestamp;
      isLoading = false;
    }
  }

  async function update() {
    orders = Cache.getObject(CACHE_NAME);
    if (!orders) {
      await getMore(null, true);
    }
  }

  async function refresh() {
    await getMore(null, true);
  }

  let isLoading = false;
  $: CACHE_NAME = $Router?.options ? "ORDERS_HISTORY" : "ORDERS";
  $: if ($Router?.options === null || $Router?.options !== null) {
    // if (!$Router?.options) {
    //   Menu.addItem({
    //     icon: faHistory,
    //     name: "Pedidos concluídos",
    //     callback: goToOrdersHistory,
    //   });
    // }
    Menu.addItem({ name: "Atualizar", icon: faSync, callback: refresh });
    update();
  }

  function goToOrder(id) {
    const order = orders?.find((order) => {
      return order?.id === id;
    });
    Navigation.goTo(Routes.order, { newOrder: false, order });
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
{#if (orders?.length ?? 0) > 0}
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
        <h3 class={["delivered"].includes(status) ? "delivered" : ""}>
          Pedido {OrderStatus(status)}
        </h3>
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
    <Views.Divider />
    {#if hasMore && !canGetMore}
      <Views.LocalLoading />
    {:else}
      <Views.Button disabled={!hasMore || !canGetMore} on:click={getMore}
        >carregar mais</Views.Button
      >
    {/if}
  </div>
{:else}
  <div id="noOrders">
    <h2>
      Não há pedido para exibir, aproveite e faça seu primeiro pedido agora
      mesmo!
    </h2>
  </div>
{/if}

<style>
  #noOrders {
    display: flex;
    flex-direction: row;
    height: 100%;
  }
  #noOrders > h2 {
    place-self: center;
    align-self: center;
    justify-self: center;
    text-align: center;
  }
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
    color: rgb(0, 177, 0);
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
    background-color: #4c0708;
    border-radius: 6px;
    color: white;
    padding: 4px 20px;
    align-self: center;
    margin-bottom: 10px;
  }
</style>
