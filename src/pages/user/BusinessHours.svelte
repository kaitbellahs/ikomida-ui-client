<script>
  import { Title } from "../../stores/Navigation";
  import { Views } from "@ikomida/components";
  import { Settings, Layout } from "../../stores/Setup";

  const days = [
    { name: "Domingo", checked: false },
    { name: "Segunda-feira", checked: false },
    { name: "Terça-feira", checked: false },
    { name: "Quarta-feira", checked: false },
    { name: "Quinta-feira", checked: false },
    { name: "Sexta-feira", checked: false },
    { name: "Sabado", checked: false },
  ];

  $: twintyFourHours =
    $Settings?.business?.hours?.filter((item) => {
      return item.start === "0000" && item.end === "2359";
    }).length > 0;

  function numerToTime(object) {
    return `${object?.substring(0, 2)}h${object?.substring(2, 4)}`;
  }
  Title.set("Horario de funcionamento");
</script>

{#if !$Settings?.business}
  <Views.LocalLoading size="2" />
{:else if $Settings?.business?.days && $Settings?.business?.hours}
  <!-- {#if $Settings?.business?.days?.length === 7 && twintyFourHours}
    Estamos atendendo 24h/7
  {:else} -->
  <div
    class="date"
    style="--buttonBackground: {$Layout?.button?.background ??
      '#4c0708'};--buttonColor: {$Layout?.button?.color ?? '#ffffff'};"
  >
    <h2 class="title">Dias de funcionamento</h2>
    <div class="data">
      {#if $Settings?.business?.days?.length === 7}
        <span>Todos os dias da semana</span>
      {:else}
        {#each $Settings?.business?.days as day}
          <span>{days?.[day]?.name || "-"}</span>
        {/each}
      {/if}
    </div>
  </div>
  <Views.Divider />
  <div
    class="date"
    style="--buttonBackground: {$Layout?.button?.background ??
      '#4c0708'};--buttonColor: {$Layout?.button?.color ?? '#ffffff'};"
  >
    <h2 class="title">Horários de funcionamento</h2>
    <div class="data">
      {#if twintyFourHours}
        <span>24h por dia</span>
      {:else}
        {#each $Settings?.business?.hours as businessHour}
          <span
            >das {numerToTime(businessHour?.start)} até {numerToTime(
              businessHour?.end
            )}
          </span>
        {/each}
      {/if}
    </div>
  </div>
  <!-- {/if} -->
{:else}
  <Views.CentredMessage
    text="Estamos preparando tudo para tornarmos nosso atendimento online realidade, mas ainda não definimos os dias de funcionamento do estabelecimento, atualizamos aqui em breve, volte mais tarde para verificar ou entre em contato conosco!"
  />
{/if}

<style>
  .date {
    display: flex;
    width: 100%;
    border-bottom: 1px solid #ccc;
    padding: 20px;
    font-size: 1.1em;
    flex-direction: column;
    place-content: center;
    align-items: center;
    border: 1px solid var(--buttonBackground);
    border-radius: 6px;
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
    border-bottom: 1px solid var(--buttonBackground);
  }
  .date > div.data > span {
    display: flex;
    flex-direction: row;
    padding: 10px 20px;
    margin: 10px 5px;
    border: 1px solid #fff;
    color: var(--buttonColor);
    background: var(--buttonBackground);
    border-radius: 6px;
  }
  .date div.data > span:first-child {
    margin-left: 0;
  }
  .date div.data > span:last-child {
    margin-right: 0;
  }
</style>
