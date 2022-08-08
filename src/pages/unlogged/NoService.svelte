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
  <Views.CentredMessage
    text="Serviço suspenso, favor entrar em contato com o responsável pelo estabelecimento!"
    >Se você é o responsável pelo estabelecimento por favor entre em contato com
    o suporte.</Views.CentredMessage
  >
</main>
