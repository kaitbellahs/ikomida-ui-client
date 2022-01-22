import App from './App.svelte';
import { Network } from '@tian/components';

Network.createInstance("http://10.0.0.103:1988", "ProjX", "client");

const app = new App({
	target: document.body
});

export default app;