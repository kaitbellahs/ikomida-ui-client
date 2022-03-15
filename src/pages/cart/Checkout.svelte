<script>
  import { Views, Utils, PagSeguro } from "@tian/components";
  import { Capacitor } from "@capacitor/core";
  import { Auth } from "../../stores/Auth";
  import { Geolocation } from "@capacitor/geolocation";
  import { onMount } from "svelte";
  import { Store, Cart } from "../../stores/Cart";
  import {
    GetPubKey,
    GetPaymentMethods,
    PaymentType,
    NewCard,
    AddCoupon,
  } from "../../network/Payment";
  import { NewOrders } from "../../network/Orders";
  import Fa from "svelte-fa";
  import { faEdit, faSearch } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import {
    GetAddresses,
    GetAddressByCep,
    NewAddress,
  } from "../../network/User";
  import { Title, Navigation, Routes } from "../../stores/Navigation";

  let location;
  let coupon;
  let couponObject = null;
  let isLoading = false;
  let addresses = null;
  let payments = null;
  let showUpdateAddress = false;
  let showNewAddress = false;
  let newAddressObject = {
    cep: null,
  };
  let currentCep = null;
  let showNewCard = false;
  let showUpdateCard = false;
  let newCardObject = {
    number: null,
  };
  let publicKey;

  $: if (
    newAddressObject &&
    newAddressObject.cep &&
    newAddressObject.cep.length === 8 &&
    newAddressObject.cep != currentCep
  ) {
    isLoading = true;
    GetAddressByCep(newAddressObject.cep).then((response) => {
      if (response.success) {
        const address = response.data;
        currentCep = address.cep;
        newAddressObject.id = address.id;
        newAddressObject.address = address.address;
        newAddressObject.number = address.number;
        newAddressObject.complement = address.complement;
        newAddressObject.neighborhood = address.neighborhood;
        newAddressObject.city = address.city;
        newAddressObject.stat = address.stat;
      }
      isLoading = false;
    });
  }

  $: subtotalArray = $Store.map((item) => item.quantity * item.price);
  $: subtotal =
    subtotalArray.length > 0 ? subtotalArray.reduce((a, b) => a + b) : 0;
  $: delivery = 0;
  $: total = subtotal + delivery - (couponObject ? couponObject.value : 0);
  $: validate =
    addresses && addresses.length > 0 && payments && payments.length > 0;

  function addMoreItems() {
    Navigation.pop(3);
  }

  async function getLocation() {
    if (Capacitor.isNativePlatform()) {
      const res = await Geolocation.getCurrentPosition();
      location = {
        latitude: res.coords.latitude,
        longitude: res.coords.longitude,
      };
    } else {
      navigator.geolocation.getCurrentPosition((pos) => {
        location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      });
    }
  }

  onMount(async () => {
    let response = await GetAddresses();
    if (response.success) {
      addresses = response.data;
    }
    response = await GetPaymentMethods();
    if (response.success) {
      payments = response.data;
    }
    if (Capacitor.isNativePlatform()) {
      const checkpermissions = await Geolocation.checkPermissions();
      if (checkpermissions.location != "prompt") {
        const permissions = await Geolocation.requestPermissions();
        if (permissions.location != "granted") {
          await getLocation();
        }
      } else {
        await getLocation();
      }
    } else {
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        if (permission.state != "denied") {
          await getLocation();
        }
      } else if (navigator.geolocation) {
        await getLocation();
      }
    }
  });

  async function forward() {
    if ($Auth !== null && $Auth !== undefined && $Auth !== "null") {
      isLoading = true;
      const payload = {
        items: $Store,
        address: addresses.filter((address) => address.active)[0],
        payment: payments.filter((payment) => payment.selected)[0],
        coupon: couponObject,
        location,
      };
      const response = await NewOrders(payload);
      isLoading = false;
      if (response && response.success) {
        Cart.reset();
        Navigation.goTo(Routes.order, response.data);
      }
    } else {
      Navigation.reset(Routes.login);
    }
  }

  // MARK: address
  function toggleUpdateAddress() {
    showUpdateAddress = !showUpdateAddress;
  }

  function toggleNewAddress() {
    showUpdateAddress = false;
    showNewAddress = !showNewAddress;
  }

  async function newAddress() {
    isLoading = true;
    const response = await NewAddress(newAddressObject);
    if (response.success) {
      addresses = response.data;
    }
    showNewAddress = !showNewAddress;
    isLoading = false;
  }

  function updateAddress(id) {
    addresses.forEach((item) => {
      item.active = false;
      if (item.id === id) {
        item.active = true;
      }
    });
    addresses = [...addresses];
    toggleUpdateAddress();
  }

  // MARK: cart
  function toggleUpdateCard() {
    showUpdateCard = !showUpdateCard;
  }

  function toggleNewCard() {
    showUpdateCard = false;
    showNewCard = !showNewCard;
  }

  async function newCard() {
    isLoading = true;
    if (!publicKey) {
      publicKey = await GetPubKey();
    }
    var card = PagSeguro.encryptCard({
      publicKey: publicKey,
      holder: newCardObject.name,
      number: newCardObject.number,
      expMonth: newCardObject.validate.substring(0, 2),
      expYear: `20${newCardObject.validate.substring(3, 5)}`,
      securityCode: newCardObject.cvv,
    });
    if (card.encryptedCard) {
      const newCard = {
        first6Digits: newCardObject.number.substring(0, 6),
        last4Digits: newCardObject.number.substring(
          newCardObject.number.length - 4,
          newCardObject.number.length
        ),
        encryptedCard: card.encryptedCard,
      };
      const response = await NewCard(newCard);
      if (response.success) {
        payments = response.data;
      }
    }
    showNewCard = !showNewCard;
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
    toggleUpdateCard();
  }

  async function addCoupon() {
    if (coupon && coupon.length > 3) {
      isLoading = true;
      const response = await AddCoupon(coupon);
      if (response.success) {
        couponObject = response.data;
      }
      isLoading = false;
    }
  }

  function removeCoupon() {
    couponObject = null;
    coupon = null;
  }

  Title.set("Resumo e pagamento");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}

