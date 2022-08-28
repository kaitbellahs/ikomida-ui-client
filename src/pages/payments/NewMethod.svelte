<script>
    import { Layout, StatusBar } from "../../stores/Setup";
    import { Views, Stores } from "@ikomida/components";
    import { NewCreditCard } from "../../network/Payment";
    import creditCardType from "credit-card-type";
    import { onMount } from "svelte";

    let newCreditCardObject = {
        holder: null,
        validity: null,
        code: null,
        number: null,
    };
    let cardNumberMask = "____ ____ ____ ____";
    let cardCodeMask = "___";
    let cardBrandIcon;
    let newCreditCardObjectValidation = {
        holder: false,
        validity: false,
        code: false,
        number: false,
    };

    let cardInfo;
    let errorAlert;
    let showAlert = false;
    let showNewMethodAlert = false;

    $: if ((newCreditCardObject?.number?.length ?? 0) > 0) {
        const cardInfos = creditCardType(newCreditCardObject?.number);
        if (cardInfos && (cardInfos?.length ?? 0) > 0) {
            cardInfo = cardInfos?.[0];
            let gapsIndex = 0;
            cardNumberMask = "";
            for (let i = 1; i <= cardInfo?.lengths[0] ?? 0; i++) {
                cardNumberMask += "_";
                if (i == cardInfo?.gaps?.[gapsIndex]) {
                    gapsIndex++;
                    cardNumberMask += " ";
                }
            }
            cardCodeMask = "";
            for (let i = 1; i <= cardInfo?.code?.size; i++) {
                cardCodeMask += "_";
            }
            cardBrandIcon = `/assets/cardBrand/${
                cardInfo?.type?.toLowerCase() ?? ""
            }.svg`;
        }
    }

    function openNewMethodAlert() {
        if (!newCreditCardObjectValidation?.holder) {
            Stores.MessageAlert.instance.show(
                `é obrigatorio o preencheemento do nome`
            );
        } else if (!newCreditCardObjectValidation?.number) {
            Stores.MessageAlert.instance.show(
                `é obrigatorio o preencheemento do Número do cartão`
            );
        } else if (!newCreditCardObjectValidation?.validity) {
            Stores.MessageAlert.instance.show(
                `é obrigatorio o preencheemento da validade do cartão`
            );
        } else if (!newCreditCardObjectValidation?.code) {
            Stores.MessageAlert.instance.show(
                `é obrigatorio o preencheemento do código de segurança`
            );
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
        const newCreditCard = {
            holder: newCreditCardObject?.holder,
            number: newCreditCardObject?.number,
            validity: newCreditCardObject?.validity,
            code: newCreditCardObject?.code,
            cpf: newCreditCardObject?.cpf,
        };
        const response = await NewCreditCard(newCreditCard);
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
    Stores.Title.instance.set("Novo cartão");
</script>

<Views.Divider />
<h2>Preencha aqui os dados do seu cartão</h2>
<Views.Divider />
<Views.TextEdit
    {Layout}
    mask={cardNumberMask}
    icon={cardBrandIcon}
    maskKey="_"
    type="number"
    bind:value={newCreditCardObject.number}
    bind:isValid={newCreditCardObjectValidation.number}
    placeHolder="Número do cartão"
    min={cardInfo?.lengths?.[0]}
    max={cardInfo?.lengths?.[0]}
/>
<Views.TextEdit
    {Layout}
    type="name"
    placeHolder="Nome impresso no cartão"
    bind:value={newCreditCardObject.holder}
    bind:isValid={newCreditCardObjectValidation.holder}
    initialValue={newCreditCardObject.holder}
    min="3"
    max="255"
/>
<Views.TextEdit
    {Layout}
    mask="__/__"
    maskKey="_"
    type="number"
    placeHolder="Validade do cartão"
    bind:value={newCreditCardObject.validity}
    bind:isValid={newCreditCardObjectValidation.validity}
    min="4"
    max="4"
    error="Por favor preencha uma data válida usando este formato dd/YY."
/>
<Views.TextEdit
    {Layout}
    mask={cardCodeMask}
    maskKey="_"
    type="number"
    placeHolder="Código de segurança do cartão"
    bind:value={newCreditCardObject.code}
    bind:isValid={newCreditCardObjectValidation.code}
    min={cardInfo?.code?.size}
    max={cardInfo?.code?.size}
/>
<Views.Divider />
<Views.Button {Layout} on:click={openNewMethodAlert}>Adicionar</Views.Button>
<Views.GTerms />
{#if showNewMethodAlert}
    <Views.Alert
        {Layout}
        title="Alerta"
        message="Ao continuar será gerada uma cobrança entre R$1,00 e R$1,99 por fins de validar seu cartão, logo em seguida essa cobrança será cancelada, podemos continuar?"
        closeCallBack={closeNewMethodAlert}
        buttons={[
            { name: "Não", callback: closeNewMethodAlert },
            { name: "Sim", callback: newCreditCard, principal: true },
        ]}
    />
{/if}

<style>
    h2 {
        text-align: center;
    }
</style>
