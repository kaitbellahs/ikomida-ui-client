<script lang="ts">
  import { Cart } from '../../stores/Cart'
  import Routes from '../../stores/Routes'
  import Fa from 'svelte-fa'
  import { faPlusSquare, faMinusSquare, faCartPlus } from '@fortawesome/free-solid-svg-icons'
  import { StatusBar } from '../../stores/Setup'
  import { Views, Utils, Logics, Types, Stores } from '@ikomida/shared-frontend'
  import { getProduct } from '../../network/Products'
  import { onMount } from 'svelte'
  import { Classes } from '@ikomida/shared-types'
  import { Writable } from 'svelte/store'

  const router = Stores.Navigation.instance.router
  const initalProduct: Types.CCart | undefined = $router.options.product
  const genericError =
    'Ocorreu um erro interno, por favor entre em contato conosco pelo e-mail contact@tialtonivel.com.br. Eesvazia o seu carrinho de compras e repita a compra novamente! ou reinicie o app se o erro persiste.'

  let isActive = $router.options.active
  let cartProduct: Types.CCart
  let quantity = 1
  let working: Types.Interfaces.IRecord<string, boolean> = {}
  const Layout: Writable<Classes.CLayout | undefined> = Stores.Layout.instance?.store

  $: total = Utils.Strings.currency(
    cartProduct
      ? quantity *
          (optionsTotal() +
            cartProduct.price -
            Logics.Finances.calcDiscount(cartProduct.price, cartProduct.discount, cartProduct.discountType))
      : 0
  )

  $: optionsTotal = () => {
    let calcTotal = 0
    for (const option of cartProduct?.options ?? []) {
      calcTotal +=
        option.units *
        (option.price - Logics.Finances.calcDiscount(option.price, cartProduct.discount, cartProduct.discountType))
    }
    return calcTotal
  }

  $: hasOptions = () => {
    return (cartProduct.optionsCategories?.filter(category => (category.options?.length ?? 0) > 0) ?? []).length > 0
  }

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
    return categoryOptions && categoryOptions.length > 0
      ? categoryOptions.reduce((previousValue, currentValue) => previousValue + currentValue)
      : 0
  }

  function minos(productOption?: Types.Classes.CProductOption) {
    if (!('minos' in working) || !working.minos) {
      working.minos = true
      try {
        if (productOption) {
          const cartOption = cartProduct.options?.filter(option => option.id === productOption.id)?.[0]
          if (cartOption && cartProduct.options) {
            const cartOptionIndex = cartProduct.options.indexOf(cartOption)
            if (cartOption.units > 1) {
              cartProduct.options[cartOptionIndex].units--
            } else {
              cartProduct.options?.splice(cartOptionIndex, 1)
            }
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
            let cartOption: Types.CCartProductOption = cartOptions?.[0]
            if (
              !cartOption &&
              productOptionsCategory &&
              getCartOptionsCount(productOptionsCategory) < productOptionsCategory.max
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
                cartOption.units < cartOption.maxUnits &&
                productOptionsCategory &&
                getCartOptionsCount(productOptionsCategory) < productOptionsCategory.max
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
          if (quantity < cartProduct.quantity && quantity < (cartProduct.maxQuantityPerOrder ?? 10)) {
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
    if ((!('addProduct' in working) || !working.addProduct) && initalProduct) {
      working.addProduct = true
      const productOptionsCategoriesMandatories =
        cartProduct.optionsCategories?.filter(optionsCategory => optionsCategory.min > 0) ?? []
      for (const productOptionsCategoriesMandatory of productOptionsCategoriesMandatories) {
        if (getCartOptionsCount(productOptionsCategoriesMandatory) < productOptionsCategoriesMandatory.min) {
          Stores.MessageAlert.instance.show(
            `Certifique-se de que selecionou no mínimo ${productOptionsCategoriesMandatory.min} ${
              productOptionsCategoriesMandatory.min > 1 ? 'opções' : 'opção'
            } na categoria ${productOptionsCategoriesMandatory.name}.`
          )
          working.addProduct = false
          return
        }
      }
      for (const optionsCategory of cartProduct.optionsCategories ?? []) {
        if (getCartOptionsCount(optionsCategory) > optionsCategory.max) {
          Stores.MessageAlert.instance.show(
            `Diminua a quantidade das opções escolhidas, a categoria "${optionsCategory.name}" aceita no maximo ${
              optionsCategory.max
            } ${optionsCategory.max > 1 ? 'opções' : 'opção'}.`
          )
          working.addProduct = false
          return
        }
      }
      const cartProducts = await Cart.instance.products()
      let isEditing = false
      const filtredInitalCartProduct = cartProducts.filter(newCartProduct => {
        initalProduct.observation = newCartProduct.observation
        if (newCartProduct.equal(initalProduct)) {
          isEditing = true
          working.addProduct = false
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
        }
        if (
          cartProduct.quantity > cartProduct.leftQuantity ||
          ((cartProduct.maxQuantityPerOrder ?? 10) > 0 &&
            cartProduct.quantity > (cartProduct.maxQuantityPerOrder ?? 10))
        ) {
          Stores.MessageAlert.instance.show(`A quantidade do produto é superior à quantidade permitida.`)
          working.addProduct = false
          return
        }
        if (!isEditing) {
          for (const option of cartProduct.options) {
            const cartOption = cartProducts[index].options.filter(cartOption => cartOption.id === option.id)?.[0]
            if (cartOption) {
              option.units = cartOption.units
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
    Stores.Loading.instance.reset()
    Stores.Loading.instance.start()
    if (!initalProduct || !initalProduct.id) {
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
      isActive = isActive && cartProduct.active && cartProduct.quantity > 0
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  })

  $: Stores.Title.instance.set(cartProduct?.title ?? 'Carregando ...')
</script>

{#if cartProduct}
  <productImage>
    <Views.Image source={cartProduct.image ?? '/assets/images/food-plate.svg'} name={cartProduct.title} />
    {#if !isActive}
      <span class="unavailable">Indisponível</span>
    {/if}
  </productImage>
  <product style="--backgroundImage: {$Layout?.backgroundImage ? ` url('${$Layout?.backgroundImage}')` : 'none'};">
    {#if [Types.Types.TDiscount.PERCENT, Types.Types.TDiscount.VALUE].includes(cartProduct.discountType)}
      <Views.Discount value={cartProduct.discount} type={cartProduct.discountType} top={8} right={8} />
    {/if}
    <div class="backgroundCustomColor">
      <h2>{cartProduct.title}</h2>
      <p>{cartProduct.description}</p>
      <span class="serves"
        >Aproximadamente {cartProduct.measureUnit && cartProduct.measure
          ? Logics.Finances.formatMeasure(cartProduct.measure, cartProduct.measureUnit)
          : '-'}</span
      >
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
              <span class="oldPrice">{Utils.Strings.currency(total)}</span>
            {/if}
            <span class="current">{Utils.Strings.currency(total)}</span>
          </div>
        </div>
      </div>
      <div class="quantity">
        <Views.Button
          disabled={quantity <= 1 || !isActive}
          margin="0"
          type={Types.TButton.TRANSPARENT}
          size="none"
          on:click={() => minos()}
        >
          <Fa icon={faMinusSquare} /></Views.Button
        ><span>{quantity}</span><Views.Button
          disabled={!(quantity < cartProduct.quantity && quantity < (cartProduct.maxQuantityPerOrder ?? 10)) ||
            !isActive}
          margin="0"
          type={Types.TButton.TRANSPARENT}
          size="none"
          on:click={() => plus()}><Fa icon={faPlusSquare} /></Views.Button
        >
      </div>
      {#if (cartProduct.optionsCategories?.length ?? 0) > 0}
        {#if hasOptions()}
          <Views.Divider height={8} />
          <h2>Personalize seu pedido</h2>
          {#each cartProduct.optionsCategories ?? [] as optionsCategory}
            {#if (optionsCategory.options?.length ?? 0) > 0}
              <Views.Divider height={24} />
              <div class="optionsCategory shadow {!isActive ? 'disabled' : ''}">
                <header>
                  <Views.Image source={optionsCategory.image} name={optionsCategory.name} height="45pt" width="45pt" />
                  <div>
                    <h3>{optionsCategory.name}</h3>
                    <div>
                      <div>
                        <span>Mínimo: {optionsCategory.min}</span><span>Máximo: {optionsCategory.max}</span>
                      </div>
                      <div>
                        <span>Escolheu</span><span class="selected">{getCartOptionsCount(optionsCategory)}</span>
                      </div>
                    </div>
                    {#if optionsCategory.min > 0}
                      <span class="mandatory">Mandatório</span>
                    {/if}
                  </div>
                </header>
                {#each optionsCategory.options ?? [] as option}
                  <Views.Divider height={16} />
                  <div
                    class="option shadow {getCartOptionUnitsById(option.id) === 0 &&
                    getCartOptionsCount(optionsCategory) >= optionsCategory.max
                      ? 'disabled'
                      : ''}"
                  >
                    <Views.Image source={option.image} name={option.name} height="45pt" width="45pt" />
                    <div>
                      <h3>{option.name}</h3>
                      <div>
                        <div class="units">
                          <Views.Button
                            type={Types.TButton.TRANSPARENT}
                            size="none"
                            height="16pt"
                            sizeMultiplier={1.3}
                            margin="0"
                            padding={4}
                            disabled={getCartOptionUnitsById(option.id) <= 0}
                            on:click={() => minos(option)}
                          >
                            <Fa icon={faMinusSquare} /></Views.Button
                          ><span>{getCartOptionUnitsById(option.id)}/{option.units}</span><Views.Button
                            type={Types.TButton.TRANSPARENT}
                            size="none"
                            height="16pt"
                            margin="0"
                            padding={4}
                            sizeMultiplier={1.3}
                            disabled={getCartOptionUnitsById(option.id) > option.units ||
                              getCartOptionsCount(optionsCategory) >= optionsCategory.max}
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
                                >{Utils.Strings.currency(
                                  getCartOptionUnitsById(option.id) * option.price * quantity
                                )}</span
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
              </div>
            {/if}
          {/each}
        {/if}
      {/if}
      <Views.Button disabled={!isActive} isFloat={true} on:click={addProduct} bottomPadding={$StatusBar.bottomPadding}
        ><Fa icon={faCartPlus} /> <span>{Types.CCart.isInstance(initalProduct) ? 'Atualizar' : 'Adicionar'}</span>
        <span>({total})</span></Views.Button
      >
      {#if !isActive}
        <Views.Divider />
        <Views.Status>Por enquanto este produto está disponível apenas para consulta.</Views.Status>
      {/if}
    </div>
  </product>
{/if}

<style>
  product::before {
    content: '';
    background-image: var(--backgroundImage);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.3;
  }
  product > div {
    padding: 16pt;
    margin-bottom: 16pt;
    border-radius: 8pt;
  }
  .quantity {
    margin-top: 8pt;
    align-items: center;
    font-size: 1.8em;
    text-align: center;
  }
  .quantity > span {
    padding: 0;
    border: 0;
    background: transparent;
    margin-right: 8pt;
    margin-left: 8pt;
  }
  .price {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    text-align: center;
  }
  .price > div {
    display: flex;
    flex-direction: column;
  }
  .price > div > div {
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
    margin: 16pt 0;
  }
  .serves {
    font-size: 1rem;
  }
  .optionsCategory {
    background-color: #fffffffa;
    border-radius: 8pt;
    padding: 16pt;
    position: relative;
  }
  .optionsCategory > header {
    display: flex;
    flex-direction: row;
    position: relative;
  }
  .optionsCategory > header > div {
    width: calc(100% - 42pt);
    margin-left: 16pt;
  }
  .optionsCategory > header > div > div {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    font-size: 0.8em;
  }
  .optionsCategory > header > div > div > div {
    display: flex;
    flex-direction: column;
  }
  .optionsCategory > header > div > div > div > .selected {
    font-size: 1.1em;
    font-family: RobotoBold;
    text-align: center;
  }
  .optionsCategory > .option {
    background-color: #ffffff26;
    border-radius: 8pt;
    padding: 16pt;
    position: relative;
  }
  .optionsCategory > .option {
    display: flex;
    flex-direction: row;
  }
  .optionsCategory > .option > div {
    width: calc(100% - 42pt);
    margin-left: 16pt;
  }
  .optionsCategory > .option > div > div {
    display: flex;
    flex-direction: row;
  }
  .optionsCategory > .option > div > div > * {
    font-size: 0.9em;
  }
  .optionsCategory > .option > div > div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
  .optionsCategory > .option > div > div > .units {
    align-items: center;
    font-size: 0.9em;
    text-align: center;
    display: flex;
    flex-direction: row;
    margin-top: 4pt;
  }
  .optionsCategory > .option > div > div > .units > span {
    padding: 0;
    border: 0;
    background: transparent;
  }
  .optionsCategory > .option > div > div > .price {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.9em;
  }
  .optionsCategory > .option > div > div > div > .oldPrice {
    font-size: 0.7em;
  }
  .disabled {
    background-color: #ccccccc4 !important;
  }
</style>
