<script>
  import { Title } from "../../stores/Navigation";
  import { Views } from "@ikomida/components";
  import { Settings } from "../../stores/Setup";

  const days = [
    { name: "Domingo", checked: false },
    { name: "Segunda-feira", checked: false },
    { name: "Terça-feira", checked: false },
    { name: "Quarta-feira", checked: false },
    { name: "Quinta-feira", checked: false },
    { name: "Sexta-feira", checked: false },
    { name: "Sabado", checked: false },
  ];
  function numerToTime(object) {
    return `${object?.substring(0, 2)}h${object?.substring(2, 4)}`;
  }
  Title.set("Horario de funcionamento");
</script>

{#if !$Settings?.business}
  <Views.LocalLoading size="2" />
{:else if $Settings?.business?.days && $Settings?.business?.hours}
  <div class="days">
    <h3>Abrimos nestes dias:</h3>
    <br />
    {#if $Settings?.business?.days}
      {#each $Settings?.business?.days as day}
        <span>{days?.[day]?.name || "-"}, </span>
      {/each}
    {:else}
      <span>Não foi definido dias de funcionamento</span>
    {/if}
  </div>
  <Views.Divider />
  <div class="busninessHours">
    <h3>E nestes horários:</h3>
    <br />
    {#if $Settings?.business?.hours}
      {#each $Settings?.business?.hours as businessHour}
        <div class="TextValue">
          <div class="text">das {numerToTime(businessHour?.start)}</div>
          <div class="value">até {numerToTime(businessHour?.end)}</div>
        </div>
      {/each}
    {:else}
      <span>Não foi definido horários de funcionamento</span>
    {/if}
  </div>
{:else}
  <div id="noService">
    <h2>
      Ainda não estamos funcionando para delivery, mas estamos organizando a
      lojinha e abrimos em breve, volte mais tarde!
    </h2>
  </div>
{/if}

<style>
  #noService {
    display: flex;
    flex-direction: row;
    height: 100%;
  }
  #noService > h2 {
    place-self: center;
    align-self: center;
    justify-self: center;
    text-align: center;
  }
  .TextValue {
    width: 100%;
    display: flex;
    font-size: 1em;
  }
  .TextValue > .text {
    width: 50%;
    font-family: Roboto;
    text-align: right;
  }
  .TextValue > .value {
    margin-left: 10px;
    font-family: Roboto;
    width: 50%;
  }
  .days,
  .busninessHours {
    width: 100%;
    border-bottom: 1px solid #ccc;
    padding: 20px;
    font-size: 1.1em;
  }
</style>
