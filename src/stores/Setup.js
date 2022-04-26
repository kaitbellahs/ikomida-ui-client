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

function createLayout() {
	const { subscribe, set } = writable({
		background: "#ccc",
		color: "#000",
		header: {
		  background: "#ffe4c4",
		  color: "#a52a2a",
		  menuHamburger: "black",
		},
		tabs: { background: "#ffe4c4" },
		button: { background: "#a52a2a", color: "white" },
	  });

	return {
		subscribe,
		set: (info) => set(info)
	};
}

export const Layout = createLayout();

function createSettings() {
	const { subscribe, set } = writable({
		profile: {
			areaCode: 55,
			mainPicture: null,
			restaurantName: null,
			identity: null,
			phone: null,
			email: null
		},
		business: {
			hours: [],
			days: []
		},
		isActive: false
	});

	return {
		subscribe,
		set: (info) => set(info)
	};
}

export const Settings = createSettings();