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
			//TODO: -- report errors
		}
		if(token === "" || token === null) token = null;
		setter(token);
	});

	return {
		subscribe,
		setToken: async (payload) => {
			try {
				set(payload);
				await Storage.set({
					key: authToken,
					value: payload
				});
			} catch (error) {
				//TODO: -- report errors
			}
		}
	};
}

export const Auth = createAuth();

function createPushNotificationToken() {
	const {
		subscribe,
		set
	} = writable();

	return {
		subscribe,
		setToken: (token) => set(token)
	};
}

export const PushNotificationToken = createPushNotificationToken();