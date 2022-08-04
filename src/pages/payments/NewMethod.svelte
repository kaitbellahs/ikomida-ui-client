<script>
    import { Title, Navigation } from "../../stores/Navigation";
    import { StatusBar } from "../../stores/Setup";
    import { Views } from "@ikomida/components";
    import { NewCard } from "../../network/Payment";
    import { Layout } from "../../stores/Setup";
    import creditCardType from "credit-card-type";

    let recaptcha = false;
    let isLoading = false;
    let newCardObject = {
        holder: null,
        validity: null,
        cpf: null,
        code: null,
        number: null,
    };
    let cardNumberMask = "____ ____ ____ ____";
    let cardCodeMask = "___";
    let cardBrandIcon;
    let newCardObjectValidation = {
        holder: false,
        validity: false,
        cpf: false,
        code: false,
        number: false,
    };

    let cardInfo;
    let errorAlert;
    let showAlert = false;
    let showNewMethodAlert = false;

    $: if ((newCardObject?.number?.length ?? 0) > 0) {
        const cardInfos = creditCardType(newCardObject?.number);
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

    function toggleErrorAlert(messageObject) {
        errorAlert = messageObject;
        showAlert = true;
    }

    function openNewMethodAlert() {
        if (!newCardObjectValidation?.holder) {
            toggleErrorAlert(`é obrigatorio o preencheemento do nome`);
        } else if (!newCardObjectValidation?.number) {
            toggleErrorAlert(
                `é obrigatorio o preencheemento do Número do cartão`
            );
        } else if (!newCardObjectValidation?.validity) {
            toggleErrorAlert(
                `é obrigatorio o preencheemento da validade do cartão`
            );
        } else if (!newCardObjectValidation?.code) {
            toggleErrorAlert(
                `é obrigatorio o preencheemento do código de segurança`
            );
        } else if (!newCardObjectValidation?.cpf) {
            toggleErrorAlert(`é obrigatorio o preencheemento do CPF`);
        } else {
            showNewMethodAlert = true;
        }
    }

    function closeNewMethodAlert() {
        showNewMethodAlert = false;
    }

    async function newCard() {
        showNewMethodAlert = false;
        isLoading = true;
        const newCard = {
            holder: newCardObject?.holder,
            number: newCardObject?.number,
            validity: newCardObject?.validity,
            code: newCardObject?.code,
            cpf: newCardObject?.cpf,
        };
        const response = await NewCard(newCard);
        if (response?.success) {
            Navigation.pop();
        } else {
            toggleErrorAlert(response?.data);
        }
        isLoading = false;
    }
    Title.set("Novo cartão");
</script>
<Views.Divider />
<h2>Preencha aqui os dados do seu cartão</h2>
<Views.Divider />
<Views.TextEdit
    mask={cardNumberMask}
    icon={cardBrandIcon}
    maskKey="_"
    type="number"
    bind:value={newCardObject.number}
    bind:isValid={newCardObjectValidation.number}
    placeHolder="Número do cartão"
    min={cardInfo?.lengths?.[0]}
    max={cardInfo?.lengths?.[0]}
/>
<Views.TextEdit
    type="name"
    placeHolder="Nome impresso no cartão"
    bind:value={newCardObject.holder}
    bind:isValid={newCardObjectValidation.holder}
    initialValue={newCardObject.holder}
    min="3"
    max="255"
/>
<Views.TextEdit
    mask="__/__"
    maskKey="_"
    type="number"
    placeHolder="Validade do cartão"
    bind:value={newCardObject.validity}
    bind:isValid={newCardObjectValidation.validity}
    min="4"
    max="4"
    error="Por favor preencha uma data válida usando este formato dd/YY."
/>
<Views.TextEdit
    mask={cardCodeMask}
    maskKey="_"
    type="number"
    placeHolder="Código de segurança do cartão"
    bind:value={newCardObject.code}
    bind:isValid={newCardObjectValidation.code}
    min={cardInfo?.code?.size}
    max={cardInfo?.code?.size}
/>
<Views.TextEdit
    type="cpf"
    placeHolder="CPF vinculado com o cartão"
    bind:value={newCardObject.cpf}
    bind:isValid={newCardObjectValidation.cpf}
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
            { name: "Sim", callback: newCard, principal: true },
        ]}
    />
{/if}
{#if isLoading}
    <Views.Loading
        topPadding={$StatusBar.height}
        bottomPadding={$StatusBar.bottomPadding}
    />
{/if}
<Views.MessageAlert {Layout} object={errorAlert} bind:show={showAlert} />

<style>
    h2 {
        text-align: center;
    }
</style>
