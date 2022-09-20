<script lang="ts">
  import { Views, Stores, Types } from '@ikomida/shared-frontend';
  import { NewCreditCard } from '../../network/Payment';
  import creditCardType from 'credit-card-type';
  import { onMount } from 'svelte';
  import type { CreditCardType } from 'credit-card-type/dist/types';

  let newCreditCardObject: Types.Classes.CCreditCardRequest = Types.Classes.CCreditCardRequest.fillWith(null);
  let cardNumberMask = '____ ____ ____ ____';
  let cardCodeMask = '___';
  let cardBrandIcon: string;
  let newCreditCardObjectValidation = {
    holder: false,
    validity: false,
    code: false,
    number: false,
  };

  let cardInfo: CreditCardType;
  let showNewMethodAlert = false;

  $: if ((String(newCreditCardObject.number ?? '').length ?? 0) > 0) {
    const cardInfos = creditCardType(String(newCreditCardObject.number));
    if (cardInfos && (cardInfos?.length ?? 0) > 0) {
      cardInfo = cardInfos?.[0];
      let gapsIndex = 0;
      cardNumberMask = '';
      for (let i = 1; i <= cardInfo?.lengths[0] ?? 0; i++) {
        cardNumberMask += '_';
        if (i == cardInfo?.gaps?.[gapsIndex]) {
          gapsIndex++;
          cardNumberMask += ' ';
        }
      }
      cardCodeMask = '';
      for (let i = 1; i <= cardInfo?.code?.size; i++) {
        cardCodeMask += '_';
      }
      cardBrandIcon = `/assets/cardBrand/${cardInfo?.type?.toLowerCase() ?? ''}.svg`;
    }
  }

  function openNewMethodAlert() {
    if (!newCreditCardObjectValidation?.holder) {
      Stores.MessageAlert.instance.show(`é obrigatorio o preencheemento do nome`);
    } else if (!newCreditCardObjectValidation?.number) {
      Stores.MessageAlert.instance.show(`é obrigatorio o preencheemento do Número do cartão`);
    } else if (!newCreditCardObjectValidation?.validity) {
      Stores.MessageAlert.instance.show(`é obrigatorio o preencheemento da validade do cartão`);
    } else if (!newCreditCardObjectValidation?.code) {
      Stores.MessageAlert.instance.show(`é obrigatorio o preencheemento do código de segurança`);
    } else {
      showNewMethodAlert = true;
    }
  }

  function closeNewMethodAlert() {
    showNewMethodAlert = false;
  }

  async function newCreditCard() {
    showNewMethodAlert = false;
    Stores.Loading.instance.start();
    const response = await NewCreditCard(newCreditCardObject);
    if (response?.success) {
      Stores.Navigation.instance.pop();
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
    Stores.Loading.instance.stop();
  }

  onMount(() => {
    Stores.Loading.instance.stop();
  });

  Stores.Title.instance.set('Novo cartão');
</script>

<Views.Divider />
<h2>Preencha aqui os dados do seu cartão</h2>
<Views.Divider />
<Views.TextEdit
  mask={cardNumberMask}
  icon={cardBrandIcon}
  maskKey="_"
  type={Types.TTextEdit.NUMBER}
  bind:value={newCreditCardObject.number}
  bind:isValid={newCreditCardObjectValidation.number}
  placeHolder="Número do cartão"
  min={cardInfo?.lengths?.[0]}
  max={cardInfo?.lengths?.[0]}
/>
<Views.TextEdit
  type={Types.TTextEdit.NAME}
  placeHolder="Nome impresso no cartão"
  bind:value={newCreditCardObject.holder}
  bind:isValid={newCreditCardObjectValidation.holder}
  initialValue={newCreditCardObject.holder}
  min={3}
  max={255}
/>
<Views.TextEdit
  mask="__/__"
  maskKey="_"
  type={Types.TTextEdit.NUMBER}
  placeHolder="Validade do cartão"
  bind:value={newCreditCardObject.validity}
  bind:isValid={newCreditCardObjectValidation.validity}
  min={4}
  max={4}
  error="Por favor preencha uma data válida usando este formato dd/YY."
/>
<Views.TextEdit
  mask={cardCodeMask}
  maskKey="_"
  type={Types.TTextEdit.NUMBER}
  placeHolder="Código de segurança do cartão"
  bind:value={newCreditCardObject.code}
  bind:isValid={newCreditCardObjectValidation.code}
  min={cardInfo?.code?.size}
  max={cardInfo?.code?.size}
/>
<Views.Divider />
<Views.Button on:click={openNewMethodAlert}>Adicionar</Views.Button>
<Views.GTerms />
{#if showNewMethodAlert}
  <Views.Alert
    title="Alerta"
    message="Ao continuar será gerada uma cobrança entre R$1,00 e R$1,99 por fins de validar seu cartão, logo em seguida essa cobrança será cancelada, podemos continuar?"
    closeCallBack={closeNewMethodAlert}
    buttons={[
      { name: 'Não', callback: closeNewMethodAlert },
      { name: 'Sim', callback: newCreditCard, principal: true },
    ]}
  />
{/if}

<style>
  h2 {
    text-align: center;
  }
</style>
