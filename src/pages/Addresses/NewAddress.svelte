<script lang="ts">
  import { faSearch } from '@fortawesome/free-solid-svg-icons';
  import { onMount } from 'svelte';
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend';
  import { GetAddressByCep, NewAddress } from '../../network/User';

  interface INewAddress {
    postalCode: Views.TextEdit | null;
    street: Views.TextEdit | null;
    number: Views.TextEdit | null;
    complement: Views.TextEdit | null;
    neighborhood: Views.TextEdit | null;
    city: Views.TextEdit | null;
    reference: Views.TextEdit | null;
    stat: Views.TextEdit | null;
  }
  let currentPostalCode: string;

  let newAddressObjectInputs: INewAddress = {
    postalCode: null,
    street: null,
    number: null,
    complement: null,
    neighborhood: null,
    city: null,
    stat: null,
    reference: null,
  };
  let newAddressObjectValidation = {
    postalCode: false,
    street: false,
    number: false,
    neighborhood: false,
    city: false,
    stat: false,
    reference: false,
  };
  let newAddressObject: Types.Classes.CAddress = Types.Classes.CAddress.fillWith(null);
  $: canProceed = Utils?.Objects?.validateFields(newAddressObjectValidation);

  $: if ((newAddressObject.postalCode?.length ?? 0) === 8 && newAddressObject.postalCode != currentPostalCode) {
    findAddress();
  }

  function findAddress() {
    Stores.Loading.instance.start();
    currentPostalCode = newAddressObject.postalCode;
    GetAddressByCep(newAddressObject.postalCode)
      .then((response) => {
        if (response?.success) {
          const address = response?.data;
          currentPostalCode = address?.postalCode;
          newAddressObject = Types.Classes.CAddress.fromObject({ ...newAddressObject.toJSON(), ...address });
          Utils?.Objects?.updateInputs(newAddressObjectInputs, newAddressObject.toJSON());
        } else {
          Stores.MessageAlert.instance.show(response?.data);
        }
        Stores.Loading.instance.stop();
      })
      .catch((exception) => {
        Stores.MessageAlert.instance.show(exception);
      });
  }

  async function newAddress() {
    if (!newAddressObject.kind) {
      Stores.MessageAlert.instance.show(`O tipo do endereço é do preenchimento obrigatorio`);
    } else if ((newAddressObject.street?.length ?? 0) < 3) {
      Stores.MessageAlert.instance.show(`é obrigatorio o preencheemento do CEP`);
    } else if ((newAddressObject.street?.length ?? 0) < 3) {
      Stores.MessageAlert.instance.show(`é obrigatorio o preencheemento do nome da rua`);
    } else if ((newAddressObject.neighborhood?.length ?? 0) < 2) {
      Stores.MessageAlert.instance.show(`é obrigatorio o preencheemento do nome do bairro`);
    } else if ((newAddressObject.city?.length ?? 0) < 3) {
      Stores.MessageAlert.instance.show(`é obrigatorio o preencheemento do nome da cidade`);
    } else if ((newAddressObject.stat?.length ?? 0) !== 2) {
      Stores.MessageAlert.instance.show(`é obrigatorio o preencheemento do simbolo do estado`);
    } else {
      Stores.Loading.instance.start();
      console.log('newAddressObject', newAddressObject);
      const response = await NewAddress(newAddressObject);
      if (response?.success) {
        Stores.Navigation.instance.pop();
      } else {
        Stores.MessageAlert.instance.show(response?.data);
      }
      Stores.Loading.instance.stop();
    }
  }

  onMount(() => {
    Stores.Loading.instance.stop();
  });

  Stores.Title.instance.set('Novo cartão');
</script>

<Views.Divider />
<h2>Preencha aqui os dados do seu cartão</h2>
<Views.Divider />
<Views.Selector
  name="Tipo do endereço:"
  options={Types.Types.TAddress.values()}
  bind:selected={newAddressObject.kind}
/>
<Views.TextEdit
  placeHolder="Referencia"
  bind:value={newAddressObject.reference}
  bind:this={newAddressObjectInputs.reference}
  bind:isValid={newAddressObjectValidation.reference}
  max={255}
/>
<Views.TextEdit
  type={Types.TTextEdit.CEP}
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
  min={2}
  max={255}
/>
<Views.TextEdit
  placeHolder="Número"
  bind:value={newAddressObject.number}
  bind:this={newAddressObjectInputs.number}
  bind:isValid={newAddressObjectValidation.number}
  min={1}
  max={255}
  empty={!newAddressObjectValidation.postalCode}
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
  min={2}
  max={255}
/>
<Views.TextEdit
  disabled={true}
  placeHolder="Cidade"
  bind:value={newAddressObject.city}
  bind:isValid={newAddressObjectValidation.city}
  bind:this={newAddressObjectInputs.city}
  min={2}
  max={255}
/>
<Views.TextEdit
  disabled={true}
  placeHolder="UF"
  bind:value={newAddressObject.stat}
  bind:this={newAddressObjectInputs.stat}
  bind:isValid={newAddressObjectValidation.stat}
  min={2}
  max={2}
/>
<Views.Divider />
<Views.Button disabled={!canProceed} on:click={newAddress}>Adicionar</Views.Button>

<style>
  h2 {
    text-align: center;
  }
</style>
