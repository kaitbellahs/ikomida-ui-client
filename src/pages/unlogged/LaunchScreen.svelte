<script>
  import { Views, Stores } from "@ikomida/components";
  import { StatusBar, Layout } from "../../stores/Setup";

  Stores.Title.instance.set("Sem serviço");
</script>

<Views.NavigationBar {Layout} paddingTop={$StatusBar.height} />
<main style="background: {$Layout.background};height: 100%;">
  <img src="assets/icons/transparent-logo-1.svg" alt="iKomida" />
  <h3>Carregando...</h3>
</main>

<style>
  main {
    align-items: center;
    place-content: center;
  }
  img {
    width: 100%;
  }
</style>
