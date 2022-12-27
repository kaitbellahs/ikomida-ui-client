<script lang="ts">
  import { Views, Stores, Types, Utils } from '@ikomida/shared-frontend'
  import { onMount } from 'svelte'
  import { Settings } from '../../stores/Setup'
  const Layout = Stores.Layout.instance.store
  const today = new Date().getDay()

  $: twintyFourHours =
    ((Array.isArray($Settings?.business)
      ? $Settings?.business
      : [$Settings?.business as any as Types.Classes.CBusinessTime]
    )?.filter(item => {
      return isTwintyFourHours(item)
    })?.length ?? 0) === 7

  function isTwintyFourHours(businessTime: Types.Classes.CBusinessTime) {
    return (
      (businessTime.hours?.filter(hour => {
        return ['0000', '00:00'].includes(hour.start ?? '') && ['2359', '23:59'].includes(hour.end ?? '')
      }).length ?? 0) > 0
    )
  }

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
<content
  style="--buttonBackground: {$Layout?.button?.background ?? '#4c0708'};--buttonColor: {$Layout?.button?.color ??
    '#ffffff'};"
>
  {#if !$Settings?.business}
    <Views.LocalLoading size={2} />
  {:else if ($Settings?.business?.length ?? 0) > 0}
    {#if twintyFourHours}
      <div class="shadow busninessHours">24h/7</div>
    {:else}
      {#each $Settings?.business as businessDay}
        {#if Utils.Objects.isTrue(businessDay.day)}
          <Views.ExpandableBox
            title={Utils.Strings.days[businessDay.day ?? -1]}
            expand={businessDay.day === (today === 0 ? 7 : today - 1)}
          >
            {#if businessDay.hours && businessDay.hours.length > 0}
              {#if isTwintyFourHours(businessDay)}
                <span class="shadow busninessHours">24h</span>
              {:else}
                {#each businessDay.hours ?? [] as businessHour}
                  <div class="shadow busninessHours">
                    das {numerToTime(businessHour?.start ?? '')} até {numerToTime(businessHour?.end ?? '')}
                  </div>
                {/each}
              {/if}
            {:else}
              <span class="noExpedient">sem horário de expediente</span>
            {/if}
          </Views.ExpandableBox>
        {/if}
      {/each}
    {/if}
  {:else}
    <Views.CentredMessage
      text="Estamos preparando tudo para tornarmos nosso atendimento online realidade, mas ainda não definimos os dias de funcionamento do estabelecimento, atualizamos aqui em breve, volte mais tarde para verificar ou entre em contato conosco!"
    />
  {/if}
</content>

<style>
  .noExpedient {
    margin-top: 8pt;
  }
  .busninessHours {
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 8pt;
    border: 1pt solid #fff;
    color: var(--buttonColor);
    background: var(--buttonBackground);
    border-radius: 8pt;
    margin-top: 8pt;
    text-align: center;
    place-content: center;
  }
</style>
