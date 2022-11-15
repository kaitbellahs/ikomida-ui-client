<script lang="ts">
  import Routes from '../../stores/Routes'
  import { OrderStatus } from '../../network/Orders'
  import { Views, Utils, Types, Stores, Logics } from '@ikomida/shared-frontend'
  import { onMount } from 'svelte'
  import { Writable } from 'svelte/store'
  let Layout: Writable<Types.Classes.CLayout | undefined> = Stores.Layout.instance.store

  let orderType: Types.Types.TOrderType | undefined = undefined
  let items: Types.Classes.COrder[]

  $: if (orderType) {
    Stores.LoadMore.instance.refresh()
  }

  $: if (items) {
    for (let index = 0; index < items.length; index++) {
      items[index] = Types.Classes.COrder.fromObject(items[index])
    }
    items = items
  }

  onMount(async () => {
    Stores.Loading.instance.stop()
  })

  function goToOrder(order: Types.Classes.COrder) {
    Stores.Navigation.instance.goTo(Routes.order, {
      newOrder: false,
      order
    })
  }

  Stores.Title.instance.set('Pedidos')
</script>

<div class="filters">
  <Views.Selector bind:selected={orderType} options={Types.Types.TOrderType.values()} name="Tipo dos pedidos" />
</div>
<Views.LoadMoreReusableList
  noItems="Não há pedido para exibir por enquanto, aproveite e faça seu primeiro pedido agora!"
  cache={Stores.Cache.Types.ORDERS}
  url="/orders"
  params={orderType ? { orderType: orderType?.id } : undefined}
  bind:items
  hasRecaptcha={true}
  let:item
  let:index
>
  <div class="leftShadow orderContainer" style="--itemBackground: {$Layout?.itemBackground || '#ffffffab'};">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
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
      <Views.Status type={Types.Status.INFO} showIcon={false}
        >Pedido para {items[index].orderType?.description ?? '-'}</Views.Status
      >
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
      {#if items[index].orderType === Types.Types.TOrderType.DELIVERY}
        <Views.Divider height={5} />
        <div class="address">
          Entregua na: <b>{items[index].address?.street ?? '-'}</b>
        </div>
      {:else if items[index].orderType === Types.Types.TOrderType.PICKUP}
        <Views.Divider height={5} />
        <h3>Seu cliente vai retirar o pedido no seu estabelecimento.</h3>
      {:else if items[index].orderType === Types.Types.TOrderType.LOCAL}
        <Views.Divider height={5} />
        <h3>Leva o pedido até a mesa: <b>{items[index].table}</b></h3>
      {:else}
        <Views.Status type={Types.Status.ERROR}
          >Não foi possível definir o tipo do pedido, entre em contato com o suporte.</Views.Status
        >
      {/if}
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
          Number(items[index].subtotal ?? 0) +
            Number(
              items[index].orderType === Types.Types.TOrderType.DELIVERY
                ? items[index].delivery
                : items[index].orderType === Types.Types.TOrderType.LOCAL
                ? Logics.Finances.calcDiscount(
                    items[index].subtotal ?? 0,
                    items[index].tip ?? 0,
                    Types.Types.TDiscount.PERCENT
                  )
                : 0
            ) -
            Number(items[index].discount ?? 0)
        )}</span
      >
    </div>
  </div>
</Views.LoadMoreReusableList>

<style>
  .orderContainer {
    padding: 16pt;
    background: var(--itemBackground);
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
