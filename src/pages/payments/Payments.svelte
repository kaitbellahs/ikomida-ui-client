<script lang="ts">
  import Routes from '../../stores/Routes'
  import { Views, Types, Utils, Stores } from '@ikomida/shared-frontend'
  import { GetPaymentMethods, UpdateCreditCard, DeleteCreditCard } from '../../network/Payment'
  import { onMount } from 'svelte'

  let payments: Types.Classes.CPaymentMethod[]

  function toggleNewCreditCard() {
    Stores.Navigation.instance.goTo(Routes.newMethod)
  }

  async function updateCreditCard(id?: string) {
    Stores.Loading.instance.start()
    const response = await UpdateCreditCard(id)
    if (response?.success) {
      for (const item of payments) {
        item.selected = false
        if (item.id === id) {
          item.selected = true
        }
      }
      payments = [...payments]
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  async function onRemoveClick(id?: string) {
    Stores.Loading.instance.start()
    const response = await DeleteCreditCard(id)
    if (response?.success) {
      payments = payments?.filter(item => item.id !== id)
      const length = payments?.length ?? 0
      if (length <= 3 && length > 0) {
        payments[0].selected = true
        payments = payments
      }
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  onMount(async () => {
    const response = await GetPaymentMethods()
    if (response?.success) {
      const data: Types.Classes.CPaymentMethod[] = Types.Classes.CPaymentMethod.fromObject(response.data)
      payments = data.sort((i1, i2) => (i2.createdAt?.getTime() ?? 0) - (i1.createdAt?.getTime() ?? 0)) || []
    }
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Meios de pagamento')
</script>

<Views.Divider />
<Views.Button on:click={toggleNewCreditCard}>novo cartão</Views.Button>
{#if !payments}
  <Views.LocalLoading size={2} />
{:else if (payments?.length ?? 0) === 0}
  <Views.CentredMessage
    text="Não há cartões de crédito cadastrados para exibir, cadastre agora uma para fazer seu pedido com segurança!"
  />
{:else}
  <Views.Divider />
  <h3>Selecione seu meio de pagamento principal</h3>
  <small>Esse meio de pagamento será usado para realizar cobranças do seus pedidos</small>
  {#each payments as { id, type, brand, lastDigits, selected } (id)}
    <div class="paymentCard">
      {#if type === Types.Types.TPaymentMethod.CREDIT_CARD_ONLINE}
        <Views.FloatRemove callback={() => onRemoveClick(id)} />
      {/if}
      <div class="content">
        <span class="paymentType">{Utils.Strings.capitalizeFirstLeter(type.name)}</span>
        Pagar {type.description}
        <span class="brand">
          {#if type === Types.Types.TPaymentMethod.CREDIT_CARD_ONLINE}
            <Views.Image source="/assets/cardBrand/{brand}.svg" name={brand} /> **** {lastDigits}
          {/if}
        </span>
      </div>
      <div class="checkbox" on:click={() => updateCreditCard(id)}>
        <Views.Checkbox bind:checked={selected} />
      </div>
    </div>
  {/each}
{/if}

<style>
  .paymentCard {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    box-shadow: 0 4pt 8pt #0000009e;
    margin-top: 24pt;
    padding: 16pt;
    border-radius: 8pt;
  }
  .paymentCard > .checkbox {
    display: flex;
    align-items: flex-end;
  }
  .paymentCard > .content {
    display: flex;
    flex-direction: column;
    flex-grow: 10;
  }
  .paymentCard > .content > .paymentType {
    font-family: 'RobotoMedium';
    margin-bottom: 16pt;
  }
  .paymentCard > .content > .brand > :global(img) {
    height: 16px;
    width: auto;
  }
  .paymentCard > .content > .brand {
    font-weight: lighter;
    font-size: 1em;
    width: 100%;
    margin-top: 8pt;
  }
  h3,
  small {
    text-align: center;
  }
</style>
