<script>
  import Routes from "../../stores/Routes";
  import { getOrders, OrderStatus } from "../../network/Orders";
  import { Views, Utils, Types, Stores } from "@ikomida/components";
  import { faSync } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";

  onMount(async () => {
    Stores.Loading.instance.stop();
  });

  function goToOrder(order) {
    Stores.Navigation.instance.goTo(Routes.order, {
      newOrder: false,
      order,
    });
  }

  Stores.Title.instance.set("Pedidos");
</script>

<Views.LoadMoreReusableList
  noItems="Não há pedido para exibir por enquanto, aproveite e faça seu primeiro pedido agora!"
  cache={Stores.Cache.Types.ORDERS}
  url="/orders"
  let:item
>
  <div class="leftShadow orderContainer">
    <div on:click={goToOrder(item)}>
      <h3 class="title">Pedido N˚: {item?.customID}</h3>
      {#if [Types.OrderStatusType.WAITING_PAYMENT, Types.OrderStatusType.OPEN, Types.OrderStatusType.ACCEPTED, Types.OrderStatusType.WAITING_DELIVERY, Types.OrderStatusType.IN_DELIVERY].includes(item?.status) && new Date(new Date(item?.createdAt).getTime() + item?.preparation?.max * 1000) < new Date()}
        <Views.Status
          type={Views.Status.Types.ERROR}
          circle={false}
          showIcon={false}>Pedido atrasado</Views.Status
        >
      {/if}
      {#if [Types.OrderStatusType.DELIVERED].includes(item?.status)}
        <Views.Status
          type={Views.Status.Types.SUCCESS}
          circle={false}
          showIcon={false}>Pedido entregue</Views.Status
        >
      {/if}
      {#if [Types.OrderStatusType.CANCELED].includes(item?.status)}
        <Views.Status
          type={Views.Status.Types.ERROR}
          circle={false}
          showIcon={false}>Pedido cancelado</Views.Status
        >
      {/if}
      <Views.Divider height="5" />
      {#if ![Types.OrderStatusType.DELIVERED, Types.OrderStatusType.CANCELED].includes(item?.status)}
        <Views.Status>
          Pedido {OrderStatus(item?.status)}
        </Views.Status>
        <Views.Divider height="5" />
      {/if}
      <div class="time">
        Data: {Utils.Strings.dateToString(item?.createdAt)}
      </div>
      <Views.Divider height="10" />
      {#if item?.products?.length > 0}
        <div class="product">1. {item?.products?.[0]?.title}</div>
      {/if}
      {#if item?.products?.length > 1}
        <div class="product">
          e mais {item?.products?.length - 1}
          {item?.products?.length - 1 == 1 ? "item" : "itens"}
        </div>
      {/if}
      <Views.Divider height="5" />
      <div class="address">
        Entregua na: <b>{item?.address.street ?? "-"}</b>
      </div>
      <div class="paymentMethod">
        Forma de pagamento: <b
          >{new Types.PaymentMethodType(item?.payment.type).name}
          {new Types.PaymentMethodType(item?.payment.type).description}</b
        >
      </div>
    </div>
    <Views.Divider height="10" />
    <div class="value">
      Total:&nbsp;<span
        >{Utils.Strings.currency(
          Number(item?.subtotal ?? 0) +
            Number(item?.delivery ?? 0) -
            Number(item?.discount ?? 0)
        )}</span
      >
    </div>
  </div>
  <Views.Divider />
</Views.LoadMoreReusableList>

<style>
  .orderContainer {
    border-radius: 4px;
    border: 1px solid #ccc;
    padding: 20px;
    background: #eeeeee33;
    display: flex;
    flex-direction: column;
  }
  .orderContainer > div {
    display: flex;
    flex-direction: column;
  }
  .orderContainer > div > h3 {
    padding: 0;
    font-size: 1.1em;
    text-align: center;
  }
  .orderContainer > div > .product {
    font-family: RobotoLight;
    font-size: 0.9em;
  }
  .orderContainer > div > .address {
    font-family: RobotoThin;
    font-size: 0.9em;
  }
  .orderContainer > div > .paymentMethod {
    font-family: RobotoThin;
    font-size: 0.9em;
  }
  .time {
    font-size: 0.8em;
  }
  .orderContainer > .value {
    display: flex;
    flex-direction: row;
    align-self: center;
  }
  .orderContainer > .value > span {
    color: green;
    font-size: 1.1em;
  }
</style>
