<script>
  import Fa from "svelte-fa";
  
  export let title;
  export let message;
  export let buttons = [];
  export let closeCallBack;
  const handle_keydown = e => {
		if (e.key === 'Escape') {
			closeCallBack();
			return;
		}
  }
</script>


<svelte:window on:keydown={handle_keydown}/>
<div on:click|self={closeCallBack}>
  <div>
    <header>
      <h2>{title}</h2>
    </header>
    <p>{message}</p>
    <footer>
      {#each buttons as { name, icon, callback }}
        <button on:click={callback}>
          {#if icon != undefined}
            <Fa style="font-size: 1.7em;" {icon} />
          {/if}
          {name}
        </button>
      {/each}
    </footer>
  </div>
</div>

<style>
  div > div > header > h2 {
    margin: 0;
  }
  div > div > footer > button {
      margin: 0;
  }
  div > div > footer {
      width: 100%;
      position: absolute;
      bottom: 20px;
  }
  div {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: #000000cc;
    z-index: 9999;
    color: white;
  }
  div > div {
    background: #000000df;
    min-height: 40%;
    min-width: 80%;
    height: 40%;
    width: 80%;
    padding: 20px;
    position: relative;
    top: 20%;
    left: 5%;
    right: 5%;
  }
</style>
