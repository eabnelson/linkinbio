'use client';

import { webEnv } from '../../environments/environments';
import { useRouter } from 'next/navigation';
const { api } = webEnv;

export function useUserEpisodeData() {
	const router = useRouter();
	const getEpisodeData = async () => {
		try {
			const response = await fetch(`${api.apiUrl}/discover`);

			if (response.ok) {
				const data = await response.json();
				return data;
			} else if (response.status === 401) {
				router.push('/');
			} else {
				throw new Error(`Error fetching links: ${response.statusText}`);
			}
		} catch (error) {
			console.error(error);
		}
	};
	return getEpisodeData;
}

export default async function Page() {
	const getEpisodeData = useUserEpisodeData();
	const episodeData = await getEpisodeData();

	return (
		<div>
			<h1>discover</h1>
			<ul>
				{episodeData.map((episode: any, index: number) => (
					<li key={index}>
						<div>
							<a href={episode.link} target="_blank" rel="noopener noreferrer">
								<div>{episode.link}</div>
							</a>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
