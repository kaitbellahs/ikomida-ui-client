<script>
  import { Cart, Store } from "../../stores/Cart";
  import CartItem from "../../components/CartItem.svelte";
  import { Title, Navigation, Router, Menu } from "../../stores/Navigation";
  import { currency } from "../../Utils/Strings";
  import { faTrash } from "@fortawesome/free-solid-svg-icons";
  import Alert from "../../components/Alert.svelte";
  import Button from "../../components/Button.svelte";
  import { StatusBar } from "../../stores/Setup";

  let showAlert = false;

  $: subtotalArray = $Store.map((item) => item.quantity * item.price);
  $: subtotal =
    subtotalArray.length > 0 ? subtotalArray.reduce((a, b) => a + b) : 0;
  $: delivery = 0;
  $: total = subtotal + delivery;
  $: styleBottomPadding = $StatusBar.bottomPadding + 45 + "px";

  function addMoreItems() {
    Navigation.pop(2);
  }

  function resetCart() {
    Cart.reset();
    Navigation.reset(Router.values.home);
  }

  function toggleAlert() {
    showAlert = !showAlert;
  }

  function forward() {
    Navigation.goTo(Router.values.checkout);
  }

  Title.set("Sacola de compras");
  Menu.addItem({ name: "Limpar", icon: faTrash, callback: toggleAlert });
</script>

{#if showAlert}
  <Alert
    title="Alerta"
    message="Você tem certeza que quer remover todos produtos do carrinho de compras?"
    closeCallBack={toggleAlert}
    buttons={[
      { name: "Não", callback: toggleAlert },
      { name: "Sim", callback: resetCart },
    ]}
  />
{/if}

{#each $Store as { title, description, serves, price, oldPrice, src, weight, quantity }}
  <CartItem
    {title}
    {description}
    {serves}
    {price}
    {oldPrice}
    {src}
    {weight}
    {quantity}
  />
{/each}
<Button type="transparent" on:click={addMoreItems}>Addionar mais itens</Button>
<table>
  <thead>
    <tr>
      <th colspan="2" class="resumeHead">Resumo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="resumeText">Subtotal</td>
      <td class="resumeValue">{currency(subtotal)}</td>
    </tr>
    <tr>
      <td class="resumeText">Taxa de entrega</td>
      <td class="resumeValue"
        ><span class:deliveryFree={delivery == 0}>{currency(delivery)}</span
        ></td
      >
    </tr>
    <tr>
      <td class="resumeText">Total</td>
      <td class="resumeValue">{currency(total)}</td>
    </tr>
  </tbody>
</table>
<Button
  isFloat={true}
  on:click={forward}
  style="--bottomPadding:{styleBottomPadding}"><span>Continuar</span></Button
>

<style>
  .forward {
    position: fixed;
    left: 2px;
    right: 0;
    bottom: var(--bottomPadding);
  }
  .addMore {
    background: transparent;
  }
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
