<script>
  import { Title } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views } from "@tian/components";
  import {
    GetPaymentMethods,
    PaymentType,
    NewCard,
    UpdateCard,
    DeleteCard,
  } from "../../network/Payment";
  import { onMount } from "svelte";
  import { Layout } from "../../stores/Setup";

  let payments;
  let showNewCard = false;
  let isLoading = false;
  let newCardObject = {
    holder: null,
    validity: null,
    cpf: null,
    cvc: null,
    number: null,
  };
  let newCardObjectValidation = {
    holder: false,
    validity: false,
    cpf: false,
    cvc: false,
    number: false,
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
    if ((newCardObject?.holder?.length || 0) < 3) {
      toggleErrorAlert(`é obrigatorio o preencheemento do nome`);
    } else if ((newCardObject?.number?.length || 0) < 15) {
      toggleErrorAlert(`é obrigatorio o preencheemento do nomenro do cartão`);
    } else if ((newCardObject?.validity?.length || 0) < 4) {
      toggleErrorAlert(`é obrigatorio o preencheemento da validade do cartão`);
    } else if ((newCardObject?.cvc?.length || 0) < 3) {
      toggleErrorAlert(`é obrigatorio o preencheemento do codigo de segurança`);
    } else if (!newCardObjectValidation?.cpf) {
      toggleErrorAlert(`é obrigatorio o preencheemento do CPF`);
    } else {
      isLoading = true;
      const newCard = {
        holder: newCardObject?.holder,
        number: newCardObject?.number,
        expMonth: newCardObject?.validity?.substring(0, 2),
        expYear: `20${newCardObject?.validity?.substring(3, 5)}`,
        cvc: newCardObject?.cvc,
        cpf: newCardObject?.cpf,
      };
      const response = await NewCard(newCard);
      if (response?.success) {
        payments = response?.data;
        showNewCard = !showNewCard;
      } else {
        toggleErrorAlert(response?.data);
      }
      isLoading = false;
    }
  }

  async function updateCard(id) {
    console.log(id);
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
      if (payments?.length === 1) {
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
      payments = response?.data;
    }
  });

  Title.set("Endereços");
</script>

<Views.Divider />
<Views.Button {Layout} on:click={toggleNewCard}>novo cartão</Views.Button>
{#if !payments}
  <Views.LocalLoading size="2" />
{:else}
  {#each payments as { id, type, brand, last4Digits, selected }}
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
            {brand} **** **** **** {last4Digits}
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
      type="number"
      bind:rawValue={newCardObject.number}
      bind:isValid={newCardObjectValidation.number}
      placeHolder="Numero do cartão"
    />
    <Views.TextEdit
      type="name"
      placeHolder="Nome impresso no cartão"
      bind:value={newCardObject.holder}
    />
    <Views.TextEdit
      mask="__/__"
      maskKey="_"
      type="number"
      placeHolder="Validade do cartão"
      bind:rawValue={newCardObject.validity}
      bind:isValid={newCardObjectValidation.validity}
    />
    <Views.TextEdit
      mask="___"
      maskKey="_"
      type="number"
      placeHolder="Codigo de segurança do cartão"
      bind:rawValue={newCardObject.cvc}
      bind:isValid={newCardObjectValidation.cvc}
    />
    <Views.TextEdit
      type="cpf"
      placeHolder="CPF vinculado com o cartão"
      bind:rawValue={newCardObject.cpf}
      bind:isValid={newCardObjectValidation.cpf}
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
    border: 1px solid red;
    background: red;
    border-radius: 16px;
    width: 28px;
    height: 28px;
    vertical-align: middle;
    text-align: center;
    padding: 6px;
  }
</style>
