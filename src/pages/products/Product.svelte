<script lang="ts">
  import { Cart } from '../../stores/Cart'
  import Routes from '../../stores/Routes'
  import Fa from 'svelte-fa'
  import { faPlusSquare, faMinusSquare, faCartPlus } from '@fortawesome/free-solid-svg-icons'
  import { StatusBar } from '../../stores/Setup'
  import { Views, Utils, Logics, Types, Stores } from '@ikomida/shared-frontend'
  import { getProduct } from '../../network/Products'
  import { onMount } from 'svelte'
  import CartItem from '@ikomida/shared-frontend/lib/components/CartItem.svelte'

  const router = Stores.Navigation.instance.router
  const initalProduct = $router.options
  const genericError =
    'Ocorreu um erro interno, por favor entre em contato conosco pelo e-mail contact@tialtonivel.com.br. Eesvazia o seu carrinho de compras e repita a compra novamente! ou reinicie o app se o erro persiste.'

  let cartProduct: Types.CCart
  let quantity = 1
  let working: Types.Interfaces.IRecord<string, boolean> = {}

  $: optionsTotal = () => {
    let calcTotal = 0
    for (const option of cartProduct?.options ?? []) {
      calcTotal +=
        option.units *
        (option.price - Logics.Finances.calcDiscount(option.price, cartProduct.discount, cartProduct.discountType))
    }
    return calcTotal
  }

  $: total = Utils.Strings.currency(
    cartProduct
      ? quantity *
          (optionsTotal() +
            cartProduct.price -
            Logics.Finances.calcDiscount(cartProduct.price, cartProduct.discount, cartProduct.discountType))
      : 0
  )

  $: getCartOptionUnitsById = (id?: string) => {
    if (id) {
      const cartOptions = cartProduct.options?.filter(cartOption => id === cartOption.id)
      return cartOptions?.[0]?.units ?? 0
    }
    return 0
  }
  $: getCartOptionsCount = (optionsCategory: Types.Classes.CProductOptionsCategory) => {
    const optionsCategoryIds = optionsCategory?.options.flatMap(option => option.id) ?? []
    const categoryOptions = cartProduct.options
      ?.filter(option => optionsCategoryIds.includes(option.id))
      ?.flatMap(option => option.units)
    return categoryOptions.length > 0
      ? categoryOptions.reduce((previousValue, currentValue) => previousValue + currentValue)
      : 0
  }

  function minos(productOption?: Types.Classes.CProductOption) {
    if (!('minos' in working) || !working.minos) {
      working.minos = true
      try {
        if (productOption) {
          const cartOption = cartProduct.options.filter(option => option.id === productOption.id)?.[0]
          if (cartOption && cartProduct.options) {
            const cartOptionIndex = cartProduct.options.indexOf(cartOption)
            if (cartOption.units > 1) {
              cartProduct.options[cartOptionIndex].units--
            } else {
              cartProduct.options?.splice(cartOptionIndex, 1)
            }
            cartProduct = cartProduct
          } else {
            throw new Error(genericError)
          }
          cartProduct = cartProduct
        } else if (quantity > 1) {
          quantity--
        }
      } catch (exception: any) {
        //TODO: -- report error
        if (exception instanceof Error) {
          Stores.MessageAlert.instance.show(exception.message)
        }
      }
      working.minos = false
    }
  }

  function plus(
    productOptionsCategory?: Types.Classes.CProductOptionsCategory,
    productOption?: Types.Classes.CProductOption
  ) {
    if (!('plus' in working) || !working.plus) {
      working.plus = true
      try {
        if (productOptionsCategory && productOption) {
          const optionsCategoryIds = productOptionsCategory?.options.flatMap(option => option.id) ?? []
          const cartFiltredOptions = cartProduct.options?.filter(option => optionsCategoryIds.includes(option.id)) ?? []
          if (productOption) {
            const cartOptions = cartFiltredOptions?.filter(cartOption => productOption.id === cartOption.id)
            let cartOption = cartOptions?.[0]
            if (
              !cartOption &&
              productOptionsCategory &&
              getCartOptionsCount(productOptionsCategory) < productOptionsCategory.max * quantity
            ) {
              cartOption = Types.CCartProductOption.fromObject(productOption.toJSON())
              if (cartOption) {
                cartOption.units = 1
                cartOption.maxUnits = productOption.units
                if (!Array.isArray(cartProduct.options)) {
                  cartProduct.options = []
                }
                cartProduct.options?.push(cartOption)
              } else {
                throw new Error(genericError)
              }
            } else if (productOption && cartOption) {
              cartOption.maxUnits = productOption.units
              if (
                cartOption.units < cartOption.maxUnits * quantity &&
                productOptionsCategory &&
                getCartOptionsCount(productOptionsCategory) < productOptionsCategory.max * quantity
              ) {
                cartOption.units++
              }
            }
            cartProduct = cartProduct
          } else {
            Stores.MessageAlert.instance.show(genericError)
            throw new Error(genericError)
          }
        } else {
          if (quantity < cartProduct.quantity) {
            quantity++
          }
        }
      } catch (exception: any) {
        //TODO: report error
        console.error(exception)
        if (exception instanceof Error) {
          Stores.MessageAlert.instance.show(exception.message)
        }
      }
      working.plus = false
    }
  }

  const addProduct = async () => {
    if (!('addProduct' in working) || !working.addProduct) {
      working.addProduct = true
      const productOptionsCategoriesMandatories =
        cartProduct.optionsCategories?.filter(optionsCategory => optionsCategory.min > 0) ?? []
      for (const productOptionsCategoriesMandatory of productOptionsCategoriesMandatories) {
        if (getCartOptionsCount(productOptionsCategoriesMandatory) < productOptionsCategoriesMandatory.min * quantity) {
          Stores.MessageAlert.instance.show(
            `Certifique-se de que selecionou no mínimo ${productOptionsCategoriesMandatory.min * quantity} ${
              productOptionsCategoriesMandatory.min * quantity > 1 ? 'opções' : 'opção'
            } na categoria ${productOptionsCategoriesMandatory.name}.`
          )
          working.addProduct = false
          return
        }
      }
      for (const optionsCategory of cartProduct.optionsCategories ?? []) {
        if (getCartOptionsCount(optionsCategory) > optionsCategory.max * quantity) {
          Stores.MessageAlert.instance.show(
            `Diminua a quantidade das opções escolhidas, a categoria "${optionsCategory.name}" aceita no maximo ${
              optionsCategory.max * quantity
            } ${optionsCategory.max * quantity > 1 ? 'opções' : 'opção'}.`
          )
          working.addProduct = false
          return
        }
      }
      const cartProducts = await Cart.instance.products()
      let isEditing = false
      const filtredInitalCartProduct = cartProducts.filter(newCartProduct => {
        if (newCartProduct.equal(initalProduct)) {
          isEditing = true
          return true
        }
        const clonedCartProductJSON = newCartProduct.toJSON()
        clonedCartProductJSON.options = cartProduct.options
        clonedCartProductJSON.id = cartProduct.id
        const clonedCartProduct = Types.CCart.fromObject(clonedCartProductJSON)
        for (const option of clonedCartProduct.options) {
          const cartOption = newCartProduct.options.filter(cartOption => cartOption.id === option.id)?.[0]
          if (cartOption) {
            option.units = cartOption.units
            option.maxUnits = cartOption.maxUnits
          }
        }
        return newCartProduct.equal(clonedCartProduct)
      })?.[0]
      cartProduct.leftQuantity = cartProduct.quantity
      cartProduct.quantity = quantity
      const index = cartProducts.indexOf(filtredInitalCartProduct)
      if (index >= 0) {
        if (!Types.CCart.isInstance(initalProduct)) {
          cartProduct.quantity = isEditing ? quantity : cartProducts[index].quantity + quantity
          cartProduct.leftQuantity = cartProduct.quantity
        }
        if (!isEditing) {
          for (const option of cartProduct.options) {
            const cartOption = cartProducts[index].options.filter(cartOption => cartOption.id === option.id)?.[0]
            if (cartOption) {
              option.units += cartOption.units
            }
          }
        }
        cartProducts[index] = cartProduct
        await Cart.instance.update(cartProducts)
      } else {
        await Cart.instance.addProduct(cartProduct)
      }
      Stores.Navigation.instance.goTo(Routes.cart)
      working.addProduct = false
    }
  }

  onMount(async () => {
    if (!initalProduct.id) {
      Stores.Loading.instance.stop()
      return
    }
    const response = await getProduct(initalProduct.id)
    if (response?.success) {
      if (Types.CCart.isInstance(initalProduct)) {
        quantity = initalProduct.quantity
      }
      cartProduct = Types.CCart.fromObject({ ...initalProduct.toJSON(), ...response?.data })
      cartProduct.optionsCategories = cartProduct.optionsCategories?.sort(
        (category1, category2) => category2.min - category1.min
      )
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  })

  $: Stores.Title.instance.set(cartProduct?.title ?? 'Carregando ...')
</script>

{#if cartProduct}
  <div class="product">
    <Views.Image source={cartProduct.image} name={cartProduct.title} />
    <h2>{cartProduct.title}</h2>
    <p>{cartProduct.description}</p>
    <span class="serves">Aproximadamente {Logics.Finances.formatWeight(cartProduct.weight ?? 0)}</span>
    <Views.Divider />
    <div class="price">
      <div>
        <h4>Valor</h4>
        <div>
          {#if [Types.Types.TDiscount.PERCENT, Types.Types.TDiscount.VALUE].includes(cartProduct.discountType)}
            <span class="oldPrice">{Utils.Strings.currency(cartProduct.price)}</span>
          {/if}
          <span class="current"
            >{Utils.Strings.currency(
              cartProduct.price -
                Logics.Finances.calcDiscount(cartProduct.price, cartProduct.discount, cartProduct.discountType)
            )}</span
          >
        </div>
      </div>
      <div>
        <h4>Total</h4>
        <div>
          {#if [Types.Types.TDiscount.PERCENT, Types.Types.TDiscount.VALUE].includes(cartProduct.discountType)}
            <span class="oldPrice">{Utils.Strings.currency(quantity * cartProduct.price)}</span>
          {/if}
          <span class="current"
            >{Utils.Strings.currency(
              quantity *
                (cartProduct.price -
                  Logics.Finances.calcDiscount(cartProduct.price, cartProduct.discount, cartProduct.discountType))
            )}</span
          >
        </div>
      </div>
    </div>
    <div class="quantity">
      <Views.Button margin="0" type={Types.TButton.TRANSPARENT} size="none" on:click={() => minos()}>
        <Fa icon={faMinusSquare} /></Views.Button
      ><span>{quantity}</span><Views.Button
        margin="0"
        type={Types.TButton.TRANSPARENT}
        size="none"
        on:click={() => plus()}><Fa icon={faPlusSquare} /></Views.Button
      >
    </div>
    <Views.Divider />
    <h2>Personalize seu pedido</h2>
    {#if (cartProduct.optionsCategories?.length ?? 0) > 0}
      {#each cartProduct.optionsCategories ?? [] as optionsCategory, index}
        <Views.Divider />
        <div class="optionsCategory">
          <header>
            <Views.Image source={optionsCategory.image} name={optionsCategory.name} height="45px" width="45px" />
            <div>
              <h3>{optionsCategory.name}</h3>
              <div>
                <div>
                  <span>Mínimo: {optionsCategory.min * quantity}</span><span
                    >Máximo: {optionsCategory.max * quantity}</span
                  >
                </div>
                <div><span>Escolheu</span><span class="selected">{getCartOptionsCount(optionsCategory)}</span></div>
              </div>
              {#if optionsCategory.min > 0}
                <span class="mandatory">Mandatório</span>
              {/if}
            </div>
          </header>
          {#if (optionsCategory.options?.length ?? 0) > 0}
            {#each optionsCategory.options ?? [] as option, optionIndex}
              <Views.Divider />
              <div class="option">
                <Views.Image source={option.image} name={option.name} height="45px" width="45px" />
                <div>
                  <h3>{option.name}</h3>
                  <div>
                    <div class="units">
                      <Views.Button
                        type={Types.TButton.TRANSPARENT}
                        size="none"
                        height="16px"
                        sizeMultiplier={1.3}
                        margin="0"
                        on:click={() => minos(option)}
                      >
                        <Fa icon={faMinusSquare} /></Views.Button
                      ><span>{getCartOptionUnitsById(option.id)}/{option.units * quantity}</span><Views.Button
                        type={Types.TButton.TRANSPARENT}
                        size="none"
                        height="16px"
                        margin="0"
                        sizeMultiplier={1.3}
                        on:click={() => plus(optionsCategory, option)}><Fa icon={faPlusSquare} /></Views.Button
                      >
                    </div>
                    {#if option.price > 0}
                      <div class="price">
                        <h5>Valor</h5>
                        {#if [Types.Types.TDiscount.PERCENT, Types.Types.TDiscount.VALUE].includes(cartProduct.discountType) && option.price > 0}
                          <span class="oldPrice">{Utils.Strings.currency(option.price * quantity)}</span>
                        {/if}
                        {Utils.Strings.currency(
                          quantity *
                            (option.price -
                              Logics.Finances.calcDiscount(
                                option.price,
                                cartProduct.discount,
                                cartProduct.discountType
                              ))
                        )}
                      </div>
                      <div class="price">
                        <h5>Total</h5>
                        {#if [Types.Types.TDiscount.PERCENT, Types.Types.TDiscount.VALUE].includes(cartProduct.discountType) && option.price > 0}
                          <span class="oldPrice"
                            >{Utils.Strings.currency(getCartOptionUnitsById(option.id) * option.price * quantity)}</span
                          >
                        {/if}
                        {Utils.Strings.currency(
                          quantity *
                            getCartOptionUnitsById(option.id) *
                            (option.price -
                              Logics.Finances.calcDiscount(
                                option.price,
                                cartProduct.discount,
                                cartProduct.discountType
                              ))
                        )}
                      </div>
                    {:else}
                      <span class="current">Gratuito</span>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          {:else}
            <Views.Divider />
            <Views.Status>Não há opções cadastradas nesta categoria de opções.</Views.Status>
          {/if}
        </div>
      {/each}
    {:else}
      <Views.Divider />
      <Views.Status>Não há opções para customizar este produto.</Views.Status>
    {/if}
    <Views.Button isFloat={true} on:click={addProduct} bottomPadding={$StatusBar.bottomPadding}
      ><Fa icon={faCartPlus} /> <span>{Types.CCart.isInstance(initalProduct) ? 'Atualizar' : 'Adicionar'}</span>
      <span>({total})</span></Views.Button
    >
  </div>
{/if}

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
  .product > .price {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    text-align: center;
  }
  .product > .price > div {
    display: flex;
    flex-direction: column;
  }
  .product > .price > div > div {
    display: flex;
    flex-direction: column;
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
  }
  p {
    font-size: 1.1rem;
    font-weight: lighter;
    margin: 10px 0;
  }
  .serves {
    font-size: 1rem;
  }
  .product > .optionsCategory {
    background-color: #d6d6d657;
    border: #ccd;
    border-radius: 5px;
    padding: 10px;
    position: relative;
  }
  .product > .optionsCategory > header {
    display: flex;
    flex-direction: row;
    position: relative;
  }
  .product > .optionsCategory > header > div {
    width: calc(100% - 42px);
    margin-left: 10px;
  }
  .product > .optionsCategory > header > div > .mandatory {
    position: absolute;
    right: -15px;
    top: -15px;
    width: auto;
    display: flex;
    align-items: center;
    padding: 3px 13px 3px 13px;
    border-radius: 23px 0 23px 0;
    background: #ffeabe;
    font-family: RobotoBold, sans-serif;
    line-height: 1;
    color: #4c0708;
    text-shadow: 0.5px 1px #00000055;
    box-shadow: 2px 3px #00000099;
  }
  .product > .optionsCategory > header > div > div {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    font-size: 0.8em;
  }
  .product > .optionsCategory > header > div > div > div {
    display: flex;
    flex-direction: column;
  }
  .product > .optionsCategory > header > div > div > div > .selected {
    font-size: 1.1em;
    font-family: RobotoBold;
    text-align: center;
  }
  .product > .optionsCategory > .option {
    background-color: #d6d6d657;
    border: #ccd;
    border-radius: 5px;
    padding: 10px;
    position: relative;
  }
  .product > .optionsCategory > .option {
    display: flex;
    flex-direction: row;
  }
  .product > .optionsCategory > .option > div {
    width: calc(100% - 42px);
    margin-left: 10px;
  }
  .product > .optionsCategory > .option > div > div {
    display: flex;
    flex-direction: row;
  }
  .product > .optionsCategory > .option > div > div > * {
    font-size: 0.9em;
  }
  .product > .optionsCategory > .option > div > div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
  .product > .optionsCategory > .option > div > div > .units {
    margin-top: 5px;
    align-items: center;
    font-size: 0.9em;
    text-align: center;
    display: flex;
    flex-direction: row;
  }
  .product > .optionsCategory > .option > div > div > .units > span {
    padding: 0;
    border: 0;
    background: transparent;
    margin-right: 6px;
    margin-left: 6px;
  }
  .product > .optionsCategory > .option > div > div > .price {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .product > .optionsCategory > .option > div > div > div > .oldPrice {
    font-size: 0.8em;
  }
</style>
