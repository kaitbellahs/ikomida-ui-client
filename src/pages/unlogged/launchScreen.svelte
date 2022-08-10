<script>
  import { Title, Navigation, Routes, Menu } from "../../stores/Navigation";
  import { Views } from "@ikomida/components";
  import { StatusBar, Layout } from "../../stores/Setup";

  Title.set("Sem serviço");
</script>

<Views.NavigationBar
  {Layout}
  {Menu}
  {Title}
  paddingTop={$StatusBar.height}
  {Navigation}
/>
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
