import App from './App.svelte';
import { Network } from '@ikomida/components';

Network.createInstance("https://api.ikomida.com", "com.ikomida.br.default", "client");

const app = new App({
	target: document.body
});

export default app;