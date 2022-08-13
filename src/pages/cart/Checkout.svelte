<script>
  import { Views, Utils, Types } from "@ikomida/components";
  import { Capacitor } from "@capacitor/core";
  import { Auth } from "../../stores/Auth";
  import { Geolocation } from "@capacitor/geolocation";
  import { onMount } from "svelte";
  import { Store, Cart } from "../../stores/Cart";
  import { Layout, Settings } from "../../stores/Setup";
  import { GetPaymentMethods, AddCoupon } from "../../network/Payment";
  import { NewOrders } from "../../network/Orders";
  import { StatusBar } from "../../stores/Setup";
  import { GetAddresses, GetSettings } from "../../network/User";
  import { Title, Navigation, Routes } from "../../stores/Navigation";
  let location;
  let coupon;
  let couponObject = null;
  let isLoading = false;
  let address;
  let payment;

  let errorAlert;
  let showAlert = false;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  $: subtotalArray = $Store.map(
    (item) =>
      item.quantity *
      (item?.price -
        Utils.Numbers.calcDiscount(
          item.price,
          item.discount,
          item.discountType
        ))
  );
  $: subtotal =
    subtotalArray.length > 0 ? subtotalArray.reduce((a, b) => a + b) : 0;
  $: calcDelivery = address
    ? ((address?.distance ?? 0) / 1000) * ($Settings?.delivery?.value ?? 0)
    : 0;
  $: delivery = $Settings?.delivery?.free
    ? 0
    : calcDelivery < $Settings?.delivery?.min
    ? $Settings?.delivery?.min
    : calcDelivery;
  $: netTotal = subtotal + delivery;
  $: discount = couponObject
    ? Utils.Numbers.calcDiscount(
        subtotal,
        couponObject.value,
        couponObject.type
      )
    : 0;
  $: total = netTotal - discount;
  $: validate = address && payment;
  $: businessTime = Utils.Numbers.isBusinessTime($Settings.business);

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

  async function forward() {
    if ($Auth !== null && $Auth !== undefined && $Auth !== "null") {
      isLoading = true;
      const payload = {
        items: $Store,
        address,
        payment,
        delivery,
        coupon: couponObject,
        location,
      };
      const response = await NewOrders(payload);
      isLoading = false;
      if (response && response?.success) {
        Cart.reset();
        Navigation.goTo(Routes.order, {
          newOrder: true,
          order: response?.data,
        });
      } else {
        toggleErrorAlert(response?.data);
      }
    } else {
      Navigation.reset(Routes.login);
    }
  }

  async function addCoupon() {
    if (coupon && coupon.length >= 3) {
      isLoading = true;
      const response = await AddCoupon(coupon);
      if (response?.success) {
        couponObject = response?.data;
      }
      isLoading = false;
    }
  }

  function removeCoupon() {
    couponObject = null;
    coupon = null;
  }

  function manageCard() {
    Navigation.goTo(Routes.payments);
  }

  function manageAddress() {
    Navigation.goTo(Routes.addresses);
  }

  onMount(async () => {
    isLoading = true;
    let response = await GetSettings();
    if (response?.success && response?.data) {
      Settings.set({ ...$Settings, ...response?.data });
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
    response = await GetAddresses();
    if (response?.success) {
      const addresses = response?.data?.filter((item) => item.selected);
      address = (addresses?.length ?? 0) === 1 ? addresses[0] : null;
    }
    response = await GetPaymentMethods();
    if (response?.success) {
      const payments = response?.data?.filter((item) => item.selected);
      payment = (payments?.length ?? 0) === 1 ? payments[0] : null;
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

  Title.set("Resumo e pagamento");
</script>

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
    {#if discount !== 0}
      <tr>
        <td class="resumeText"
          >cupom (- {couponObject?.type?.toUpperCase() ===
          Types?.DiscountTypes?.PERCENT?.toUpperCase()
            ? Utils.Strings.percent(couponObject?.value)
            : Utils.Strings.currency(couponObject?.value)})
        </td>
        <td class="resumeValue"
          ><span class="deliveryFree">- {Utils.Strings.currency(discount)}</span
          ></td
        >
      </tr>
    {/if}
    <tr>
      <td class="resumeText">Taxa de entrega</td>
      <td class="resumeValue"
        ><span class:deliveryFree={delivery == 0}
          >{delivery == 0 ? "Gratis" : Utils.Strings.currency(delivery)}</span
        ></td
      >
    </tr><tr class="spacer" />
    <tr class="total">
      <td class="resumeText">Total</td>
      <td class="resumeValue total">{Utils.Strings.currency(total)}</td>
    </tr>
  </tbody>
</table>
{#if couponObject}
  <Views.Button {Layout} type="transparent" on:click={removeCoupon}
    >Remover o cupom</Views.Button
  >
{:else}
  <Views.TextEdit
    bind:value={coupon}
    placeHolder="Adicionar cupom"
    buttonName="Adicionar"
    callback={addCoupon}
    type="alphanumeric"
    upper={true}
  />
{/if}
<Views.Button {Layout} type="transparent" on:click={addMoreItems}
  >Adicionar mais itens</Views.Button
>
<Views.Divider />
<Views.Button {Layout} on:click={manageAddress}>trocar endereço</Views.Button>
{#if address === undefined}
  <Views.LocalLoading size="2" />
{:else if address}
  <div class="address">
    <div class="content">
      <span class="delivery">A entrega será realizada na</span>
      <span
        >{address?.street}, {address?.number}{address?.complement
          ? ` - ${address?.complement}`
          : ""}</span
      >
      <span class="neighborhood">{address?.neighborhood} </span>
      <span class="city"
        >{address?.city}/{address?.stat} CEP: {address?.postalCode}</span
      >
    </div>
  </div>
{:else}
  <h3>Para continuar precisa selecionar ou adicionar um endereço</h3>
{/if}
<Views.Divider />
<Views.Button {Layout} on:click={manageCard}
  >Trocar meio de pagamento</Views.Button
>
{#if payment === undefined}
  <Views.LocalLoading size="2" />
{:else if payment}
  <div class="paymentCard">
    <div class="content">
      <span class="payWith">A cobrança será realizada com</span>
      <span class="paymentType"
        >{Utils.Strings.capitalizeFirstLeter(
          new Types.PaymentMethodType(payment?.type).name
        )}</span
      >
      {new Types.PaymentMethodType(payment?.type).description}
      <span class="brand">
        {#if payment?.type === Types.PaymentMethodType.CREDIT_CARD_ONLINE}
          <img
            src="/assets/cardBrand/{payment?.brand}.svg"
            alt={payment?.brand}
          />
          **** {payment?.lastDigits}
        {/if}
      </span>
    </div>
  </div>
{:else}
  <h3>
    Para continuar precisa selecionar ou adicionar um novo cartão de crédito
  </h3>
{/if}
{#if businessTime}
  <Views.Button {Layout} disabled={!validate} isFloat={true} on:click={forward}>
    <span>Confirmar o {payment?.type === "Cash" ? "pedido" : "pagamento"}</span
    ></Views.Button
  >
{:else}
  <h2 class="businessHoursError">
    Estámos fora do horario do funcionamento, confire os nossos horários
  </h2>
{/if}
<Views.GTerms />

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
  .paymentCard > .content > .brand > img {
    height: 14px;
  }
  .paymentCard > .content > .brand {
    font-weight: lighter;
    font-size: 1em;
    width: 100%;
    margin-top: 5px;
  }
  .address {
    width: 100%;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ccc;
    padding: 10px 0;
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
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 0.4em;
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
  tr.total {
    padding-top: 10px;
  }
  .resumeValue.total {
    font-size: 1.1em;
  }
  .deliveryFree {
    color: green;
  }
  .businessHoursError {
    text-align: center;
    color: #4c0708;
    margin-top: 20px;
  }
</style>
