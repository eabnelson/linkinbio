'use client';

import { webEnv } from '../../environments/environments';
import Auth from '../auth/page';
import useSWR from 'swr';
import Cookies from 'js-cookie';
const { api } = webEnv;

const fetchEpisodeData = async (url: string) => {
	const sessionData = Cookies.get('sessionData');
	const response = await fetch(url, {
		method: 'GET',
		credentials: 'include',
		headers: {
			Cookie: `sessionData=${sessionData}`
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
	const { data, error } = useSWR(`${api.apiUrl}/discover`, fetchEpisodeData);

	if (!data)
		return (
			<div className="text-center">
				<div className="flex h-screen items-center justify-center">
					<div className="mr-2 animate-spin">🎧</div>
					<h1>loading episode data</h1>
					<div className="ml-2 animate-spin">🎧</div>
				</div>
			</div>
		);

	if (data.status === 401) return <Auth />;

	if (error) return <div>an error has occurred.</div>;

	const { episodes } = data;

	return (
		<ul>
			{episodes.map((episode: any, index: number) => {
				if (episode.links.length === 0) {
					return null; // Skip the episode if the links array is empty
				}

				return (
					<li key={index}>
						<div className="my-4">
							<h3 className="text-lg font-bold">{episode.showName}</h3>
							{episode.links.map((link: any, linkIndex: number) => (
								<a
									href={link.link}
									key={linkIndex}
									target="_blank"
									rel="noopener noreferrer"
								>
									<div className="text-blue-500">{link.link}</div>
								</a>
							))}
						</div>
					</li>
				);
			})}
		</ul>
	);
}
