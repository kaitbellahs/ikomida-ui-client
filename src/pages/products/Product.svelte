<script>
  import { Cart } from "../../stores/Cart";
  import { Title, Navigation, Router, Routes } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import {
    faPlusSquare,
    faMinusSquare,
    faCartPlus,
  } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Utils, Network } from "@tian/components";

  const item = $Router.options;
  let quantity = 1;

  $: total = Utils.Strings.currency(quantity * item.price);

  function minos() {
    if (quantity > 1) {
      quantity--;
    }
  }

  function plus() {
    if (quantity < item.quantity) {
      quantity++;
    }
  }

  const addProduct = async () => {
    item.quantity = quantity;
    await Cart.addItem(item);
    Navigation.goTo(Routes.cart);
  };

  Title.set(item.title);
</script>

<div class="product">
  {#if item.image}
    <img
      src={`${Network.instance.devApiServer}/image/${item.image}`}
      alt={item.title}
    />
  {/if}
  <h2>{item.title}</h2>
  <p>{item.description}</p>
  <span class="serves"
    >Aproximadamente {Utils.Strings.formatNumber(item.weight)} Kg</span
  >

  <div class="price">
    <span class:current={item.oldPrice != undefined && item.oldPrice != 0}
      >{Utils.Strings.currency(item.price)}</span
    >
    {#if item.oldPrice != undefined && item.oldPrice != 0}
      <span class="oldPrice">{Utils.Strings.currency(item.oldPrice)}</span>
    {/if}
  </div>
  <div class="quantity">
    <Views.Button type="transparent" size="none" on:click={minos}>
      <Fa icon={faMinusSquare} /></Views.Button
    ><span>{quantity}</span><Views.Button
      type="transparent"
      size="none"
      on:click={plus}><Fa icon={faPlusSquare} /></Views.Button
    >
  </div>
  <Views.Button
    isFloat="true"
    on:click={addProduct}
    bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faCartPlus} /> <span>Adicionar</span>
    <span>({total})</span></Views.Button
  >
</div>

<style>
  .product {
    padding-bottom: 50px;
  }
  .quantity {
    margin-top: 10px;
    align-items: center;
    font-size: 1.8em;
    text-align: center;
  }
  .quantity > span {
    padding: 0;
    border: 0;
    background: transparent;
    margin-right: 10px;
    margin-left: 10px;
  }
  .price {
    margin-top: 20px;
    width: 100%;
    min-width: 100%;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
  }
  .oldPrice {
    text-decoration: line-through;
    color: #717171;
    font-size: 0.8rem;
  }
  .current {
    color: green;
    font-size: 1.5em;
    margin-top: 10px;
  }
  p {
    font-size: 0.8rem;
    font-weight: lighter;
    margin: 10px 0;
  }
  .serves {
    font-size: 0.8rem;
  }
  img {
    width: 100%;
    max-width: 100%;
  }
</style>
