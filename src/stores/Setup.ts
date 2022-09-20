import {
	writable
} from 'svelte/store';
import { StatusBarInfo, Style } from '@ikomida/capacitor-plugin-status-bar';
import { Types } from '@ikomida/shared-frontend';

export interface StatusBarType extends StatusBarInfo {
	topMargin?: number
	visible: boolean
	height: number
	bottomPadding: number
}

function createStatusBar() {
	const { subscribe, set } = writable<StatusBarType>({ style: Style.Default, visible: true, height: 0, bottomPadding: 0, topMargin: 0 });

	return {
		subscribe,
		setStatusBar: (info: StatusBarType) => set(info)
	};
}

export const StatusBar = createStatusBar();

function createSettings() {
	const { subscribe, set } = writable(Types.Classes.CVendorSettings.fromObject({
		profile: {
			areaCode: 55,
			mainPicture: '',
			contractName: '',
			identity: '',
			phone: '',
			email: ''
		},
		business: {
			hours: [],
			days: []
		},
		isActive: ''
	}));

	return {
		subscribe,
		set: (info: Types.Classes.CVendorSettings) => set(info)
	};
}

export const Settings = createSettings();