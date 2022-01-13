<script>
  import { Navigation, Router } from "../stores/Navigation";
  import { currency, formatNumber } from "../Utils/Strings";

  export let id = "";
  export let title = "";
  export let description = "";
  export let serves = 0;
  export let price = 0;
  export let oldPrice = 0;
  export let src = "";
  export let weight = "";
  export let quantity = 0;
  
  $: servesPersons = serves > 1 ? serves + " pessoas" : serves + " pessoa";

  function goToProduct() {
    const options = {
      id,
      title,
      description,
      serves,
      price,
      oldPrice,
      src,
      weight,
      quantity
    };
    Navigation.goTo(Router.values.product, options);
  }
</script>

<div on:click={goToProduct} class="rightShadow item">
  <h3>{title}</h3>
  <div>
    <div class="image">
      <img {src} alt={title} />
    </div>
    <div class="body">
      <h4>
        <span class:current={oldPrice != undefined && oldPrice != 0}
          >{currency(price)}</span
        >
        {#if oldPrice != undefined && oldPrice != 0}
          <span class:oldPrice>{currency(oldPrice)}</span>
        {/if}
      </h4>
      <p>{description}</p>
      <span class:serves
        >Serve até {servesPersons} (≈ {formatNumber(weight)} Kg)</span
      >
    </div>
  </div>
</div>

<style>
  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }
  .item {
    width: 100%;
    margin-bottom: 15px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 20px;
    padding: 10px;
    padding-right: 2px;
    background: #eeeeee33;
  }
  .item > h3 {
    padding: 0;
    margin: 0;
  }
  .item > div {
    display: flex;
    flex-direction: row-reverse;
    justify-content: center;
    padding: 0;
    margin: 0;
  }
  .item > div > div {
    width: 100%;
    min-height: 1px;
    display: flex;
    -o-flex-wrap: wrap;
    flex-wrap: wrap;
  }
  .item > div > .image {
    flex: 0 33%;
    width: 33%;
    max-width: 33%;
  }
  .item > div > .body {
    flex: 0 66%;
    width: 66%;
    max-width: 66%;
  }
  .item > div > .body > * {
    width: 100%;
    min-width: 100%;
  }
  .item > div > .body > h4 {
    margin-top: 8px;
    font-weight: lighter;
  }
  .item > div > .body > h4 > .current {
    color: green;
  }
  .item > div > .body > h4 > .oldPrice {
    text-decoration: line-through;
    color: #717171;
    font-size: 0.8rem;
  }
  .item > div > .body > p {
    font-size: 0.7rem;
    font-weight: lighter;
    margin: 10px 0;
  }
  .item > div > .body > .serves {
    font-size: 0.8rem;
  }
  .item > div > .image > img {
    width: 100%;
    max-width: 100%;
  }
</style>
