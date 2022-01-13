<script>
    import { Title, Navigation, Router } from "../../stores/Navigation";
    import NavigationBar from "../../components/NavigationBar.svelte";
    import { StatusBar } from "@capacitor/status-bar";
    import { onMount } from "svelte";
    
    Title.set("Perfil");
  
    let statusBarInfo = { style: null, visible: true, height: 0 };
  
    $: styleHeight = statusBarInfo.height + 55 + "px";
    onMount(async () => {
      if (Capacitor.isNativePlatform()) {
        statusBarInfo = await StatusBar.getInfo();
      }
    });
  </script>
  
  <NavigationBar />
  <main style="padding: 20px; padding-top: {styleHeight}; overflow: hidden;max-width: 100%;">
    dsd
  </main>