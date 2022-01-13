import {
    writable
} from 'svelte/store';

function createStatusBar() {
	const { subscribe, set } = writable({style: null, visible: true, height: 0, bottomPadding: 0});

	return {
		subscribe,
		setStatusBar: (info) => set(info)
	};
}

export const StatusBar = createStatusBar();