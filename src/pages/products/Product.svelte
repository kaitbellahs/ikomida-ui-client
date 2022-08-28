<script>
  import { Cart, Store } from "../../stores/Cart";
  import Routes from "../../stores/Routes";
  import Fa from "svelte-fa";
  import { v4 as uuidV4 } from "uuid";
  import {
    faPlusSquare,
    faMinusSquare,
    faCartPlus,
  } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Utils, Logics, Types, Stores } from "@ikomida/components";
  import { Layout } from "../../stores/Setup";

  const router = Stores.Navigation.instance.router;
  const item = $router.options;
  let quantity = 1;
  let showImage = true;

  $: total = Utils.Strings.currency(
    quantity *
      (item.price -
        Logics.Finances.calcDiscount(
          item.price,
          item.discount,
          item.discountType
        ))
  );

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
    let update = false;
    const cardItems = $Store;
    for (const cardItem of cardItems) {
      if (
        item?.id === cardItem.id &&
        cardItem?.quantity + quantity <= item?.quantity
      ) {
        cardItem.quantity += quantity;
        update = true;
      }
    }
    if (update) {
      await Cart.update(cardItems);
    } else {
      item.leftQuantity = item.quantity;
      item.quantity = quantity;
      item.uuid = uuidV4();
      await Cart.addItem(item);
    }
    Stores.Navigation.instance.goTo(Routes.cart);
  };

  function erroLoadImage(event) {
    showImage = false;
  }

  Stores.Title.instance.set(item.title);
</script>

<div class="product">
  {#if item.image && showImage}
    <img
      class="image"
      on:error={erroLoadImage}
      src={item.image}
      alt={item.title}
    />
  {/if}
  <h2>{item.title}</h2>
  <p>{item.description}</p>
  <span class="serves"
    >Aproximadamente {Logics.Finances.formatWeight(item.weight)}</span
  >

  <div class="price">
    {#if [Types.DiscountTypes.PERCENT, Types.DiscountTypes.VALUE].includes(Types.DiscountTypes[item.discountType])}
      <span class="oldPrice">{Utils.Strings.currency(item.price)}</span>
    {/if}
    <span class="current"
      >{Utils.Strings.currency(
        item.price -
          Logics.Finances.calcDiscount(
            item.price,
            item.discount,
            item.discountType
          )
      )}</span
    >
  </div>
  <div class="quantity">
    <Views.Button {Layout} type="transparent" size="none" on:click={minos}>
      <Fa icon={faMinusSquare} /></Views.Button
    ><span>{quantity}</span><Views.Button
      {Layout}
      type="transparent"
      size="none"
      on:click={plus}><Fa icon={faPlusSquare} /></Views.Button
    >
  </div>
  <Views.Button
    {Layout}
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
  .product > img.image {
    margin-bottom: 10px;
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
    font-size: 1rem;
  }
  .current {
    color: green;
    font-size: 1.5em;
    margin-top: 10px;
  }
  p {
    font-size: 1.1rem;
    font-weight: lighter;
    margin: 10px 0;
  }
  .serves {
    font-size: 1rem;
  }
  img {
    width: 100%;
    max-width: 100%;
    object-fit: contain;
  }
</style>
