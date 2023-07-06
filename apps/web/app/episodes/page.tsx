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

	if (!data)
		return (
			<div className="text-center">
				<div className="flex h-screen items-center justify-center">
					<div className="mr-2 animate-spin">🎧</div>
					<h1>loading your episodes</h1>
					<div className="ml-2 animate-spin">🎧</div>
				</div>
			</div>
		);

	if (data.status === 401) return <Auth />;

	if (error) return <div>an error has occurred.</div>;

	const { episodes } = data;

	return (
		<div className="text-center">
			<ul>
				{episodes.map((episode: any) => (
					<li key={episode.episode.id} className="mb-4">
						<div className="text-lg">{episode.episode.name}</div>
						<div className="text-sm font-bold italic">{episode.episode.show.name}</div>
					</li>
				))}
			</ul>
		</div>
	);
}
