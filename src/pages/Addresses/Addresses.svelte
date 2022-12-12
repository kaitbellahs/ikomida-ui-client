<script lang="ts">
  import { Views, Stores, Types } from '@ikomida/shared-frontend'
  import { GetAddresses, UpdateAddress, DeleteAddress } from '../../network/User'
  import { onMount } from 'svelte'
  import Routes from '../../stores/Routes'

  let addresses: Types.Classes.CAddress[]

  function toggleNewAddress() {
    Stores.Navigation.instance.goTo(Routes.newAddress)
  }

  async function updateAddress(id?: string) {
    Stores.Loading.instance.start()
    const response = await UpdateAddress(id)
    if (response?.success) {
      for (const item of addresses) {
        item.selected = false
        if (item.id === id) {
          item.selected = true
        }
      }
      addresses = [...addresses]
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  async function onRemoveClick(id?: string) {
    Stores.Loading.instance.start()
    const response = await DeleteAddress(id)
    if (response?.success) {
      addresses = addresses?.filter(item => item.id !== id)
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  onMount(async () => {
    let response = await GetAddresses()
    if (response?.success) {
      addresses = Types.Classes.CAddress.fromObject(response?.data)
    }else{
      addresses = []
    }
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Endereços')
</script>

<Views.Button on:click={toggleNewAddress}>Novo endereço</Views.Button>
{#if !addresses}
  <Views.LocalLoading size={2} />
{:else if (addresses?.length ?? 0) > 0}
  <Views.Divider />
  <h3>Selecione seu endereço principal</h3>
  <small>Esse endereço será usado para entregar seus pedidos</small>
  {#each addresses as address (address?.id)}
    <div class="address">
      <Views.FloatRemove callback={() => onRemoveClick(address?.id)} />
      <div class="content">
        <span class="street"
          >{address?.street}, {address?.number}{address?.complement ? ` - ${address?.complement}` : ''}</span
        >
        <span class="neighborhood">{address?.neighborhood}</span>
        <span class="city">{address?.city}/{address?.stat} CEP: {address?.postalCode}</span>
        <small style="text-align:left;">{address.kind?.name ?? '-'}, {address.reference}</small>
      </div>
      <div class="checkbox" on:click={() => updateAddress(address.id)}>
        <Views.Checkbox bind:checked={address.selected} />
      </div>
    </div>
  {/each}
{:else}
  <Views.CentredMessage
    text="Não há endereços para exibir, aproveite e cadastre deu endereço pricipal agora
mesmo!"
  />
{/if}

<style>
  .address {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    box-shadow: 0 4pt 8pt #0000009e;
    margin-top: 24pt;
    padding: 16pt;
    border-radius: 8pt;
  }
  .address > .checkbox {
    display: flex;
    align-items: flex-end;
  }
  .address > .content {
    display: flex;
    flex-direction: column;
    flex-grow: 2;
  }
  .address > .content > .street {
    font-family: 'RobotoMedium';
    margin-bottom: 16pt;
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
  h3,
  small {
    text-align: center;
  }
</style>
