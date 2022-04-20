<script>
  import { Title } from "../../stores/Navigation";
  import { Views } from "@tian/components";
  import { Layout, Settings } from "../../stores/Setup";

  const days = [
    { name: "Domingo", checked: false },
    { name: "Segunda-feira", checked: false },
    { name: "Terça-feira", checked: false },
    { name: "Quarta-feira", checked: false },
    { name: "Quinta-feira", checked: false },
    { name: "Sexta-feira", checked: false },
    { name: "Sabado", checked: false },
  ];

  Title.set("Horario de funcionamento");
</script>

{#if !$Settings?.business}
  <Views.LocalLoading size="2" />
{:else}
  <div class="days">
    <h3>Abrimos nestes dias:</h3>
    <br />
    {#each $Settings?.business?.days as day}
      <span>{days?.[day]?.name || "-"}, </span>
    {/each}
  </div>
  <Views.Divider />
  <div class="busninessHours">
    <h3>E nestes horarios:</h3>
    <br />
    {#each $Settings?.business?.hours as businessHour}
      <div class="TextValue">
        <div class="text">{`de ${businessHour?.start}`}</div>
        <div class="value">{`até ${businessHour?.end}`}</div>
      </div>
    {/each}
  </div>
{/if}

<style>
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

  .edit {
    flex-grow: 1;
    text-align: end;
  }
</style>
