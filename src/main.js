import App from './App.svelte';
import { Network } from '@ikomida/components';

let isProd = false
try {
    isProd = (isProduction !== undefined && isProduction)
} catch (error) {
}

Network.createInstance(isProd ? "https://api.ikomida.com" : "http://192.168.1.200", "${{iKomidaId}}$", "client", "6LebYzshAAAAAIXhka3WrAjus5tDXtefR1QefVZS");

const app = new App({
    target: document.body
});

export default app;