import { webEnv } from '../environments/environments';
import { useRouter } from 'next/navigation';

const { api } = webEnv;

// export function to use fetch episodes from /episodes endpoint
export async function fetchEpisodes() {
	try {
		const res = await fetch(`${api.apiUrl}/episodes`);

		if (res.ok) {
			return res.json();
		} else if (res.status === 401) {
			// Redirect to the login page if unauthorized
			useRouter().push('/auth');
		} else {
			throw new Error(`Error fetching episodes: ${res.statusText}`);
		}
	} catch (err) {
		console.log(err);
	}
}
