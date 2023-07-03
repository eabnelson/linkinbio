import { webEnv } from '../environments/environments';
import { useRouter } from 'next/navigation';

const { api } = webEnv;

export async function getUserEpisodes() {
	try {
		const response = await fetch(`${api.apiUrl}/episodes`);

		if (response.ok) {
			const episodes = await response.json();
			return episodes;
		} else if (response.status === 401) {
			// Redirect to the login page if unauthorized
			useRouter().push('/');
		} else {
			throw new Error(`Error fetching episodes: ${response.statusText}`);
		}
	} catch (err) {
		console.log(err);
	}
}

export async function getEpisodeData() {
	try {
		const response = await fetch(`${api.apiUrl}/discover`);
		if (response.ok) {
			const data = await response.json();
			return data;
		} else if (response.status === 401) {
			useRouter().push('/');
		} else {
			throw new Error(`Error fetching links: ${response.statusText}`);
		}
	} catch (error) {
		console.error(error);
	}
}
