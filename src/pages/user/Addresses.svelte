<script>
  import { Title } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faTrashAlt, faSearch } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views } from "@ikomida/components";
  import {
    GetAddresses,
    GetAddressByCep,
    NewAddress,
    UpdateAddress,
    DeleteAddress,
  } from "../../network/User";
  import { onMount } from "svelte";
  import { Layout } from "../../stores/Setup";

  let addresses;
  let currentPostalCode;
  let showNewAddress = false;
  let isLoading = false;
  let newAddressObject = {
    postalCode: null,
    street: null,
    number: null,
    complement: null,
    neighborhood: null,
    city: null,
    stat: null,
  };
  let newAddressObjectInputs = {
    postalCode: null,
    street: null,
    number: null,
    complement: null,
    neighborhood: null,
    city: null,
    stat: null,
  };
  let newAddressObjectValidation = {
    postalCode: false,
    street: false,
    number: false,
    neighborhood: false,
    city: false,
    stat: false,
  };

  let errorAlert;
  let showAlert = false;

  $: if (
    (newAddressObject?.postalCode?.length ?? 0) === 8 &&
    newAddressObject?.postalCode != currentPostalCode
  ) {
    findAddress();
  }

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  function findAddress() {
    isLoading = true;
    currentPostalCode = newAddressObject?.postalCode;
    GetAddressByCep(newAddressObject?.postalCode)
      .then((response) => {
        if (response?.success) {
          const address = response?.data;
          currentPostalCode = address?.postalCode;
          newAddressObject = { ...newAddressObject, ...address };
          newAddressObjectInputs.street.updateValue(newAddressObject?.street);
          newAddressObjectInputs.number.updateValue(newAddressObject?.number);
          newAddressObjectInputs.complement.updateValue(
            newAddressObject?.complement
          );
          newAddressObjectInputs.neighborhood.updateValue(
            newAddressObject?.neighborhood
          );
          newAddressObjectInputs.city.updateValue(newAddressObject?.city);
          newAddressObjectInputs.stat.updateValue(newAddressObject?.stat);
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
    if ((newAddressObject?.postalCode?.length ?? 0) !== 8) {
      toggleErrorAlert(`é obrigatorio o preencheemento do CEP`);
    } else if ((newAddressObject?.street?.length ?? 0) < 3) {
      toggleErrorAlert(`é obrigatorio o preencheemento do nome da rua`);
    } else if ((newAddressObject?.neighborhood?.length ?? 0) < 2) {
      toggleErrorAlert(`é obrigatorio o preencheemento do nome do bairro`);
    } else if ((newAddressObject?.city?.length ?? 0) < 3) {
      toggleErrorAlert(`é obrigatorio o preencheemento do nome da cidade`);
    } else if ((newAddressObject?.stat?.length ?? 0) !== 2) {
      toggleErrorAlert(`é obrigatorio o preencheemento do simbolo do estado`);
    } else {
      isLoading = true;
      const response = await NewAddress(newAddressObject);
      if (response?.success) {
        addresses = response?.data;
        newAddressObject = {
          postalCode: null,
        };
      } else {
        toggleErrorAlert(response?.data);
      }
      showNewAddress = false;
      isLoading = false;
    }
  }

  async function updateAddress(id) {
    isLoading = true;
    const response = await UpdateAddress(id);
    if (response?.success) {
      for (const item of addresses) {
        item.selected = false;
        if (item.id === id) {
          item.selected = true;
        }
      }
      addresses = [...addresses];
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function onRemoveClick(id) {
    isLoading = true;
    const response = await DeleteAddress(id);
    if (response?.success) {
      addresses = addresses?.filter((item) => item.id !== id);
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  onMount(async () => {
    let response = await GetAddresses();
    if (response?.success) {
      addresses = response?.data;
    }
  });

  Title.set("Endereços");
</script>

<Views.Divider />
<Views.Button {Layout} on:click={toggleNewAddress}>novo endereço</Views.Button>
{#if !addresses}
  <Views.LocalLoading size="2" />
{:else}
  {#each addresses as { id, postalCode, street, number, complement, neighborhood, city, stat, selected }}
    <div class="address">
      <span on:click={onRemoveClick(id)} class="remove"
        ><Fa icon={faTrashAlt} /></span
      >
      <div class="content">
        <span class="street">{street}, {number}</span>
        <span class="neighborhood">{neighborhood} | {complement}</span>
        <span class="city">{city}/{stat} CEP: {postalCode}</span>
      </div>
      <div class="edit" on:click={updateAddress(id)}>
        <Views.Checkbox bind:checked={selected} />
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
      { name: "Cancelar", callback: toggleNewAddress },
      { name: "Adicionar", callback: newAddress, principal: true },
    ]}
  >
    <Views.TextEdit
      type="cep"
      callback={findAddress}
      buttonIcon={faSearch}
      bind:value={newAddressObject.postalCode}
      bind:this={newAddressObjectInputs.postalCode}
      bind:isValid={newAddressObjectValidation.postalCode}
      placeHolder="CEP"
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="Endereço"
      bind:value={newAddressObject.street}
      bind:this={newAddressObjectInputs.street}
      bind:isValid={newAddressObjectValidation.street}
      min="2"
      max="255"
    />
    <Views.TextEdit
      placeHolder="Número"
      bind:value={newAddressObject.number}
      bind:this={newAddressObjectInputs.number}
      bind:isValid={newAddressObjectValidation.number}
      min="1"
      max="255"
      empty={false}
    />
    <Views.TextEdit
      placeHolder="Complemento"
      bind:value={newAddressObject.complement}
      bind:this={newAddressObjectInputs.complement}
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="Bairro"
      bind:value={newAddressObject.neighborhood}
      bind:isValid={newAddressObjectValidation.neighborhood}
      bind:this={newAddressObjectInputs.neighborhood}
      min="2"
      max="255"
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="Cidade"
      bind:value={newAddressObject.city}
      bind:isValid={newAddressObjectValidation.city}
      bind:this={newAddressObjectInputs.city}
      min="2"
      max="255"
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="UF"
      bind:value={newAddressObject.stat}
      bind:this={newAddressObjectInputs.stat}
      bind:isValid={newAddressObjectValidation.stat}
      min="2"
      max="2"
    />
    <Views.Divider />
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
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ccc;
    box-shadow: 1px 2px #cccccc66;
    margin-top: 30px;
    padding: 10px;
  }
  .address > .content {
    display: flex;
    flex-direction: column;
    flex-grow: 2;
  }
  .address > .content > .street {
    font-family: "RobotoMedium";
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
    position: absolute;
    right: 10px;
    bottom: 10px;
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
