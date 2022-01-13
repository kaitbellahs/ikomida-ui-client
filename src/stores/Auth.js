import { writable } from 'svelte/store';

function createLogin() {
	const { subscribe, set } = writable(false);

	return {
		subscribe,
		setLogin: (success) => set(success)
	};
}

export const login = createLogin();

function createUserInfo() {
	const { subscribe, set } = writable({avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAArHbV6gqS70hTQBiPnvI-mRMZw85ItexDw&usqp=CAU", name: "Folano de Santos e Diabos"});

	return {
		subscribe,
		setUserInfo: (info) => set(info)
	};
}

export const UserInfo = createUserInfo();