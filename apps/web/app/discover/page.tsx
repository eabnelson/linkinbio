'use client';

import { webEnv } from '../../environments/environments';
import Auth from '../auth/page';
import useSWR from 'swr';
const { api } = webEnv;

const fetchEpisodeData = async (url: string) => {
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
	const { data, error } = useSWR(`${api.apiUrl}/discover`, fetchEpisodeData);

	if (!data) return <div>Loading...</div>;

	if (data.status === 401) return <Auth />;

	if (error) return <div>An error has occurred.</div>;

	const { episodes } = data;

	return (
		<ul>
			{episodes.map((episode: any, index: number) => (
				<li key={index}>
					<div>
						<a href={episode.link} target="_blank" rel="noopener noreferrer">
							<div>{episode.link}</div>
						</a>
					</div>
				</li>
			))}
		</ul>
	);
}
