<script lang="ts">
  import { Cart } from '../../stores/Cart';
  import Routes from '../../stores/Routes';
  import Fa from 'svelte-fa';
  import { faPlusSquare, faMinusSquare, faCartPlus } from '@fortawesome/free-solid-svg-icons';
  import { StatusBar } from '../../stores/Setup';
  import { Views, Utils, Logics, Types, Stores } from '@ikomida/shared-frontend';
  import { onMount } from 'svelte';

  const router = Stores.Navigation.instance.router;
  const cartProduct: Types.CCart = Types.CCart.fromObject($router.options);
  let quantity = 1;
  let showImage = true;

  $: total = Utils.Strings.currency(
    quantity *
      (cartProduct.price -
        Logics.Finances.calcDiscount(cartProduct.price, cartProduct.discount, cartProduct.discountType)),
  );

  function minos() {
    if (quantity > 1) {
      quantity--;
    }
  }

  function plus() {
    if (quantity < cartProduct.quantity) {
      quantity++;
    }
  }

  const addProduct = async () => {
    let update = false;
    const cardItems = await Cart.instance.products();
    for (const cardItem of cardItems) {
      if (cartProduct.id === cardItem.id && cardItem?.quantity + quantity <= cartProduct.quantity) {
        cardItem.quantity += quantity;
        update = true;
      }
    }
    if (update) {
      await Cart.instance.update(cardItems);
    } else {
      cartProduct.leftQuantity = cartProduct.quantity;
      cartProduct.quantity = quantity;
      await Cart.instance.addProduct(cartProduct);
    }
    Stores.Navigation.instance.goTo(Routes.cart);
  };

  function erroLoadImage() {
    showImage = false;
  }

  onMount(() => Stores.Loading.instance.stop());

  Stores.Title.instance.set(cartProduct.title);
</script>

<div class="product">
  {#if cartProduct.image && showImage}
    <img class="image" on:error={erroLoadImage} src={cartProduct.image} alt={cartProduct.title} />
  {/if}
  <h2>{cartProduct.title}</h2>
  <p>{cartProduct.description}</p>
  <span class="serves">Aproximadamente {Logics.Finances.formatWeight(cartProduct.weight ?? 0)}</span>

  <div class="price">
    {#if [Types.Types.TDiscount.PERCENT, Types.Types.TDiscount.VALUE].includes(cartProduct.discountType)}
      <span class="oldPrice">{Utils.Strings.currency(cartProduct.price)}</span>
    {/if}
    <span class="current"
      >{Utils.Strings.currency(
        cartProduct.price -
          Logics.Finances.calcDiscount(cartProduct.price, cartProduct.discount, cartProduct.discountType),
      )}</span
    >
  </div>
  <div class="quantity">
    <Views.Button type="transparent" size="none" on:click={minos}>
      <Fa icon={faMinusSquare} /></Views.Button
    ><span>{quantity}</span><Views.Button type="transparent" size="none" on:click={plus}
      ><Fa icon={faPlusSquare} /></Views.Button
    >
  </div>
  <Views.Button isFloat={true} on:click={addProduct} bottomPadding={$StatusBar.bottomPadding}
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
