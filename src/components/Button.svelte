<script>
  import { StatusBar } from "../stores/Setup";

  export let type = "default";
  export let isFloat = false;

  $: float = isFloat ? "position: fixed; left: 2px; right: 0; bottom: "+ ($StatusBar.bottomPadding + 45) + "px;" : "";

  let background = "red";
  let color = "white";
  
  switch (type) {
    case "transparent":
      background = "transparent";
      color = "red";
      break;
    case "secondary":
      background = "gray";
      break;
    default:
      break;
  }
</script>

<button
  style="--background:{background};--color:{color};{float}"
  class={type !== "transparent" ? "leftShadow" : ""}
  on:click><slot /></button
>

<style>
  button {
    height: 40px;
    width: calc(100% - 4px);
    color: var(--color);
    background: var(--background);
    border-radius: 4px;
    border: 0;
  }
</style>
