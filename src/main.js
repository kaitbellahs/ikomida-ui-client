import App from './App.svelte';
import { Network } from '@ikomida/components';

const isProd = false
try{
    isProd = (isProduction !== undefined && isProduction) 
}catch(error){
}

Network.createInstance(isProd ? "https://api.ikomida.com" : "http://192.168.1.200", "com.ikomida.br.demo", "client", "6LebYzshAAAAAIXhka3WrAjus5tDXtefR1QefVZS");
// Network.createInstance("https://api.ikomida.com", "com.ikomida.br.tialtonivel", "client");

const app = new App({
	target: document.body
});

export default app;