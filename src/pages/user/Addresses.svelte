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
    GetAddresses,
    GetAddressByCep,
    NewAddress,
  } from "../../network/User";
  import { onMount } from "svelte";
  import { Layout } from "../../stores/Setup";

  let addresses;
  let currentPostalCode;
  let showNewAddress = false;
  let isLoading = false;
  let newAddressObject = {
    postalCode: null,
  };

  let errorAlert;
  let showAlert = false;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  $: if (
    newAddressObject &&
    newAddressObject.postalCode &&
    newAddressObject.postalCode.length === 8 &&
    newAddressObject.postalCode != currentPostalCode
  ) {
    findAddress();
  }

  function findAddress() {
    isLoading = true;
    currentPostalCode = newAddressObject.postalCode;
    GetAddressByCep(newAddressObject.postalCode)
      .then((response) => {
        if (response?.success) {
          const address = response?.data;
          currentPostalCode = address.postalCode;
          newAddressObject.id = address.id;
          newAddressObject.street = address.street;
          newAddressObject.number = address.number;
          newAddressObject.complement = address.complement;
          newAddressObject.neighborhood = address.neighborhood;
          newAddressObject.city = address.city;
          newAddressObject.stat = address.stat;
        } else {
          toggleErrorAlert(response?.data);
        }
        isLoading = false;
      })
      .catch((exception) => {
        toggleErrorAlert(exception);
      });
  }

  function toggleNewAddress() {
    showNewAddress = !showNewAddress;
  }

  async function newAddress() {
    isLoading = true;
    const response = await NewAddress(newAddressObject);
    if (response?.success) {
      addresses = response?.data;
    }
    showNewAddress = !showNewAddress;
    isLoading = false;
  }

  function updateAddress(id) {
    addresses.forEach((item) => {
      item.selected = false;
      if (item.id === id) {
        item.selected = true;
      }
    });
    addresses = [...addresses];
  }

  onMount(async () => {
    let response = await GetAddresses();
    if (response?.success) {
      addresses = response?.data;
    }
  });

  Title.set("Endereços");
</script>

<Views.Button {Layout} on:click={toggleNewAddress}>novo endereço</Views.Button>
{#if !addresses}
  <Views.LocalLoading size="2" />
{:else}
  {#each addresses as { id, postalCode, street, number, complement, neighborhood, city, stat, selected }}
    <div class="address">
      <div class="content">
        <span class="delivery">Entregar em</span>
        <span>{street}, {number}</span>
        <span class="neighborhood">{neighborhood} | {complement}</span>
        <span class="city">{city}/{stat} CEP: {postalCode}</span>
      </div>
      <div class="edit" on:click={updateAddress(id)}>
        <input type="checkbox" bind:checked={selected} />
      </div>
    </div>
  {/each}
{/if}

{#if showNewAddress}
  <Views.Alert
    {Layout}
    type="big"
    title="Novo endereço!"
    closeCallBack={toggleNewAddress}
    buttons={[
      { name: "Cancelar", callback: toggleNewAddress, principal: true },
      { name: "Adicionar", callback: newAddress },
    ]}
  >
    <Views.TextEdit
      mask="_____-___"
      maskKey="_"
      type="number"
      callback={findAddress}
      buttonIcon={faSearch}
      bind:rawValue={newAddressObject.postalCode}
      placeHolder="CEP"
    />
    <Views.TextEdit
      placeHolder="Endereço"
      type="spacedAlphanumeric"
      bind:value={newAddressObject.street}
    />
    <Views.TextEdit placeHolder="Numero" bind:value={newAddressObject.number} />
    <Views.TextEdit
      placeHolder="Complemento"
      type="spacedAlphanumeric"
      bind:value={newAddressObject.complement}
    />
    <Views.TextEdit
      placeHolder="Bairro"
      type="spacedAlphanumeric"
      bind:value={newAddressObject.neighborhood}
    />
    <Views.TextEdit placeHolder="Cidade" bind:value={newAddressObject.city} />
    <Views.TextEdit placeHolder="UF" bind:value={newAddressObject.stat} />
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
  .address {
    width: 100%;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ccc;
    padding-bottom: 10px;
  }
  .address > .content {
    display: flex;
    flex-direction: column;
    flex-grow: 2;
  }
  .address > .content > .delivery {
    font-weight: lighter;
    font-size: 0.9em;
    width: 100%;
  }
  .address > .content > .neighborhood {
    font-weight: lighter;
    font-size: 1em;
    width: 100%;
  }
  .address > .content > .city {
    font-weight: lighter;
    font-size: 0.9em;
    width: 100%;
  }

  .edit {
    flex-grow: 1;
    text-align: end;
  }
</style>
