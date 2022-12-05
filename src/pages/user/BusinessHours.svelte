<script lang="ts">
  import { Views, Stores, Types } from '@ikomida/shared-frontend'
  import { onMount } from 'svelte'
  import { Settings } from '../../stores/Setup'
  const Layout = Stores.Layout.instance.store

  const days = [
    { name: 'Domingo', checked: false },
    { name: 'Segunda-feira', checked: false },
    { name: 'Terça-feira', checked: false },
    { name: 'Quarta-feira', checked: false },
    { name: 'Quinta-feira', checked: false },
    { name: 'Sexta-feira', checked: false },
    { name: 'Sabado', checked: false }
  ]

  $: twintyFourHours =
    ($Settings?.business?.hours?.filter(item => {
      return item.start === '0000' && item.end === '2359'
    })?.length ?? 0) > 0

  function numerToTime(object: string) {
    return `${object?.substring(0, 2)}h${object?.substring(2, 4)}`
  }

  onMount(() => Stores.Loading.instance.stop())

  Stores.Title.instance.set('Horario de funcionamento')
</script>

<jumbotron class="mainPicture">
  {#if $Settings?.profile?.mainPicture}
    <Views.Image
      source={$Settings?.profile?.mainPicture ?? 'assets/icons/transparent-logo-1.svg'}
      name={$Settings?.profile?.contractName ?? 'iKomida'}
    />
  {:else if $Settings?.profile?.contractName}
    <div class="avatarCircle">
      {$Settings?.profile?.contractName?.[0]}{$Settings?.profile?.contractName?.[1]}
    </div>
    <h2>{$Settings?.profile?.contractName}</h2>
  {:else}
    <Views.Image source="assets/icons/transparent-logo-1.svg" name="iKomida" />
    <h2>{$Settings?.profile?.contractName}</h2>
  {/if}
</jumbotron>
<content>
  {#if !$Settings?.business}
    <Views.LocalLoading size={2} />
  {:else if $Settings?.business?.days && $Settings?.business?.hours}
    <!-- {#if $Settings?.business?.days?.length === 7 && twintyFourHours}
    Estamos atendendo 24h/7
  {:else} -->
    <div
      class="shadow date"
      style="--buttonBackground: {$Layout?.button?.background ?? '#4c0708'};--buttonColor: {$Layout?.button?.color ??
        '#ffffff'};"
    >
      <h2 class="title">Dias de funcionamento</h2>
      <div class="data">
        {#if $Settings?.business?.days?.length === 7}
          <span class="shadow">Todos os dias da semana</span>
        {:else}
          {#each $Settings?.business?.days.sort((i1, i2) => i1 - i2) as day}
            <span class="shadow">{days?.[day]?.name || '-'}</span>
          {/each}
        {/if}
      </div>
    </div>
    <Views.Divider />
    <div
      class="shadow date"
      style="--buttonBackground: {$Layout?.button?.background ?? '#4c0708'};--buttonColor: {$Layout?.button?.color ??
        '#ffffff'};"
    >
      <h2 class="title">Horários de funcionamento</h2>
      <div class="data">
        {#if twintyFourHours}
          <span class="shadow">24h por dia</span>
        {:else}
          {#each $Settings?.business?.hours as businessHour}
            <span class="shadow"
              >das {numerToTime(businessHour?.start ?? '')} até {numerToTime(businessHour?.end ?? '')}
            </span>
          {/each}
        {/if}
      </div>
    </div>
  {:else}
    <Views.CentredMessage
      text="Estamos preparando tudo para tornarmos nosso atendimento online realidade, mas ainda não definimos os dias de funcionamento do estabelecimento, atualizamos aqui em breve, volte mais tarde para verificar ou entre em contato conosco!"
    />
  {/if}
</content>

<style>
  .date {
    display: flex;
    width: 100%;
    border-bottom: 1pt solid #ccc;
    padding: 16pt;
    font-size: 1.1em;
    flex-direction: column;
    place-content: center;
    align-items: center;
    border: 1pt solid var(--buttonBackground);
    border-radius: 8pt;
  }
  .date > div,
  .date > h2 {
    width: 100%;
    display: flex;
    flex-direction: row;
    place-content: center;
    align-items: center;
    flex-wrap: wrap;
  }
  .date > h2.title {
    border-bottom: 1pt solid var(--buttonBackground);
  }
  .date > div.data > span {
    display: flex;
    flex-direction: row;
    margin: 4pt;
    padding: 4pt 8pt;
    border: 1pt solid #fff;
    color: var(--buttonColor);
    background: var(--buttonBackground);
    border-radius: 8pt;
  }
  .date div.data > span:first-child {
    margin-left: 0;
  }
  .date div.data > span:last-child {
    margin-right: 0;
  }
</style>
