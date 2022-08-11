<script>
  import { Title, Navigation, Routes } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views } from "@ikomida/components";
  import {
    GetPaymentMethods,
    PaymentType,
    UpdateCard,
    DeleteCard,
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

  function toggleNewCard() {
    Navigation.goTo(Routes.newMethod);
  }

  async function updateCard(id) {
    isLoading = true;
    const response = await UpdateCard(id);
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
    const response = await DeleteCard(id);
    if (response?.success) {
      payments = payments?.filter((item) => item.id !== id);
      if ((payments?.length ?? 0) === 1) {
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
<Views.Button {Layout} on:click={toggleNewCard}>novo cartão</Views.Button>
{#if !payments}
  <Views.LocalLoading size="2" />
{:else if (payments?.length ?? 0) === 0}
  <Views.CentredMessage
    text="Não há cartões de crédito cadastrados para exibir, cadastre agora uma para fazer seu pedido com segurança!"
  />
{:else}
  {#each payments as { id, type, brand, lastDigits, selected }}
    <div class="paymentCard">
      {#if type !== "Cash"}
        <span on:click={onRemoveClick(id)} class="remove"
          ><Fa icon={faTrashAlt} /></span
        >
      {/if}
      <div class="content">
        <span class="paymentType">{PaymentType(type)}</span>
        <span class="brand">
          {#if type !== "Cash"}
            {brand} **** **** **** {lastDigits}
          {:else}
            Pagar na entrega
          {/if}
        </span>
      </div>
      <div class="edit" on:click={updateCard(id)}>
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
  .paymentCard > .content {
    display: flex;
    flex-direction: column;
    flex-grow: 10;
  }
  .paymentCard > .content > .paymentType {
    font-family: "RobotoMedium";
  }
  .paymentCard > .content > .brand {
    font-weight: lighter;
    font-size: 1em;
    width: 100%;
  }
  .remove {
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 0.9em;
    color: white;
    font-family: RobotoBold;
    border: 1px solid #4c0708;
    background: #4c0708;
    border-radius: 16px;
    width: 28px;
    height: 28px;
    vertical-align: middle;
    text-align: center;
    padding: 6px;
  }
</style>
