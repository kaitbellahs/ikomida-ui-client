<script>
  import { v4 as uuidV4 } from "uuid";
  import Fa from "svelte-fa";

  export let name;
  export let type;
  export let placeHolder;
  export let value;
  export let rawValue;
  export let buttonName;
  export let callback;
  export let icon;
  export let mask;
  export let maskKey = "X";

  $: if (value && mask != undefined) {
    rawValue = Array.from(value).filter(
      (char, index) => char != mask[index]
    );
    let index = 0;
    value = "";
    Array.from(mask).forEach((char) => {
      if (index < rawValue.length && char == maskKey) {
        value += rawValue[index];
        index++;
      } else {
        value += char;
      }
    });
  }

  $: switch (type) {
    case "phone":
      mask = "(XX) XXXXX-XXXX";
      break;
    case "cpf":
      mask = "XXX.XXX.XXX-XX";
      break;
    default:
      break;
  }

  const uuid = uuidV4();
</script>

<div class="leftShadow" style="padding:0;">
  {#if name != undefined}<label for={uuid}>{name || ""}</label> {/if}
  <div>
    {#if icon != undefined}
      <div class="icon">
        <Fa
          style="font-size: 1.5em; color: black; padding-left: 10px;"
          {icon}
        />
      </div>
    {/if}
    <input
      class:hasIcon={icon != undefined}
      class:hasButton={buttonName != undefined}
      autocomplete="off"
      bind:value
      placeholder={placeHolder}
      id={uuid}
      type="text"
    />
    {#if buttonName != undefined}
      <button class="button" on:click={callback}>{buttonName}</button>
    {/if}
  </div>
</div>

<style>
  div {
    width: 100%;
    display: flex;
    margin-top: 20px;
  }
  div > div {
    width: 100%;
    margin: 0;
  }
  div > div > input {
    width: 100%;
    background-color: #f2f2f2;
    height: 44px;
    border-radius: 4px;
    border: 0;
    margin: 0;
    -webkit-touch-callout: all;
    -webkit-user-select: all;
    -khtml-user-select: all;
    -moz-user-select: all;
    -ms-user-select: all;
    user-select: all;
  }
  .hasButton {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .hasIcon {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .button {
    background-color: #f2f2f2;
    border: 0;
    border-radius: 0;
    border-left: 1px solid #ccc;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    margin: 0;
    max-height: 44px;
  }
  .icon {
    border-right: 1px solid #ccc;
    background-color: #f2f2f2;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    margin-bottom: 8px;
    width: 50px;
    padding: 10px;
    margin: 0;
  }
</style>
