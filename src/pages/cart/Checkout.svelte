<script>
  import { Capacitor } from "@capacitor/core";
  import { login } from "../../stores/Auth";
  import { Geolocation } from "@capacitor/geolocation";
  import { onMount } from "svelte";
  import { Store } from "../../stores/Cart";
  import { Title, Navigation, Router } from "../../stores/Navigation";
  import { currency } from "../../Utils/Strings";
  import { GetAddress } from "../../network/User";
  import { GetPaymentMethods, DoPayment, PaymentType } from "../../network/Payment";
  import LocalLoading from "../../components/LocalLoading.svelte";
  import Fa from "svelte-fa";
  import { faEdit } from "@fortawesome/free-solid-svg-icons";
  import TextEdit from "../../components/TextEdit.svelte";
  import Loading from "../../components/Loading.svelte";
  import Button from "../../components/Button.svelte";
  import { StatusBar } from "../../stores/Setup";

  let location;
  let coupon;
  let isLoading = false;

  $: subtotalArray = $Store.map((item) => item.quantity * item.price);
  $: subtotal =
    subtotalArray.length > 0 ? subtotalArray.reduce((a, b) => a + b) : 0;
  $: delivery = 0;
  $: total = subtotal + delivery;
  $: styleBottomPadding = ($StatusBar.bottomPadding + 45) + "px";

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
    if ($login) {
      isLoading = true;
      const response = await DoPayment();
      isLoading = false;
      if (response != undefined && response.success) {
        Navigation.goTo(Router.values.order, response.payload);
      }
    } else {
      Navigation.reset(Router.values.login);
    }
  }

  Title.set("Resumo");
</script>

{#if isLoading}
  <Loading />
{/if}
<table>
  <thead>
    <tr>
      <th colspan="2" class="resumeHead">Resumo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="resumeText">Subtotal</td>
      <td class="resumeValue">{currency(subtotal)}</td>
    </tr>
    <tr>
      <td class="resumeText">Taxa de entrega</td>
      <td class="resumeValue"
        ><span class:deliveryFree={delivery == 0}>{currency(delivery)}</span
        ></td
      >
    </tr>
    <tr>
      <td class="resumeText">Total</td>
      <td class="resumeValue">{currency(total)}</td>
    </tr>
  </tbody>
</table>
<TextEdit bind:coupon placeHolder="Adicionar cupom" buttonName="Adicionar" />
<Button type="transparent" on:click={addMoreItems}>Addionar mais itens</Button>
{#await GetAddress()}
  <LocalLoading size="2" />
{:then addresses}
  {#each addresses as { id, cep, address, complement, neighborhood, city, stat, active }}
    {#if active}
      <div class="address">
        <div class="content">
          <span class="delivery">Entregar em</span>
          <span>{address}</span>
          <span class="neighborhood">{neighborhood} | {complement}</span>
          <span class="city">{city}/{stat} CEP: {cep}</span>
        </div>
        <div class="edit">
          <Fa
            style="font-size: 1.5em; color: black; padding-left: 10px;"
            icon={faEdit}
          />
        </div>
      </div>
    {/if}
  {/each}
{/await}
{#await GetPaymentMethods()}
  <LocalLoading size="2" />
{:then paymentMethods}
  {#each paymentMethods as { id, type, brand, lastDigits, selected }}
    {#if selected}
      <div class="paymentCard">
        <div class="content">
          <span class="payWith">Pagar com</span>
          <span>{PaymentType(type)}</span>
          <span class="brand">{brand} **** **** **** {lastDigits}</span>
        </div>
        <div class="edit">
          <Fa
            style="font-size: 1.5em; color: black; padding-left: 10px;"
            icon={faEdit}
          />
        </div>
      </div>
    {/if}
  {/each}
{/await}
<Button isFloat={true} on:click={forward} style="--bottomPadding:{styleBottomPadding}">
  <span
    >{#if $login}Confirmar o pagamento{:else}Faça login{/if}</span
  ></Button>
<style lang="scss" module>
  .future-is-bright {
    color: bright;
  }

  .margin-top {
    margin-top: 6px;
    // whatever you want
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
  .addMore {
    width: 100%;
    color: red;
    background: transparent;
    border: 0;
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