<!-- MARK: address -->
{#if showNewAddress}
  <Views.Alert
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
      icon={faSearch}
      bind:rawValue={newAddressObject.cep}
      placeHolder="CEP"
    />
    <Views.TextEdit
      placeHolder="Endereço"
      bind:value={newAddressObject.address}
    />
    <Views.TextEdit placeHolder="Numero" bind:value={newAddressObject.number} />
    <Views.TextEdit
      placeHolder="Complemento"
      bind:value={newAddressObject.complement}
    />
    <Views.TextEdit
      placeHolder="Bairro"
      bind:value={newAddressObject.neighborhood}
    />
    <Views.TextEdit placeHolder="Cidade" bind:value={newAddressObject.city} />
    <Views.TextEdit placeHolder="UF" bind:value={newAddressObject.stat} />
  </Views.Alert>
{/if}

{#if showUpdateAddress}
  <Views.Alert
    title="Escolha um endereço!"
    closeCallBack={toggleUpdateAddress}
    buttons={[
      { name: "OK", callback: toggleUpdateAddress, principal: true },
      { name: "Novo", callback: toggleNewAddress },
    ]}
  >
    {#each addresses as { id, cep, address, number, complement, neighborhood, city, stat, active }}
      <div class="address">
        <div class="content">
          <span class="delivery">Entregar em</span>
          <span>{address}, {number}</span>
          <span class="neighborhood">{neighborhood} | {complement}</span>
          <span class="city">{city}/{stat} CEP: {cep}</span>
        </div>
        <div class="edit" on:click={updateAddress(id)}>
          <input type="checkbox" bind:checked={active} />
        </div>
      </div>
    {/each}
  </Views.Alert>
{/if}
<!-- MARK: end address-->

<!-- MARK: Card -->
{#if showNewCard}
  <Views.Alert
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
      bind:value={newCardObject.validate}
    />
    <Views.TextEdit
      mask="___"
      maskKey="_"
      placeHolder="CVV"
      bind:value={newCardObject.cvv}
    />
    <Views.TextEdit
      type="cpf"
      placeHolder="CPF"
      bind:value={newCardObject.cpf}
    />
  </Views.Alert>
{/if}

{#if showUpdateCard}
  <Views.Alert
    title="Escolha um cartão!"
    closeCallBack={toggleUpdateCard}
    buttons={[
      { name: "OK", callback: toggleUpdateCard, principal: true },
      { name: "Novo", callback: toggleNewCard },
    ]}
  >
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
  </Views.Alert>
{/if}
<!-- MARK: end Card-->

<table>
  <thead>
    <tr>
      <th colspan="2" class="resumeHead">Resumo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="resumeText">Subtotal</td>
      <td class="resumeValue">{Utils.Strings.currency(subtotal)}</td>
    </tr>
    {#if couponObject}
      <tr>
        <td class="resumeText">cupom</td>
        <td class="resumeValue"
          ><span class="deliveryFree"
            >- {Utils.Strings.currency(couponObject.value)}</span
          ></td
        >
      </tr>
    {/if}
    <tr>
      <td class="resumeText">Taxa de entrega</td>
      <td class="resumeValue"
        ><span class:deliveryFree={delivery == 0}
          >{Utils.Strings.currency(delivery)}</span
        ></td
      >
    </tr>
    <tr>
      <td class="resumeText">Total</td>
      <td class="resumeValue">{Utils.Strings.currency(total)}</td>
    </tr>
  </tbody>
</table>
{#if couponObject}
  <Views.Button type="transparent" on:click={removeCoupon}
    >Remover o cupom</Views.Button
  >
{:else}
  <Views.TextEdit
    bind:value={coupon}
    placeHolder="Adicionar cupom"
    buttonName="Adicionar"
    callback={addCoupon}
  />
{/if}
<Views.Button type="transparent" on:click={addMoreItems}
  >Addionar mais itens</Views.Button
>
{#if !addresses}
  <Views.LocalLoading size="2" />
{:else if addresses.length == 0}
  <Views.Button on:click={toggleNewAddress}>novo endereço</Views.Button>
{:else}
  {#each addresses as { cep, address, complement, neighborhood, city, stat, active }}
    {#if active}
      <div class="address">
        <div class="content">
          <span class="delivery">Entregar em</span>
          <span>{address}</span>
          <span class="neighborhood">{neighborhood} | {complement}</span>
          <span class="city">{city}/{stat} CEP: {cep}</span>
        </div>
        <div class="edit" on:click={toggleUpdateAddress}>
          <Fa
            style="font-size: 1.5em; color: black; padding-left: 10px;"
            icon={faEdit}
          />
        </div>
      </div>
    {/if}
  {/each}
{/if}
{#if !payments}
  <Views.LocalLoading size="2" />
{:else if payments.length == 0}
  <Views.Button on:click={toggleNewCard}>novo cartão</Views.Button>
{:else}
  {#each payments as { id, type, brand, lastDigits, selected }}
    {#if selected}
      <div class="paymentCard">
        <div class="content">
          <span class="payWith">Pagar com</span>
          <span>{PaymentType(type)}</span>
          <span class="brand">
            {#if type !== "Cash"}
              {brand} **** **** **** {lastDigits}
            {:else}
              Pagar na entrega
            {/if}
          </span>
        </div>
        <div class="edit" on:click={toggleUpdateCard}>
          <Fa
            style="font-size: 1.5em; color: black; padding-left: 10px;"
            icon={faEdit}
          />
        </div>
      </div>
    {/if}
  {/each}
{/if}
<Views.Button disabled={!validate} isFloat={true} on:click={forward}>
  <span
    >{#if $Auth && $Auth !== "" && $Auth !== "null"}Confirmar o pagamento{:else}Faça
      login{/if}</span
  ></Views.Button
>

<style>
  input[type="checkbox"] {
    appearance: none;
    background-color: #fff;
    margin: 0;
    font: inherit;
    width: 2.2em;
    height: 2.2em;
    border: 0.05em solid #000;
    border-radius: 0.35em;
    transform: translateY(0.375em);
    display: grid;
    place-content: center;
  }
  input[type="checkbox"]::before {
    content: "";
    width: 1.15em;
    height: 1.15em;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em #ccc;
    transform-origin: bottom left;
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  }

  input[type="checkbox"]:checked::before {
    transform: scale(1);
  }

  input[type="checkbox"]:disabled {
    --form-control-color: #ccc;

    color: #ccc;
    cursor: not-allowed;
  }
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
  table {
    width: 100%;
    padding-bottom: 10px;
  }
  .resumeHead {
    font-size: 1.1em;
  }
  .resumeText {
    text-align: left;
    width: 50%;
    font-size: 0.9em;
    font-weight: lighter;
  }
  .resumeValue {
    text-align: right;
    font-size: 0.9em;
  }
  .deliveryFree {
    color: green;
  }
</style>
