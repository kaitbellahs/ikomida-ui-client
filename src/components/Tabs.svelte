<script>
  import { Navigation } from "../stores/Navigation.js";
  import Fa from "svelte-fa";
  import { StatusBar } from "../stores/Setup";

  export let tabs;

  $: baseRoute = $Navigation[0].route;
  $: size = Math.round(100 / tabs.length) + "%";
  $: styleBottomPadding = $StatusBar.bottomPadding + "px";

  function onClick(route) {
    Navigation.reset(route);;
  }
</script>

<footer style="--size:{size};--bottomPadding:{styleBottomPadding}">
  {#each tabs as { name, route, icon }}
    <button
      id={name}
      class:selected={baseRoute === route}
      on:click={onClick(route)}
      ><Fa {icon} style="vertical-align: middle;align-self: center;" />
      <span class="center">{name}</span></button
    >
  {/each}
</footer>

<style>
  footer {
    position: fixed;
    bottom: 0;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-around;
    align-items: stretch;
    min-width: 100%;
    background: gray;
    z-index: 9999;
    padding-bottom: var(--bottomPadding);
  }
  footer > button {
    border: 0;
    background: transparent;
    display: flex;
    flex: 1 var(--size);
    align-self: center;
    margin: 0;
    height: 50px;
    text-align: center;
    justify-content: center;
    flex-direction: column;
  }

  footer > button > * {
    vertical-align: middle;
    align-self: center;
  }

  footer > .selected {
    background-color: bisque;
  }
</style>
