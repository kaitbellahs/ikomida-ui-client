<script lang="ts">
  import Routes from '../../stores/Routes'
  import { Views, Stores, Types } from '@ikomida/shared-frontend'
  import { StatusBar } from '../../stores/Setup'
  import { faUser } from '@fortawesome/free-solid-svg-icons'
  import { onMount } from 'svelte'
  import { getTermOfUse } from '../../network/Terms'

  const Layout = Stores.Layout.instance.store

  let subscribeObject: Types.Classes.CUser = Types.Classes.CUser.fillWith(null)

  let isValidCPF = false
  let isValidEmail = false
  let isValidPassword = false

  $: canContinue =
    subscribeObject?.name &&
    (subscribeObject?.name?.length ?? 0) <= 255 &&
    subscribeObject?.lastName &&
    (subscribeObject?.lastName?.length ?? 0) <= 255 &&
    isValidCPF &&
    isValidEmail &&
    (subscribeObject?.email?.length ?? 0) <= 255 &&
    isValidPassword

  async function doSubscribe() {
    Stores.Navigation.instance.goTo(Routes.confirmSubscribe, subscribeObject)
  }

  async function goToTAC() {
    Stores.Navigation.instance.goTo(Routes.tac)
  }

  async function goToPP() {
    Stores.Navigation.instance.goTo(Routes.pp)
  }

  onMount(async () => {
    const term = await getTermOfUse()
    if (term) {
      subscribeObject.termId = term?.id
    }
    subscribeObject.areaCode = '55'
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Criar conta')
</script>

<h2>Falta pouco para se tornar um usuário digital do nosso estabelecimento.</h2>
<small>É só preencher todas as informações do formulário e depois clicar em <b>“continuar”</b>.</small>
<Views.TextEdit
  icon={faUser}
  bind:value={subscribeObject.name}
  initialValue={subscribeObject.name}
  type={Types.TTextEdit.NAME}
  placeHolder="Nome"
/>
<Views.TextEdit
  icon={faUser}
  bind:value={subscribeObject.lastName}
  initialValue={subscribeObject.lastName}
  type={Types.TTextEdit.NAME}
  placeHolder="Sobrenome"
/>
<Views.TextEdit
  bind:value={subscribeObject.identity}
  type={Types.TTextEdit.CPF}
  placeHolder="CPF"
  bind:isValid={isValidCPF}
/>
<Views.TextEdit
  type={Types.TTextEdit.EMAIL}
  bind:value={subscribeObject.email}
  placeHolder="E-mail"
  bind:isValid={isValidEmail}
/>
<Views.TextEdit
  type={Types.TTextEdit.PASSWORD}
  bind:value={subscribeObject.password}
  placeHolder="Senha"
  bind:isValid={isValidPassword}
  error="A senha deve ter um tamanho entre 8 e 40 caracteres e contendo no mínimo
  uma letra maiúscula, uma letra minúscula, um número e um símbolo"
/>
<Views.Divider />
<Views.Button disabled={!canContinue} on:click={doSubscribe}>Cadastrar</Views.Button>

<Views.Divider />
<small
  >Ao confirmar você concorda com <a href="#/" on:click={goToTAC}>termos de uso</a>
  e nossa <a on:click={goToPP} href="#/">politica de privacidade</a></small
>
