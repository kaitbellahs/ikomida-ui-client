<script>
  import { Title, Navigation, Routes } from "../../stores/Navigation";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Types, Utils } from "@ikomida/components";
  import {
    GetPaymentMethods,
    UpdateCreditCard,
    DeleteCreditCard,
  } from "../../network/Payment";
  import { onMount } from "svelte";
  import { Layout } from "../../stores/Setup";

  let payments;
  let isLoading = false;
  let errorAlert;
  let showAlert = false;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  function toggleNewCreditCard() {
    Navigation.goTo(Routes.newMethod);
  }

  async function updateCreditCard(id) {
    isLoading = true;
    const response = await UpdateCreditCard(id);
    if (response?.success) {
      for (const item of payments) {
        item.selected = false;
        if (item.id === id) {
          item.selected = true;
        }
      }
      payments = [...payments];
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function onRemoveClick(id) {
    isLoading = true;
    const response = await DeleteCreditCard(id);
    if (response?.success) {
      payments = payments?.filter((item) => item.id !== id);
      const length = payments?.length ?? 0;
      if (length <= 3 && length > 0) {
        payments[0].selected = true;
        payments = payments;
      }
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  onMount(async () => {
    const response = await GetPaymentMethods();
    if (response?.success) {
      payments =
        response?.data?.sort(
          (i1, i2) => new Date(i2?.createdAt) - new Date(i1?.createdAt)
        ) || [];
    }
  });

  Title.set("Meios de pagamento");
</script>

<Views.Divider />
<Views.Button {Layout} on:click={toggleNewCreditCard}>novo cartão</Views.Button>
{#if !payments}
  <Views.LocalLoading size="2" />
{:else if (payments?.length ?? 0) === 0}
  <Views.CentredMessage
    text="Não há cartões de crédito cadastrados para exibir, cadastre agora uma para fazer seu pedido com segurança!"
  />
{:else}
  <Views.Divider />
  <h3>Selecione seu meio de pagamento principal</h3>
  <small
    >Esse meio de pagamento será usado para realizar cobranças do seus pedidos</small
  >
  {#each payments as { id, type, brand, lastDigits, selected }}
    <div class="paymentCard">
      {#if type === Types.PaymentMethodType.CREDIT_CARD_ONLINE}
        <Views.FloatRemove callback={() => onRemoveClick(id)} />
      {/if}
      <div class="content">
        <span class="paymentType"
          >{Utils.Strings.capitalizeFirstLeter(
            new Types.PaymentMethodType(type).name
          )}</span
        >
        Pagar {new Types.PaymentMethodType(type).description}
        <span class="brand">
          {#if type === Types.PaymentMethodType.CREDIT_CARD_ONLINE}
            <img src="/assets/cardBrand/{brand}.svg" alt={brand} /> **** {lastDigits}
          {/if}
        </span>
      </div>
      <div class="checkbox" on:click={updateCreditCard(id)}>
        <Views.Checkbox bind:checked={selected} />
      </div>
    </div>
  {/each}
{/if}
{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<Views.MessageAlert {Layout} object={errorAlert} bind:show={showAlert} />

<style>
  .paymentCard {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    box-shadow: 1px 2px #cccccc66;
    margin-top: 30px;
    padding: 10px;
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
    font-family: "RobotoMedium";
    margin-bottom: 10px;
  }
  .paymentCard > .content > .brand > img {
    height: 14px;
  }
  .paymentCard > .content > .brand {
    font-weight: lighter;
    font-size: 1em;
    width: 100%;
    margin-top: 5px;
  }
  h3,
  small {
    text-align: center;
  }
</style>
