import App from './App.svelte';
import { Network } from '@ikomida/components';

Network.createInstance("http://localhost", "br.com.ikomida.default", "client");
// Network.createInstance("https://api.ikomida.com", "br.com.ikomida.default", "client");

const app = new App({
	target: document.body
});

export default app;