<script lang="ts">
  import { Views, Stores, Types, Logics } from '@ikomida/shared-frontend'
  import { NewCreditCard } from '../../network/Payment'
  import creditCardType from 'credit-card-type'
  import { onMount } from 'svelte'
  import type { CreditCardType } from 'credit-card-type/dist/types'

  let newCreditCardObject: Types.Classes.CCreditCardRequest = Types.Classes.CCreditCardRequest.fillWith(null)
  let cardNumberMask = '____ ____ ____ ____'
  let cardCodeMask = '___'
  let cardBrandIcon: string
  let newCreditCardObjectValidation = {
    holder: false,
    validity: false,
    code: false,
    number: false
  }

  let cardInfo: CreditCardType
  let showNewMethodAlert = false

  $: if ((String(newCreditCardObject.number ?? '').length ?? 0) > 0) {
    const cardInfos = creditCardType(String(newCreditCardObject.number))
    if (cardInfos && (cardInfos?.length ?? 0) > 0) {
      cardInfo = cardInfos?.[0]
      let gapsIndex = 0
      cardNumberMask = ''
      for (let i = 1; i <= cardInfo?.lengths[0] ?? 0; i++) {
        cardNumberMask += '_'
        if (i == cardInfo?.gaps?.[gapsIndex]) {
          gapsIndex++
          cardNumberMask += ' '
        }
      }
      cardCodeMask = ''
      for (let i = 0; i < cardInfo?.code?.size; i++) {
        cardCodeMask += '_'
      }
      cardBrandIcon = `/assets/cardBrand/${cardInfo?.type?.toLowerCase() ?? ''}.svg`
    }
  }

  function openNewMethodAlert() {
    if (!newCreditCardObjectValidation?.number) {
      Stores.MessageAlert.instance.show(`é obrigatorio o preencheemento do Número do cartão`)
    } else if (!newCreditCardObjectValidation?.holder) {
      Stores.MessageAlert.instance.show(`é obrigatorio o preencheemento do nome`)
    } else if (!newCreditCardObjectValidation?.validity) {
      Stores.MessageAlert.instance.show(`é obrigatorio o preencheemento da validade do cartão`)
    } else if (!newCreditCardObjectValidation?.code) {
      Stores.MessageAlert.instance.show(`é obrigatorio o preencheemento do código de segurança`)
    } else {
      showNewMethodAlert = true
    }
  }

  function validateCardValidation(date: string) {
    const dateString = `20${date.substring(2, 4)}-${date.substring(0, 2)}-28`
    if (
      date.length !== 4 ||
      !Logics.Validations.validateDate(dateString) ||
      new Date(Number(`20${date.substring(2, 4)}`), Number(date.substring(0, 2)), 0) < new Date()
    ) {
      return false
    }
    return true
  }

  function closeNewMethodAlert() {
    showNewMethodAlert = false
  }

  async function newCreditCard() {
    showNewMethodAlert = false
    Stores.Loading.instance.start()
    newCreditCardObject.code = Number(newCreditCardObject.code)
    const response = await NewCreditCard(newCreditCardObject)
    if (response?.success) {
      Stores.Navigation.instance.pop()
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  onMount(() => {
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Novo cartão')
</script>

<data>
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
    min={cardInfo?.lengths?.[0] ?? 6}
    max={cardInfo?.lengths?.[0] ?? 6}
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
    validation={validateCardValidation}
    error="A data de validade do cartão deve ser uma data válida (12/26) maior que a data atual."
  />
  <Views.TextEdit
    mask={cardCodeMask}
    maskKey="_"
    type={Types.TTextEdit.NUMBER}
    placeHolder="Código de segurança do cartão"
    bind:value={newCreditCardObject.code}
    bind:isValid={newCreditCardObjectValidation.code}
    min={cardInfo?.code?.size ?? 3}
    max={cardInfo?.code?.size ?? 3}
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
        { name: 'Sim', callback: newCreditCard, principal: true }
      ]}
    />
  {/if}
</data>

<style>
  h2 {
    text-align: center;
  }
</style>
