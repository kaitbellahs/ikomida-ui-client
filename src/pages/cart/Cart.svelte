<script>
  import { Cart, Store } from "../../stores/Cart";
  import Routes from "../../stores/Routes";
  import { faTrash } from "@fortawesome/free-solid-svg-icons";
  import { Views, Utils, Logics, Stores } from "@ikomida/components";
  import { Layout, Settings } from "../../stores/Setup";
  import { GetAddresses } from "../../network/User";
  import { onMount } from "svelte";

  let showAlert = false;
  let address;

  $: subtotalArray = $Store.map(
    (item) =>
      item.quantity *
      (item?.price -
        Logics.Finances.calcDiscount(
          item.price,
          item.discount,
          item.discountType
        ))
  );
  $: subtotal =
    subtotalArray.length > 0 ? subtotalArray.reduce((a, b) => a + b) : 0;
  $: calcDelivery = address
    ? ((address?.distance ?? 0) / 1000) * ($Settings?.delivery?.value ?? 0)
    : 0;
  $: delivery = $Settings?.delivery?.free
    ? 0
    : calcDelivery < $Settings?.delivery?.min
    ? $Settings?.delivery?.min
    : calcDelivery;
  $: total = subtotal + delivery;

  function addMoreItems() {
    Stores.Navigation.instance.pop(2);
  }

  function resetCart() {
    Cart.reset();
    Stores.Navigation.instance.reset(Routes.home);
  }

  function toggleAlert() {
    showAlert = !showAlert;
  }

  function forward() {
    Stores.Navigation.instance.goTo(Routes.checkout);
  }

  async function onRemoveClick(uuid) {
    await Cart.update($Store.filter((item) => item?.uuid !== uuid));
  }

  async function onPlusClick(uuid) {
    let update = false;
    const items = $Store;
    for (const item of items) {
      if (item?.uuid === uuid && item?.quantity < item?.leftQuantity) {
        item.quantity++;
        update = true;
      }
    }
    if (update) {
      await Cart.update(items);
    }
  }

  async function onMinosClick(uuid) {
    let update = false;
    const items = $Store;
    for (const item of items) {
      if (item?.uuid === uuid) {
        if (item?.quantity > 1) {
          item.quantity--;
          update = true;
        } else {
          await onRemoveClick(uuid);
        }
      }
    }
    if (update) {
      await Cart.update(items);
    }
  }

  onMount(async () => {
    let response = await GetAddresses();
    if (response?.success) {
      const addresses = response?.data?.filter((item) => item.selected);
      address = (addresses?.length ?? 0) === 1 ? addresses[0] : null;
    }
  });

  Stores.Title.instance.set("Sacola de compras");
  Stores.Menu.instance.addItem({
    name: "Limpar",
    icon: faTrash,
    callback: toggleAlert,
  });
</script>

{#if showAlert}
  <Views.Alert
    {Layout}
    title="Alerta"
    message="Você tem certeza que quer remover todos produtos do carrinho de compras?"
    closeCallBack={toggleAlert}
    buttons={[
      { name: "Não", callback: toggleAlert, principal: true },
      { name: "Sim", callback: resetCart },
    ]}
  />
{/if}

{#each $Store as item (item?.id)}
  <Views.CartItem
    {Layout}
    {onRemoveClick}
    {onPlusClick}
    {onMinosClick}
    {...item}
  />
{/each}
<Views.Button {Layout} type="transparent" on:click={addMoreItems}
  >Adicionar mais itens</Views.Button
>
<table>
  <thead>
    <tr>
      <th colspan="2" class="resumeHead">Resumo</th>
    </tr>
  </thead>
  <tbody>
    {#if address}
      <tr>
        <td class="resumeText">Taxa de entrega</td>
        <td class="resumeValue"
          ><span class:deliveryFree={delivery == 0}
            >{delivery == 0 ? "Gratis" : Utils.Strings.currency(delivery)}</span
          ></td
        >
      </tr>
    {/if}
    <tr>
      <td class="resumeText">Total</td>
      <td class="resumeValue">{Utils.Strings.currency(total)}</td>
    </tr>
  </tbody>
</table>
<Views.Button {Layout} isFloat={true} on:click={forward}
  ><span>Continuar</span></Views.Button
>

<style>
  table {
    width: 100%;
    padding-bottom: 55px;
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
