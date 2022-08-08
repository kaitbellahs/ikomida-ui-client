<script>
  import { Title, Navigation, Menu } from "../../stores/Navigation";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Utils } from "@ikomida/components";
  import { onMount } from "svelte";
  import { getPrivacyPolicy } from "../../network/Terms";
  import { Layout } from "../../stores/Setup";

  Title.set("Política de privacidade");

  $: styleHeight = `${Number($StatusBar.height) + 50}px`;
  let term;
  let isLoading = false;

  onMount(async () => {
    isLoading = true;
    term = await getPrivacyPolicy();
    if (term) {
      Title.set(term?.name);
    }
    isLoading = false;
  });
</script>

<Views.NavigationBar
  {Layout}
  {Menu}
  {Title}
  paddingTop={$StatusBar.height}
  {Navigation}
/>
<main
  style="margin-top:{styleHeight};padding: 20px; padding-top: 0; padding-bottom: 0; overflow: hidden;max-width: 100%;"
>
  <Views.Divider />
  <div class="container">
    {#if term}
      <div class="jambtron">
        <h1>{term?.name}</h1>
        <Views.Divider />
        <h2>id: #{term?.id}</h2>
        <h3>
          Grava esse código de identificação em algum lugar, ele é a
          identificação do termo que você está assinando.
        </h3>
      </div>
      <div class="content">
        {@html term?.body}
      </div>
      <small
        >Data do termo: {Utils.Strings.dateToDateString(term?.createdAt)}</small
      >
    {:else}
      <h2 class="error">
        Ocorreu um erro, não conclua o seu pedido sem ler o termo e entre em
        contato com a gente
      </h2>
    {/if}
  </div>

  {#if isLoading}
    <Views.Loading />
  {/if}
</main>

<style>
  .jambtron {
    display: flex;
    flex-direction: column;
    /* align-items: center; */
    place-content: center;
    margin-bottom: 30px;
    min-height: 20vh;
    background: #cccccc25;
    border-radius: 10px;
    box-shadow: 1px 2px #cccccc33;
    width: 100%;
    padding: 20px;
  }
  .jambtron > h1 {
    align-self: center;
    place-self: center;
  }
  .container {
    text-align: justify;
  }
  .container > * {
    text-align: justify;
  }
  .container > h2 {
    font-size: 1.5em;
    text-align: center;
  }
  .container > .content,
  .container > small {
    text-align: justify;
  }
</style>
