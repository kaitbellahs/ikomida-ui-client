<script>
  import { StatusBar } from "../stores/Setup";
  import { Title, Navigation, Menu } from "../stores/Navigation";
  import Fa from "svelte-fa";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  
  $: styleHeight = $StatusBar.height + "px";

  let showMenu = false;

  function goBack() {
    Navigation.pop();
  }

  function toggleMenu() {
    showMenu = !showMenu;
  }
</script>

<header class=shadow style="padding-top: {styleHeight};">
  {#if $Navigation.length > 1}
    <button id="backButton" on:click={goBack}
      ><Fa style="font-size: 1.7em;" icon={faChevronLeft} /></button
    >
  {/if}
  <h1 class:alone={$Navigation.length <= 1}>{$Title}</h1>
  {#if $Menu.length > 1}
    <div class="menu" on:click={toggleMenu}>
      <div />
      <div />
      <div />
    </div>
    <ul class="menu" class:showMenu>
      {#each $Menu as { icon, name, callback }}
        <li on:click={callback}>
          <Fa style="font-size: 1.5em;" {icon} />
          {name}
        </li>
      {/each}
    </ul>
  {:else if $Menu.length == 1}
    <button class="singleMenuItem" on:click={$Menu[0].callback}
      ><Fa style="font-size: 1.5em;" icon={$Menu[0].icon} /></button
    >
  {/if}
</header>

<style>
  div.menu {
    display: block;
    height: 50px;
    width: 10px;
    overflow: hidden;
    margin-right: 20px;
    /* background: black; */
  }
  div.menu > div {
    margin-top: 5px;
    background: black;
    display: block;
    width: 100%;
    height: 10px;
    border-radius: 5px;
  }
  ul.menu {
    display: none;
    position: fixed;
    right: 0;
    top: 50px;
    background: antiquewhite;
    list-style: none;
    padding: 0;
    min-width: 50%;
    max-width: 100%;
    overflow: hidden;
  }
  ul.menu > li {
    padding: 5px;
    border-bottom: 1px solid gray;
  }
  ul.showMenu {
    display: block;
  }
  .singleMenuItem {
    background: transparent;
    border: 0;
    margin-right: 10px;
  }
  .alone {
    margin-left: 20px;
  }
  header {
    position: fixed;
    top: 0;
    background: antiquewhite;
    color: brown;
    display: flex;
    min-width: 100%;
    max-height: 50px;
    height: 50px;
    min-height: 50px;
    padding: 0;
    max-width: 100%;
  }
  header > * {
    display: inline-block;
    margin: 0;
  }
  header > #backButton {
    font-weight: bold;
    background-color: transparent;
    border: 0;
    margin: 0;
    height: 50px;
    flex: 1 50px;
  }
  header > h1 {
    background-color: transparent;
    margin-left: 10px;
    border: 0;
    margin-top: 5px;
    flex: 1 calc(100% - 70px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 1.55em;
    padding: 0;
    margin: auto;
  }
</style>
