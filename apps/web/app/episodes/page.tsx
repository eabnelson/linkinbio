'use client';

import { webEnv } from '../../environments/environments';
import { useRouter } from 'next/navigation';
const { api } = webEnv;

export function useUserEpisodes() {
	const router = useRouter();

	const getUserEpisodes = async () => {
		try {
			const response = await fetch(`${api.apiUrl}/episodes`);

			if (response.ok) {
				const episodes = await response.json();
				return episodes;
			} else if (response.status === 401) {
				// Redirect to the login page if unauthorized
				router.push('/');
			} else {
				throw new Error(`Error fetching episodes: ${response.statusText}`);
			}
		} catch (err) {
			console.log(err);
		}
	};

	return getUserEpisodes;
}

export default async function Page() {
	const getUserEpisodes = useUserEpisodes();
	const episodes = await getUserEpisodes();

	return (
		<div>
			<h1>your episodes</h1>
			<ul>
				{episodes.map((episode: any) => (
					<li key={episode.episode.id}>
						<div>{episode.episode.name}</div>
						<div>{episode.episode.show.name}</div>
					</li>
				))}
			</ul>
		</div>
	);
}
