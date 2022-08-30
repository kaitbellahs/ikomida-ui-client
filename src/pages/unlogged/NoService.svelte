<script>
  import { Views, Stores } from "@ikomida/components";
  import { onMount } from "svelte";
  import { StatusBar, Layout } from "../../stores/Setup";

  onMount(() => Stores.Loading.instance.stop());
  Stores.Title.instance.set("Sem serviço");
</script>

<Views.NavigationBar {Layout} paddingTop={$StatusBar.height} />
<main style="background: {$Layout.background};height: 100%;">
  <Views.CentredMessage
    text="Serviço suspenso, favor entrar em contato com o responsável pelo estabelecimento!"
    >Se você é o responsável pelo estabelecimento por favor entre em contato com
    o suporte.</Views.CentredMessage
  >
</main>
