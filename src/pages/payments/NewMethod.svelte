<script>
    import { Title, Navigation } from "../../stores/Navigation";
    import { StatusBar } from "../../stores/Setup";
    import { Views } from "@ikomida/components";
    import { NewCard } from "../../network/Payment";
    import { Layout } from "../../stores/Setup";
    import creditCardType from "credit-card-type";

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

    $: if ((newCardObject?.number?.length ?? 0) <= 6) {
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
        if (
            (newCardObject?.holder?.length ?? 0) < 3 ||
            (newCardObject?.holder?.length ?? 0) > 255
        ) {
            toggleErrorAlert(`é obrigatorio o preencheemento do nome`);
        } else if (
            (newCardObject?.number?.length ?? 0) !== cardInfo?.lengths[0]
        ) {
            toggleErrorAlert(
                `é obrigatorio o preencheemento do nomenro do cartão`
            );
        } else if ((newCardObject?.validity?.length ?? 0) !== 4) {
            toggleErrorAlert(
                `é obrigatorio o preencheemento da validade do cartão`
            );
        } else if ((newCardObject?.code?.length ?? 0) !== cardInfo?.code.size) {
            toggleErrorAlert(
                `é obrigatorio o preencheemento do codigo de segurança`
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
            expMonth: newCardObject?.validity?.substring(0, 2),
            expYear: `20${newCardObject?.validity?.substring(2, 4)}`,
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
    bind:rawValue={newCardObject.number}
    bind:isValid={newCardObjectValidation.number}
    placeHolder="Numero do cartão"
/>
<Views.TextEdit
    type="name"
    placeHolder="Nome impresso no cartão"
    bind:value={newCardObject.holder}
/>
<Views.TextEdit
    mask="__/__"
    maskKey="_"
    type="number"
    placeHolder="Validade do cartão"
    bind:rawValue={newCardObject.validity}
    bind:isValid={newCardObjectValidation.validity}
/>
<Views.TextEdit
    mask={cardCodeMask}
    maskKey="_"
    type="number"
    placeHolder="Codigo de segurança do cartão"
    bind:rawValue={newCardObject.code}
    bind:isValid={newCardObjectValidation.code}
/>
<Views.TextEdit
    type="cpf"
    placeHolder="CPF vinculado com o cartão"
    bind:rawValue={newCardObject.cpf}
    bind:isValid={newCardObjectValidation.cpf}
/>
<Views.Divider />
<Views.Button {Layout} on:click={openNewMethodAlert}>Adicionar</Views.Button>
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
