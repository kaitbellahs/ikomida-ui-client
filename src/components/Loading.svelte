<script>
  import { StatusBar } from "../stores/Setup";
  import Fa from "svelte-fa";
  import { faSpinner } from "@fortawesome/free-solid-svg-icons";

  $: topMargin = $StatusBar.height + 50 + "px";
  $: styleBottomPadding = ($StatusBar.bottomPadding + 50) + "px";
</script>

<div style="--topMargin: {topMargin};--bottomPadding:{styleBottomPadding}">
  <Fa
    style="font-size: 3em;
position: relative;
top: 50%;
left:calc(50% - 0.5em);
color: white;"
    pulse={true}
    icon={faSpinner}
  />
</div>

<style>
  div {
    position: fixed;
    top: var(--topMargin);
    right: 0;
    left: 0;
    bottom: var(--bottomPadding);
    z-index: 99999;
    background: #000000df;
  }
</style>
