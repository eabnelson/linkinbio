'use client';

import { webEnv } from '../../environments/environments';
import Auth from '../auth/page';
import useSWR from 'swr';
const { api } = webEnv;

const fetchEpisodes = async (url: string) => {
	const response = await fetch(url);

	if (response.status === 401) {
		return {
			status: response.status,
			episodes: []
		};
	}

	const data = await response.json();

	return {
		status: response.status,
		episodes: [...data]
	};
};

export default function Page() {
	const { data, error } = useSWR(`${api.apiUrl}/episodes`, fetchEpisodes);

	if (!data) return <div>Loading...</div>;

	if (data.status === 401) return <Auth />;

	if (error) return <div>An error has occurred.</div>;

	const { episodes } = data;

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
