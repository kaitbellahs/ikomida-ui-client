import {
	writable
} from 'svelte/store';

function createStatusBar() {
	const { subscribe, set } = writable({ style: null, visible: true, height: 0, bottomPadding: 0 });

	return {
		subscribe,
		setStatusBar: (info) => set(info)
	};
}

export const StatusBar = createStatusBar();

function createLayout() {
	const { subscribe, set } = writable({
		link: "#e8d130",
		background: "#dfdfdf",
		color: "#000000",
		header: {
			color: "#ffffff",
			background: "#4c0708",
			menuHamburger: "#ffffff",
		},
		tabs: { background: "#ffe4c4", color: "#4c0708" },
		button: { background: "#4c0708", color: "white" },
		dialog: { background: "#ffffffdf", color: "#4c0708" },
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
			contractName: null,
			identity: null,
			phone: null,
			email: null
		},
		business: {
			hours: [],
			days: []
		},
		isActive: null
	});

	return {
		subscribe,
		set: (info) => set(info)
	};
}

export const Settings = createSettings();