<script>
  import { Cart } from "../../stores/Cart";
  import { Title, Navigation, Router, Routes } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import {
    faPlusSquare,
    faMinusSquare,
    faCartPlus,
    faEdit,
    faSearch,
  } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Utils, Network, Types } from "@tian/components";
  import {
    GetPaymentMethods,
    PaymentType,
    NewCard,
    AddCoupon,
  } from "../../network/Payment";
  import { onMount } from "svelte";
  import { Layout } from "../../stores/Setup";

  let payments;
  let showNewCard = false;
  let isLoading = false;
  let newCardObject = {
    name: null,
    validity: null,
    cpf: null,
    cvc: null,
    number: null,
  };

  let errorAlert;
  let showAlert = false;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  function toggleNewCard() {
    showNewCard = !showNewCard;
  }

  async function newCard() {
    isLoading = true;
    const newCard = {
      holder: newCardObject.name,
      number: newCardObject.number,
      expMonth: newCardObject.validity.substring(0, 2),
      expYear: `20${newCardObject.validity.substring(3, 5)}`,
      cvc: newCardObject.cvc,
    };
    const response = await NewCard(newCard);
    if (response?.success) {
      payments = response?.data;
      showNewCard = !showNewCard;
    }
    isLoading = false;
  }

  function updateCard(id) {
    payments.forEach((item) => {
      item.selected = false;
      if (item.id === id) {
        item.selected = true;
      }
    });
    payments = [...payments];
  }

  onMount(async () => {
    const response = await GetPaymentMethods();
    if (response?.success) {
      payments = response?.data;
    }
  });

  Title.set("Endereços");
</script>

<Views.Button {Layout} on:click={toggleNewCard}>novo cartão</Views.Button>
{#if !payments}
  <Views.LocalLoading size="2" />
{:else}
  {#each payments as { id, type, brand, last4Digits, selected }}
    <div class="paymentCard">
      <div class="content">
        <span class="payWith">Pagar com</span>
        <span>{PaymentType(type)}</span>
        <span class="brand">
          {#if type !== "Cash"}
            {brand} **** **** **** {last4Digits}
          {:else}
            Pagar na entrega
          {/if}
        </span>
      </div>
      <div class="edit" on:click={updateCard(id)}>
        <input type="checkbox" bind:checked={selected} />
      </div>
    </div>
  {/each}
{/if}

{#if showNewCard}
  <Views.Alert
    {Layout}
    title="Novo cartão!"
    closeCallBack={toggleNewCard}
    buttons={[
      { name: "Cancelar", callback: toggleNewCard, principal: true },
      { name: "Adicionar", callback: newCard },
    ]}
  >
    <Views.TextEdit
      mask="____ ____ ____ ____"
      maskKey="_"
      bind:rawValue={newCardObject.number}
      placeHolder="Numero do cartão"
    />
    <Views.TextEdit placeHolder="Nome" bind:value={newCardObject.name} />
    <Views.TextEdit
      mask="__/__"
      maskKey="_"
      placeHolder="Validade"
      bind:value={newCardObject.validity}
    />
    <Views.TextEdit
      mask="___"
      maskKey="_"
      placeHolder="CVV"
      bind:value={newCardObject.cvc}
    />
    <Views.TextEdit
      type="cpf"
      placeHolder="CPF"
      bind:value={newCardObject.cpf}
    />
  </Views.Alert>
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
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }
  .paymentCard > .content {
    display: flex;
    flex-direction: column;
    flex-grow: 10;
  }
  .paymentCard > .content > .payWith {
    font-weight: lighter;
    font-size: 0.9em;
    width: 100%;
  }
  .paymentCard > .content > .brand {
    font-weight: lighter;
    font-size: 1em;
    width: 100%;
  }
</style>
