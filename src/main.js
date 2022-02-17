import App from './App.svelte';
import { Network } from '@tian/components';

// Network.createInstance("http://10.0.0.102:1988", "ProjX", "client");
Network.createInstance("http://10.0.0.102:1988", "projx.test-6", "client");
// Network.createInstance("http://192.168.0.104:1988", "ProjX", "client");

const app = new App({
	target: document.body
});

export default app;