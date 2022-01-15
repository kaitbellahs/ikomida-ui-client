import {
	writable
} from 'svelte/store';
import {
	Storage
} from '@capacitor/storage';

const authToken = 'AuthToken';

function createAuth() {
	const {
		subscribe,
		set
	} = writable(null, async (setter) => {

		let token = null;
		try {
			const ret = await Storage.get({
				key: authToken
			});
			token = ret.value;
		} catch (error) {
			token = null;
			console.error(error);
		}
		if(token === "" || token === null) token = null;
		console.log(token);
		set(token);
	});

	return {
		subscribe,
		setToken: async (payload) => {
			set(payload);
			try {
				await Storage.set({
					key: authToken,
					value: payload
				});
			} catch (error) {
				console.error(error);
			}
		}
	};
}

export const Auth = createAuth();

function createUserInfo() {
	const {
		subscribe,
		set
	} = writable({
		avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAArHbV6gqS70hTQBiPnvI-mRMZw85ItexDw&usqp=CAU",
		name: "Folano de Santos e Diabos"
	});

	return {
		subscribe,
		setUserInfo: (info) => set(info)
	};
}

export const UserInfo = createUserInfo();