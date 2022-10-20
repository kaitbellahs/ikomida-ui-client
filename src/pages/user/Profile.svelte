<script lang="ts">
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { onMount } from 'svelte'
  import { updatePassword, logout } from '../../network/Auth'
  import { UpdateAvatar, profile } from '../../network/User'
  const Layout = Stores.Layout.instance.store

  let userInfo: Types.Classes.CUser
  let avatar: string | undefined = undefined

  let passwordObject: Types.Classes.CUser = Types.Classes.CUser.fillWith(null)
  let passwordValidationObject = {
    newPass: false,
    reNewPass: false
  }

  $: if (userInfo?.avatar && userInfo?.avatar !== avatar) {
    updateAvatar()
  }

  async function updateAvatar() {
    Stores.Loading.instance.start()
    let response = await UpdateAvatar(userInfo)
    if (response.success) {
      avatar = userInfo?.avatar
      Stores.MessageAlert.instance.show('A sua foto de perfil foi atualizada com sucesso!')
    } else {
      userInfo.avatar = avatar
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  async function out() {
    Stores.Loading.instance.start()
    await logout()
    Stores.Loading.instance.stop()
  }

  async function editPassword() {
    if (!passwordValidationObject.newPass) {
      Stores.MessageAlert.instance.show('A nova senha não está correta!')
      return
    } else if (!passwordValidationObject.reNewPass) {
      Stores.MessageAlert.instance.show('A confirmação da senha não está correta')
      return
    }
    Stores.Loading.instance.start()
    let response = await updatePassword(passwordObject)
    if (response.success) {
      Stores.MessageAlert.instance.show('Senha atualizada com sucesso!')
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  onMount(async () => {
    let response = await profile()
    if (response?.success) {
      userInfo = Types.Classes.CUser.fromObject(response?.data)
      avatar = userInfo.avatar
    } else {
      Stores.MessageAlert.instance.show('Não foi possível carregar os dados do seu perfil!')
      userInfo = await Utils.Jws.extractToken((await Stores.Auth.Auth.instance.data()) ?? '')
    }
    Stores.Loading.instance.stop()
  })

  function validatePassword(password: string) {
    return passwordObject.newPass === password
  }

  Stores.Title.instance.set('Perfil')
</script>

{#if userInfo}
  <Views.UploadablePhoto
    type={Types.TUploadablePhoto.PROFILE}
    bind:image={userInfo.avatar}
    name={userInfo.name[0]}
    lastName={userInfo.lastName[0]}
  />
  <Views.Divider />
  <div class="data" style="--color:{$Layout?.button?.background ?? '#4c0708'};">
    <h2 class="name">{userInfo.name} {userInfo.lastName}</h2>
    <Views.Divider />
    <Views.TextValue
      text="CPF:"
      value={Utils?.Strings?.formatString(/\d/gi, '___.___.___-__', '_', userInfo?.identity)}
      fontSize="1.3em"
      leftMargin={30}
    />
    <Views.TextValue
      text="Telefone:"
      value={Utils?.Strings?.formatString(/\d/gi, '(__) _____-____', '_', userInfo?.phone)}
      fontSize="1.3em"
      leftMargin={30}
    />
    <Views.TextValue text="mail:" value={userInfo.email} fontSize="1.3em" leftMargin={30} />
    <Views.Divider />
    <h2>Senha</h2>
    <Views.TextEdit type={Types.TTextEdit.PASSWORD} placeHolder="Senha atual" bind:value={passwordObject.oldPass} />
    <Views.TextEdit
      type={Types.TTextEdit.PASSWORD}
      placeHolder="Nova senha"
      bind:value={passwordObject.newPass}
      bind:isValid={passwordValidationObject.newPass}
      error="A senha deve ter um tamanho entre 8 e 40 caracteres e contendo no mínimo
        uma letra maiúscula, uma letra minúscula, um número e um símbolo"
    />
    <Views.TextEdit
      type={Types.TTextEdit.PASSWORD}
      placeHolder="Confirmação"
      bind:value={passwordObject.reNewPass}
      bind:isValid={passwordValidationObject.reNewPass}
      validation={validatePassword}
      error="A confirmação da senha não é válida"
    />
    <Views.Divider />
  </div>
  <Views.Button on:click={editPassword}>Atualizar senha</Views.Button>
  <Views.Button type={Types.TButton.TRANSPARENT} on:click={out}>Logout</Views.Button>
  <Views.GTerms />
{/if}

<style>
  h2 {
    text-align: center;
  }
  h2.name {
    color: var(--color);
  }
</style>
