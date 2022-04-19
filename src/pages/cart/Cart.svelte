<script>
  import { Cart, Store } from "../../stores/Cart";
  import { Title, Navigation, Routes, Menu } from "../../stores/Navigation";
  import { faTrash } from "@fortawesome/free-solid-svg-icons";
  import { Views, Utils } from "@tian/components";
  import { Layout } from "../../stores/Setup";

  let showAlert = false;

  $: subtotalArray = $Store.map(
    (item) =>
      item.quantity *
      Utils.Numbers.calcDiscount(item.price, item.discount, item.discountType)
  );
  $: subtotal =
    subtotalArray.length > 0 ? subtotalArray.reduce((a, b) => a + b) : 0;
  $: delivery = 0;
  $: total = subtotal + delivery;

  function addMoreItems() {
    Navigation.pop(2);
  }

  function resetCart() {
    Cart.reset();
    Navigation.reset(Routes.home);
  }

  function toggleAlert() {
    showAlert = !showAlert;
  }

  function forward() {
    Navigation.goTo(Routes.checkout);
  }

  Title.set("Sacola de compras");
  Menu.addItem({ name: "Limpar", icon: faTrash, callback: toggleAlert });
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

{#each $Store as item}
  <Views.CartItem {Layout} {...item} />
{/each}
<Views.Button {Layout} type="transparent" on:click={addMoreItems}
  >Addionar mais itens</Views.Button
>
<table>
  <thead>
    <tr>
      <th colspan="2" class="resumeHead">Resumo</th>
    </tr>
  </thead>
  <tbody>
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
