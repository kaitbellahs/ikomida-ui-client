<script lang="ts">
  import Routes from '../../stores/Routes';
  import { OrderStatus } from '../../network/Orders';
  import { Views, Utils, Types, Stores } from '@ikomida/shared-frontend';
  import { onMount } from 'svelte';

  let items: Types.Classes.COrder[];

  $: if (items) {
    for (let index = 0; index < items.length; index++) {
      items[index] = Types.Classes.COrder.fromObject(items[index]);
    }
    items = items;
  }

  onMount(async () => {
    Stores.Loading.instance.stop();
  });

  function goToOrder(order: Types.Classes.COrder) {
    Stores.Navigation.instance.goTo(Routes.order, {
      newOrder: false,
      order,
    });
  }

  Stores.Title.instance.set('Pedidos');
</script>

<Views.LoadMoreReusableList
  noItems="Não há pedido para exibir por enquanto, aproveite e faça seu primeiro pedido agora!"
  cache={Stores.Cache.Types.ORDERS}
  url="/orders"
  bind:items
  hasRecaptcha={true}
  let:item
  let:index
>
  <div class="leftShadow orderContainer">
    <div on:click={() => goToOrder(items[index])}>
      <h3 class="title">Pedido N˚: {items[index].customID}</h3>
      {#if items[index].status && [Types.Types.TOrderStatus.WAITING_PAYMENT, Types.Types.TOrderStatus.OPEN, Types.Types.TOrderStatus.ACCEPTED, Types.Types.TOrderStatus.WAITING_DELIVERY, Types.Types.TOrderStatus.IN_DELIVERY].includes(items[index].status ?? Types.Types.TOrderStatus.CANCELED) && new Date((items[index].createdAt?.getTime() ?? 0) + items[index].preparation?.max * 1000) < new Date()}
        <Views.Status type={Types.Status.ERROR} circle={false} showIcon={false}>Pedido atrasado</Views.Status>
      {/if}
      {#if items[index].status && [Types.Types.TOrderStatus.DELIVERED].includes(items[index].status ?? Types.Types.TOrderStatus.CANCELED)}
        <Views.Status type={Types.Status.SUCCESS} circle={false} showIcon={false}>Pedido entregue</Views.Status>
      {/if}
      {#if items[index].status && [Types.Types.TOrderStatus.CANCELED].includes(items[index].status ?? Types.Types.TOrderStatus.CANCELED)}
        <Views.Status type={Types.Status.ERROR} circle={false} showIcon={false}>Pedido cancelado</Views.Status>
      {/if}
      <Views.Divider height={5} />
      {#if !items[index].status || ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED].includes(items[index].status ?? Types.Types.TOrderStatus.CANCELED)}
        <Views.Status>
          Pedido {OrderStatus(items[index].status)}
        </Views.Status>
        <Views.Divider height={5} />
      {/if}
      <div class="time">
        Data: {Utils.Strings.dateToString(items[index].createdAt)}
      </div>
      <Views.Divider height={10} />
      {#if items[index].products?.length > 0}
        <div class="product">1. {items[index].products?.[0]?.title}</div>
      {/if}
      {#if items[index].products?.length > 1}
        <div class="product">
          e mais {items[index].products?.length - 1}
          {items[index].products?.length - 1 == 1 ? 'item' : 'itens'}
        </div>
      {/if}
      <Views.Divider height={5} />
      <div class="address">
        Entregua na: <b>{items[index].address.street ?? '-'}</b>
      </div>
      <div class="paymentMethod">
        Forma de pagamento: <b
          >{items[index].payment?.type.name}
          {items[index].payment?.type.description}</b
        >
      </div>
    </div>
    <Views.Divider height={10} />
    <div class="value">
      Total:&nbsp;<span
        >{Utils.Strings.currency(
          Number(items[index].subtotal ?? 0) + Number(items[index].delivery ?? 0) - Number(items[index].discount ?? 0),
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
