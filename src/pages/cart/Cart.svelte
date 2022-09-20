<script lang="ts">
  import { Cart } from '../../stores/Cart';
  import type { IStore } from '../../stores/Cart';
  import Routes from '../../stores/Routes';
  import { faTrash } from '@fortawesome/free-solid-svg-icons';
  import { Views, Utils, Logics, Stores, Types } from '@ikomida/shared-frontend';
  import { Settings } from '../../stores/Setup';
  import { GetAddresses } from '../../network/User';
  import { onMount } from 'svelte';

  let Products: IStore;
  let showAlert = false;
  let address: Types.Classes.CAddress | null;

  $: subtotalArray = $Products.map(
    (product) =>
      product.quantity *
      (product?.price - Logics.Finances.calcDiscount(product.price, product.discount, product.discountType)),
  );
  $: subtotal = subtotalArray.length > 0 ? subtotalArray.reduce((a, b) => a + b) : 0;
  $: calcDelivery = address ? ((address?.distance ?? 0) / 1000) * ($Settings?.delivery?.value ?? 0) : 0;
  $: delivery = $Settings?.delivery?.free
    ? 0
    : calcDelivery < $Settings?.delivery?.min
    ? $Settings?.delivery?.min
    : calcDelivery;
  $: total = subtotal + delivery;

  function addMoreProducts() {
    Stores.Navigation.instance.pop(2);
  }

  async function resetCart() {
    await Cart.instance.reset();
    Stores.Navigation.instance.reset(Routes.home);
  }

  function toggleAlert() {
    showAlert = !showAlert;
  }

  function forward() {
    Stores.Navigation.instance.goTo(Routes.checkout);
  }

  async function onRemoveClick(id?: string) {
    await Cart.instance.update($Products.filter((product) => product?.id !== id));
  }

  async function onPlusClick(id?: string) {
    let update = false;
    const products = $Products;
    for (const product of products) {
      if (product?.id === id && product?.quantity < product?.leftQuantity) {
        product.quantity++;
        update = true;
      }
    }
    if (update) {
      await Cart.instance.update(products);
    }
  }

  async function onMinosClick(id?: string) {
    let update = false;
    const products = $Products;
    for (const product of products) {
      if (product?.id === id) {
        if (product?.quantity > 1) {
          product.quantity--;
          update = true;
        } else {
          await onRemoveClick(id);
        }
      }
    }
    if (update) {
      await Cart.instance.update(products);
    }
  }

  onMount(async () => {
    let response = await GetAddresses();
    if (response?.success) {
      const data: Types.Classes.CAddress[] = Types.Classes.CAddress.fromObject(response?.data);
      const addresses = data.filter((address) => address.selected);
      address = (addresses?.length ?? 0) === 1 ? addresses[0] : null;
    }
    Products = await Cart.instance.store();
    Stores.Loading.instance.stop();
  });

  Stores.Title.instance.set('Sacola de compras');
  Stores.Menu.instance.addItem({
    name: 'Limpar',
    icon: faTrash,
    callback: toggleAlert,
  });
</script>

{#if showAlert}
  <Views.Alert
    title="Alerta"
    message="Você tem certeza que quer remover todos produtos do carrinho de compras?"
    closeCallBack={toggleAlert}
    buttons={[
      { name: 'Não', callback: toggleAlert, principal: true },
      { name: 'Sim', callback: resetCart },
    ]}
  />
{/if}

{#each $Products as product, index (product?.id ?? index)}
  <Views.CartItem {onRemoveClick} {onPlusClick} {onMinosClick} {product} />
{/each}
<Views.Button type="transparent" on:click={addMoreProducts}>Adicionar mais itens</Views.Button>
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
          ><span class:deliveryFree={delivery == 0}>{delivery == 0 ? 'Gratis' : Utils.Strings.currency(delivery)}</span
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
<Views.Button isFloat={true} on:click={forward}><span>Continuar</span></Views.Button>

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
