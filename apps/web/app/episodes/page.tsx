'use client';

import { webEnv } from '../../environments/environments';
import Auth from '../auth/page';
import useSWR from 'swr';
import Cookies from 'js-cookie';
const { api } = webEnv;

const fetchEpisodes = async (url: string) => {
	const jwt = Cookies.get('jwt');

	const response = await fetch(url, {
		method: 'GET',
		credentials: 'include',
		headers: {
			Authorization: `Bearer ${jwt}`
		}
	});

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
		<div className="flex justify-center">
			<ul className="text-center">
				{episodes.map((episode: any) => (
					<li key={episode.episode.id} className="mb-4 flex items-center">
						{episode.episode.images && episode.episode.images.length > 0 && (
							<img
								src={episode.episode.images[0].url}
								alt={episode.episode.name}
								className="mr-2 h-16 w-auto rounded-md"
							/>
						)}
						<div className="text-left">
							<div className="text-lg">
								<span>{episode.episode.name}</span>
							</div>
							<div className="text-sm font-bold italic">
								{episode.episode.show.name}
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
