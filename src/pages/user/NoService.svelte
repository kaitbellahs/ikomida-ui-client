<script>
    import { Title, Navigation, Routes, Menu } from "../../stores/Navigation";
    import { Views } from "@tian/components";
    import { StatusBar, Layout } from "../../stores/Setup";
    
    $: styleHeight = `${Number($StatusBar.height) + 50}px`;
  
    Title.set("Sem serviço");
  </script>
  
  <Views.NavigationBar
    {Layout}
    {Menu}
    {Title}
    paddingTop={$StatusBar.height}
    {Navigation}
  />
  <main
    style="margin-top:{styleHeight};padding: 20px; padding-top: 0; padding-bottom: 0; overflow: hidden;max-width: 100%;background: {$Layout.background};height: 100%;"
  >
  <h2>Serviço suspenso, favor entrar em contato com o responsável pelo estabelecimento!</h2>
  </main>
  
  <style>
    main {
      text-align: center;
      padding: 1em;
      min-width: 90%;
      margin: 0 auto;
    }
    h2 {
        text-align: center;
        margin: 20px;
    }
  </style>
  